'use server';

import { headers } from 'next/headers';
import { after } from 'next/server';
import { attachFileToTask, createInquiryTask, updateTaskDescription } from '@/lib/clickup';
import { sendEmail } from '@/lib/email';
import { confirmationHtml, confirmationSubject, confirmationText } from '@/lib/inquiryEmail';
import { toFullMarkdown, toSummaryMarkdown, toTaskName } from '@/lib/inquiryPayload';
import { allow } from '@/lib/rateLimit';
import { inquirySchema, type InquiryInput } from '@/lib/inquirySchema';

export type SubmitResult = { ok: true } | { ok: false; error: string };

/** Render the questionnaire to PDF, or `null` if react-pdf cannot lay it out. Dynamic import so it loads on submit only. */
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

  // Render before writing to ClickUp: the description is then chosen once, with certainty, and there is no state
  // where both the PDF and the answers are missing from the task.
  const pdf = await renderPdf(data, submittedAt);
  const fullMarkdown = toFullMarkdown(data, submittedAt);

  const created = await createInquiryTask({
    token,
    listId,
    name: toTaskName(data),
    markdown: pdf ? toSummaryMarkdown(data, submittedAt) : fullMarkdown
  });

  if (!created.ok) {
    // Already logged by createInquiryTask. A retry prompt beats a false success — an outage must not swallow a lead.
    return { ok: false, error: 'Could not reach our system. Please try again in a moment.' };
  }

  if (pdf) {
    const attached = await attachFileToTask({
      token,
      taskId: created.taskId,
      filename: pdf.filename,
      bytes: pdf.bytes
    });

    // Not worth failing the submission over, but the summary alone would lose most of the answers.
    if (!attached) {
      await updateTaskDescription({ token, taskId: created.taskId, markdown: fullMarkdown });
    }
  }

  // Throttled here, not in `sendConfirmation`, so the check runs where the headers are. The ClickUp write above is
  // deliberately never throttled: losing a real lead is the worst outcome this form has, so a throttled resubmission
  // still reaches the studio and only skips the second email.
  if (await mayEmail(data.email)) {
    // `after`, not a bare un-awaited promise — the serverless function can be frozen the moment the response is sent.
    after(() => sendConfirmation(data, submittedAt));
  }

  return { ok: true };
}

/**
 * `to:` is an address the submitter chose, so an unthrottled form lets anyone make the verified studio domain mail a
 * stranger, and burn the 100/day ceiling so real confirmations stop. Two dimensions because they stop different
 * attacks: per-IP catches one script working a list of victims, per-recipient a rotating-IP attack on one victim.
 */
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_EMAILS_PER_IP = 3;
const MAX_EMAILS_PER_RECIPIENT = 2;

async function mayEmail(email: string): Promise<boolean> {
  // `x-forwarded-for` is client-settable except behind a proxy that overwrites it, which Vercel does. Locally it is
  // absent and every submission shares the `unknown` bucket, which is correct for dev.
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'unknown';

  if (!allow(`inquiry-ip:${ip}`, MAX_EMAILS_PER_IP, RATE_WINDOW_MS)) {
    console.warn('Inquiry confirmation throttled: too many sends from one address.');
    return false;
  }

  if (!allow(`inquiry-to:${email.toLowerCase()}`, MAX_EMAILS_PER_RECIPIENT, RATE_WINDOW_MS)) {
    console.warn('Inquiry confirmation throttled: too many sends to one recipient.');
    return false;
  }

  return true;
}

/**
 * Email the visitor a confirmation. Last, and unable to fail the submission: the mail says the inquiry arrived, so it
 * must not precede the task — and once the task exists the lead is safe, so a send failure is worth a log and no more.
 *
 * Missing config is a *skip*, not an error, unlike the ClickUp guard in `submitInquiry`: unset is correct on Preview.
 */
async function sendConfirmation(data: InquiryInput, submittedAt: string): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.INQUIRY_FROM_EMAIL;

    if (!apiKey || !from) {
      console.warn('RESEND_API_KEY or INQUIRY_FROM_EMAIL is not set; skipping the inquiry confirmation email.');
      return;
    }

    await sendEmail({
      apiKey,
      from,
      to: data.email,
      replyTo: process.env.INQUIRY_REPLY_TO || undefined,
      subject: confirmationSubject(),
      html: confirmationHtml(data, submittedAt),
      text: confirmationText(data, submittedAt)
    });
  } catch (err) {
    // Load-bearing: `sendEmail` guards only its own fetch, but rendering the bodies can throw on its own —
    // `absoluteUrl()` rejects a malformed NEXT_PUBLIC_SITE_URL. An escape here would make the visitor's retry
    // file the lead twice.
    console.error('Could not send the inquiry confirmation email', err);
  }
}
