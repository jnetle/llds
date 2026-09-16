import { formatSubmittedAt } from '@/lib/inquiryPayload';
import type { Piece } from '@/lib/pieces';
import type { PieceRequestInput } from '@/lib/pieceRequestSchema';
import { absoluteUrl } from '@/lib/site';

/**
 * What a piece request becomes in ClickUp.
 *
 * Hand-rolled rather than reusing `toFullMarkdown` / `toAnswerBands` from lib/inquiryPayload.ts: those close over
 * `INQUIRY_BANDS` and `QUESTIONS` through module imports and are not parameterised, so sharing them would mean
 * refactoring the inquiry to serve a form with six fields. `formatSubmittedAt` *is* generic, so it is imported.
 *
 * Answers are left unescaped, exactly as the inquiry's builders leave them: ClickUp renders this in a trusted
 * context. The confirmation email is the opposite case and does its own escaping — see lib/pieceEmail.ts.
 */

/** ClickUp rejects a longer task name outright. */
const MAX_TASK_NAME = 255;

/** What an omitted optional renders as, so every row keeps its shape. */
const BLANK = '—';

export function toTaskName(piece: Piece, data: PieceRequestInput): string {
  return `${piece.name} — ${data.name}`.slice(0, MAX_TASK_NAME);
}

export function toRequestMarkdown(piece: Piece, data: PieceRequestInput, submittedAt: string): string {
  const row = (label: string, value: string) => `**${label}** — ${value.trim() || BLANK}`;

  return [
    `**Piece** — ${piece.name}`,
    `**Maker** — ${piece.brand}`,
    `**Page** — ${absoluteUrl(`/pieces/${piece.slug}`)}`,
    '',
    '---',
    '',
    row('Name', data.name),
    row('Email', data.email),
    row('Phone', data.phone),
    row('Quantity', data.quantity),
    row('Deliver to', data.deliverTo),
    '',
    '**Notes**',
    '',
    data.notes.trim() || BLANK,
    '',
    '---',
    '',
    // The studio quotes from this, so the two facts it needs to remember are here rather than in anyone's head.
    `_Trade purchase request. Quote at the studio's markup; the wholesale price is not published on the site._`,
    '',
    `_Submitted ${formatSubmittedAt(submittedAt)}_`
  ].join('\n');
}
