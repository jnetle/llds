'use server';

import { attachFileToTask, createInquiryTask, updateTaskDescription } from '@/lib/clickup';
import { toFullMarkdown, toSummaryMarkdown, toTaskName } from '@/lib/inquiryPayload';
import { inquirySchema, type InquiryInput } from '@/lib/inquirySchema';

export type SubmitResult = { ok: true } | { ok: false; error: string };

/**
 * Render the questionnaire to PDF, or `null` if react-pdf cannot lay it out.
 *
 * The import is dynamic so `@react-pdf/renderer` and its fonts are only pulled
 * in when someone actually submits, rather than on every request that touches
 * this module.
 */
async function renderPdf(data: InquiryInput, submittedAt: string): Promise<{ filename: string; bytes: Buffer } | null> {
  try {
    const { renderInquiryPdf, inquiryPdfFilename } = await import('@/lib/pdf/inquiryDocument');
    return {
      filename: inquiryPdfFilename(data, submittedAt),
      bytes: await renderInquiryPdf(data, submittedAt)
    };
  } catch (err) {
    console.error('Failed to render the inquiry PDF; falling back to a full markdown description', err);
    return null;
  }
}

export async function submitInquiry(raw: unknown): Promise<SubmitResult> {
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'Please review the form and try again.' };
  }

  if (parsed.data.website.length > 0) {
    return { ok: true };
  }

  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID;
  if (!token || !listId) {
    console.error('Inquiry submission failed: CLICKUP_API_TOKEN or CLICKUP_LIST_ID is not set.');
    return { ok: false, error: 'Inquiry system is not configured. Please email us directly.' };
  }

  const data = parsed.data;
  const submittedAt = new Date().toISOString();

  // Render before writing anything to ClickUp. Doing it in this order means the
  // description can be chosen once, with certainty, instead of being patched
  // after the fact — and there is no state where both the PDF and the answers
  // are missing from the task.
  const pdf = await renderPdf(data, submittedAt);
  const fullMarkdown = toFullMarkdown(data, submittedAt);

  const created = await createInquiryTask({
    token,
    listId,
    name: toTaskName(data),
    markdown: pdf ? toSummaryMarkdown(data, submittedAt) : fullMarkdown
  });

  if (!created.ok) {
    // createInquiryTask has already logged the reason; the visitor gets a retry
    // prompt rather than a false success, so a ClickUp outage never swallows a lead.
    return { ok: false, error: 'Could not reach our system. Please try again in a moment.' };
  }

  if (pdf) {
    const attached = await attachFileToTask({
      token,
      taskId: created.taskId,
      filename: pdf.filename,
      bytes: pdf.bytes
    });

    // The task exists either way, so this is not worth failing the submission
    // over — but the summary description alone would lose most of the answers,
    // so put the full questionnaire back.
    if (!attached) {
      await updateTaskDescription({ token, taskId: created.taskId, markdown: fullMarkdown });
    }
  }

  return { ok: true };
}
