'use server';

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

  const url = process.env.SHEETS_WEBHOOK_URL;
  const secret = process.env.INQUIRY_SHARED_SECRET;
  if (!url || !secret) {
    console.error('Inquiry submission failed: SHEETS_WEBHOOK_URL or INQUIRY_SHARED_SECRET is not set.');
    return { ok: false, error: 'Inquiry system is not configured. Please email us directly.' };
  }

  const data = parsed.data;

  // Strip orphaned conditional-field values: if a gate field isn't in the revealing
  // state, don't ship the dependent field's stored value.
  const payload = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    projectType: data.projectType,
    projectTypeOther: data.projectType.length > 0 ? data.projectTypeOther : '',
    areas: data.areas,
    size: data.size,
    description: data.description,
    builder: data.builder,
    builderName: data.builder === 'Yes' ? data.builderName : '',
    plans: data.plans,
    beginTime: data.beginTime,
    completion: data.completion,
    deadlines: data.deadlines,
    builtBefore: data.builtBefore,
    builtBeforeNote: data.builtBefore === 'Yes' ? data.builtBeforeNote : '',
    workedDesigner: data.workedDesigner,
    workedDesignerNote: data.workedDesigner === 'Yes' ? data.workedDesignerNote : '',
    investment: data.investment,
    designBudgetAllocated: data.designBudgetAllocated,
    designInvestment: data.designInvestment,
    builderApproach: data.builderApproach,
    designSupport: data.designSupport,
    decisionMaker: data.decisionMaker,
    decisionComfort: data.decisionComfort,
    openToRecs: data.openToRecs,
    involvement: data.involvement,
    changesApproach: data.changesApproach,
    style: data.style,
    priorities: data.priorities,
    structuredComm: data.structuredComm,
    anythingElse: data.anythingElse,
    howHeard: data.howHeard,
    newsletter: data.newsletter,
    submittedAt: new Date().toISOString(),
    __secret: secret
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      // Apps Script Web Apps cannot read arbitrary HTTP headers; the shared
      // secret travels inside the body and is checked server-side there.
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) {
      console.error('Apps Script webhook returned status', res.status);
      return { ok: false, error: 'Could not reach our system. Please try again in a moment.' };
    }
    // Apps Script always returns HTTP 200 — auth/runtime errors live in the JSON body.
    const body = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!body || body.ok !== true) {
      console.error('Apps Script webhook reported failure', body);
      return { ok: false, error: 'Could not reach our system. Please try again in a moment.' };
    }
  } catch (err) {
    console.error('Failed to forward inquiry to webhook', err);
    return { ok: false, error: 'Could not reach our system. Please try again in a moment.' };
  }

  return { ok: true };
}
