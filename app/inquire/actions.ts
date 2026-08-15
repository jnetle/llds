'use server';

import { createInquiryTask } from '@/lib/clickup';
import { toClickUpTask } from '@/lib/inquiryPayload';
import { inquirySchema } from '@/lib/inquirySchema';

export type SubmitResult = { ok: true } | { ok: false; error: string };

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

  const { name, markdown } = toClickUpTask(parsed.data, new Date().toISOString());

  const result = await createInquiryTask({ token, listId, name, markdown });
  if (!result.ok) {
    // createInquiryTask has already logged the reason; the visitor gets a retry
    // prompt rather than a false success, so a ClickUp outage never swallows a lead.
    return { ok: false, error: 'Could not reach our system. Please try again in a moment.' };
  }

  return { ok: true };
}
