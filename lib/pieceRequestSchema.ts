import { z } from 'zod';

/**
 * A request for one credited piece. Deliberately short: this is someone who has just seen a sconce in a photograph
 * and wants to know what it costs, not someone commissioning a house — `lib/inquirySchema.ts` is that form, and
 * asking its 34 questions here would lose every one of these.
 *
 * Only a name and an email are required. Everything else is optional because each extra required field is a reason to
 * close the tab, and the studio can ask for the rest in the reply it is going to send anyway.
 */
export const pieceRequestSchema = z.object({
  /** Which piece. Hidden, and re-resolved server-side — the client's value is a lookup key, never copy. */
  pieceSlug: z.string().trim().min(1),

  name: z.string().trim().min(1, 'Please share your name.'),
  email: z.email('This doesn’t look like a valid email address.').trim(),

  // Optional-as-bounded-string rather than `.optional()`, matching lib/inquirySchema.ts: react-hook-form wants a
  // defined default per key, and `''` is a value the markdown builder can render as a dash without a branch.
  phone: z.string().trim().max(60),
  quantity: z.string().trim().max(40),
  deliverTo: z.string().trim().max(160),
  notes: z.string().trim().max(1200, 'Please keep this under 1,200 characters — there’s room for more once we talk.'),

  /** Honeypot. A non-empty value is a bot, and the action returns a silent success. */
  website: z.string()
});

export type PieceRequestInput = z.infer<typeof pieceRequestSchema>;
