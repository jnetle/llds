'use server';

import { headers } from 'next/headers';
import { after } from 'next/server';
import { createInquiryTask } from '@/lib/clickup';
import { sendEmail } from '@/lib/email';
import { getInquiryEmailConfig, getPieceClickUpConfig } from '@/lib/env';
import { getPiece, type Piece } from '@/lib/pieces';
import { requestHtml, requestSubject, requestText } from '@/lib/pieceEmail';
import { toRequestMarkdown, toTaskName } from '@/lib/pieceRequestPayload';
import { pieceRequestSchema, type PieceRequestInput } from '@/lib/pieceRequestSchema';
import { allow } from '@/lib/rateLimit';

export type RequestResult = { ok: true } | { ok: false; error: string };

/**
 * A request for one credited piece. The same shape as `submitInquiry` in app/inquire/actions.ts, with the PDF step
 * removed: that exists to stop 34 answers drowning the ClickUp task body, and six fields fit in a description. Losing
 * it also means this route needs no `outputFileTracingIncludes` entry and no attachment-failure fallback.
 */
export async function requestPiece(raw: unknown): Promise<RequestResult> {
  const parsed = pieceRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'Please review the form and try again.' };
  }

  if (parsed.data.website.length > 0) {
    return { ok: true };
  }

  const data = parsed.data;

  // Re-resolved rather than trusted. The client sends a slug, and everything the task and the email say about the
  // piece is read off the record here — otherwise a crafted submission would put arbitrary copy in front of the
  // studio under a real piece's name, and into an email the studio's own verified domain sends.
  const piece = getPiece(data.pieceSlug);
  if (!piece) {
    console.error(`Piece request rejected: no piece named "${data.pieceSlug}".`);
    return { ok: false, error: 'We could not find that piece. Please reload the page and try again.' };
  }

  const clickUp = getPieceClickUpConfig();
  if (!clickUp) {
    console.error('Piece request failed: CLICKUP_API_TOKEN, or both CLICKUP_PIECES_LIST_ID and CLICKUP_LIST_ID, are not set.');
    return { ok: false, error: 'Requests are not configured yet. Please email us directly.' };
  }
  const { token, listId, dedicated } = clickUp;

  if (!dedicated) {
    // Not an error — the request still reaches the studio. Worth saying once, because the task will land among the
    // project inquiries and read as a misfiled lead rather than a missing environment variable.
    console.warn('CLICKUP_PIECES_LIST_ID is not set; filing this piece request in the inquiry list instead.');
  }

  const submittedAt = new Date().toISOString();

  // Named for the inquiry, but it takes its list, name and body as arguments and knows nothing about either form.
  const created = await createInquiryTask({
    token,
    listId,
    name: toTaskName(piece, data),
    markdown: toRequestMarkdown(piece, data, submittedAt)
  });

  if (!created.ok) {
    // Already logged by createInquiryTask. A retry prompt beats a false success — an outage must not swallow a lead.
    return { ok: false, error: 'Could not reach our system. Please try again in a moment.' };
  }

  // Throttled here, not in `sendConfirmation`, so the check runs where the headers are. The ClickUp write above is
  // deliberately never throttled, exactly as in the inquiry: a throttled resubmission still reaches the studio and
  // only skips the second email.
  if (await mayEmail(data.email)) {
    // `after`, not a bare un-awaited promise — the serverless function can be frozen the moment the response is sent.
    after(() => sendConfirmation(data, piece, submittedAt));
  }

  return { ok: true };
}

/**
 * `to:` is an address the submitter chose, so an unthrottled form lets anyone make the verified studio domain mail a
 * stranger, and burn the 100/day ceiling so real confirmations stop.
 *
 * Its own key prefixes, not the inquiry's: `lib/rateLimit.ts` is one shared map, so reusing `inquiry-ip:` would let a
 * visitor who asked about three sconces find the project inquiry form silently refusing to confirm.
 */
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_EMAILS_PER_IP = 5;
const MAX_EMAILS_PER_RECIPIENT = 3;

async function mayEmail(email: string): Promise<boolean> {
  // `x-forwarded-for` is client-settable except behind a proxy that overwrites it, which Vercel does. Locally it is
  // absent and every submission shares the `unknown` bucket, which is correct for dev.
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'unknown';

  if (!allow(`piece-ip:${ip}`, MAX_EMAILS_PER_IP, RATE_WINDOW_MS)) {
    console.warn('Piece request confirmation throttled: too many sends from one address.');
    return false;
  }

  if (!allow(`piece-to:${email.toLowerCase()}`, MAX_EMAILS_PER_RECIPIENT, RATE_WINDOW_MS)) {
    console.warn('Piece request confirmation throttled: too many sends to one recipient.');
    return false;
  }

  return true;
}

/**
 * Email the visitor a confirmation. Last, and unable to fail the request: the mail says the request arrived, so it
 * must not precede the task — and once the task exists the lead is safe, so a send failure is worth a log and no more.
 *
 * Missing config is a *skip*, not an error, unlike the ClickUp guard above: unset is correct in dev and on Preview.
 */
async function sendConfirmation(data: PieceRequestInput, piece: Piece, submittedAt: string): Promise<void> {
  try {
    const emailConfig = getInquiryEmailConfig();

    if (!emailConfig) {
      console.warn('RESEND_API_KEY or INQUIRY_FROM_EMAIL is not set; skipping the piece request confirmation email.');
      return;
    }

    await sendEmail({
      apiKey: emailConfig.apiKey,
      from: emailConfig.from,
      to: data.email,
      replyTo: emailConfig.replyTo,
      subject: requestSubject(),
      html: requestHtml(data, piece, submittedAt),
      text: requestText(data, piece, submittedAt)
    });
  } catch (err) {
    // Load-bearing, as in the inquiry: `sendEmail` guards only its own fetch, but rendering the bodies can throw on
    // its own — `absoluteUrl()` rejects a malformed NEXT_PUBLIC_SITE_URL. An escape here would make the visitor's
    // retry file the request twice.
    console.error('Could not send the piece request confirmation email', err);
  }
}
