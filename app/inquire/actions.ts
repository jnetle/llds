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

  // Throttled here rather than inside `sendConfirmation` so the check runs in the
  // request, where the headers are. Note what is *not* throttled: the ClickUp
  // write above always happens. Dropping a real lead is the worst outcome this
  // form has, and a throttled resubmission still reaches the studio — it just
  // does not send a second email.
  if (await mayEmail(data.email)) {
    // Deferred past the response. The lead is already saved, so there is no reason
    // to hold the visitor's success panel open for a Resend round-trip that can
    // take the full 10s timeout. `after` is the supported way to do this — a bare
    // un-awaited promise risks the serverless function being frozen mid-flight.
    after(() => sendConfirmation(data, submittedAt));
  }

  return { ok: true };
}

/**
 * Whether this submission should trigger a confirmation email.
 *
 * `to:` is an address the submitter chose, so once the studio domain is verified
 * an unthrottled form lets anyone make it mail a stranger on demand — and burn
 * the free tier's 100/day ceiling, which would silently stop real confirmations.
 * The honeypot in `submitInquiry` only catches bots that fill hidden fields.
 *
 * Two dimensions, because they stop different things: per-IP catches one script
 * working through a list of victims, per-recipient catches a rotating-IP attack
 * aimed at a single victim. A real person submits once, occasionally twice, so
 * these ceilings are far above legitimate use and no visitor should ever meet one.
 */
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_EMAILS_PER_IP = 3;
const MAX_EMAILS_PER_RECIPIENT = 2;

async function mayEmail(email: string): Promise<boolean> {
  // `x-forwarded-for` is a client-settable header everywhere except behind a
  // proxy that overwrites it — which Vercel does. Locally it is absent and every
  // submission shares the `unknown` bucket, which is correct for dev.
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
 * Email the visitor a confirmation.
 *
 * Deliberately last, and deliberately unable to fail the submission. The mail
 * says the inquiry arrived, so it must not go out before the ClickUp task
 * actually exists — and once the task does exist the lead is safe, so a bounce
 * or a Resend outage is worth a log line and nothing more. Same contract as the
 * attachment upload above.
 *
 * Missing configuration is a *skip*, not an error, unlike the ClickUp guard in
 * `submitInquiry`: unset is the correct state on Preview and in local dev, and
 * must not degrade the form for anyone.
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
    // `sendEmail` guards its own fetch, but rendering the bodies is local work
    // that can still throw — `absoluteUrl()` rejects a malformed
    // NEXT_PUBLIC_SITE_URL, for one. Without this the "never fails the
    // submission" contract above would be a comment rather than a fact.
    console.error('Could not send the inquiry confirmation email', err);
  }
}
