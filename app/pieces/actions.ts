'use server';

import { createInquiryTask } from '@/lib/clickup';
import { getPieceClickUpConfig } from '@/lib/env';
import { getPiece } from '@/lib/pieces';
import { toRequestMarkdown, toTaskName } from '@/lib/pieceRequestPayload';
import { pieceRequestSchema } from '@/lib/pieceRequestSchema';

export type RequestResult = { ok: true } | { ok: false; error: string };

/**
 * A request for one credited piece. The same shape as `submitInquiry` in app/inquire/actions.ts, minus two of its
 * steps:
 *
 * - **No PDF.** That exists to stop 34 answers drowning the ClickUp task body, and six fields fit in a description.
 *   Skipping it also means this route needs no `outputFileTracingIncludes` entry and no attachment-failure fallback.
 * - **No confirmation email.** The visitor's acknowledgement is the success panel on the form; the studio replies by
 *   hand with a quote, which is the real confirmation and cannot be templated anyway. Removing the send also removes
 *   the only thing the rate limiter here was protecting — `to:` was an attacker-chosen address, and without it there
 *   is no way to make the studio's verified domain mail a stranger. See the note below on what that leaves exposed.
 *
 * To bring the email back, `lib/pieceEmail.ts` and the `sendConfirmation`/`mayEmail` pair are in the history of this
 * file: `git show 8c5a8d1:app/pieces/actions.ts` and `git show 8c5a8d1:lib/pieceEmail.ts`.
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

  // Re-resolved rather than trusted. The client sends a slug, and everything the task says about the piece is read
  // off the record here — otherwise a crafted submission would put arbitrary copy in front of the studio under a
  // real piece's name.
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

  /**
   * Nothing throttles this, the same call the inquiry form makes: losing a real lead is the worst outcome either
   * form has, so a resubmission still reaches the studio.
   *
   * What that leaves open is task spam. The inquiry form is protected by its own length — 34 required answers is
   * itself a filter — and this one has two required fields and a honeypot, so it is the cheaper target of the two.
   * Accepted for now on a form that should see a handful of submissions a week. If it is ever abused, throttle it
   * with `allow()` from lib/rateLimit.ts rather than adding fields, and expect to trade some real leads for it.
   */
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

  return { ok: true };
}
