import { describe, expect, it } from 'vitest';
import { inquirySchema, type InquiryInput } from '../inquirySchema';
import { QUESTIONS } from '../inquiryQuestions';
import { normalizeAnswers, toAnswerBands, toFullMarkdown } from '../inquiryPayload';
import { confirmationHtml, confirmationText } from '../inquiryEmail';
import { pieceRequestSchema } from '../pieceRequestSchema';
import { renderInquiryPdf } from '../pdf/inquiryDocument';

// These tests exist mainly as a dependency tripwire. The inquiry pipeline is the only part of the site that runs
// zod and @react-pdf/renderer at request time, and a dependency bump that breaks either one surfaces only on a real
// submission. A Dependabot PR has to pass these before it can be merged.

const SUBMITTED_AT = '2026-08-15T14:30:00.000Z';

const VALID: InquiryInput = {
  name: "D'Angelo Jones",
  email: 'jane@example.com',
  phone: '555-0100',
  address: '1 Main St, Aiken, SC',
  projectType: ['Renovation'],
  projectTypeOther: '',
  areas: ['Kitchen', 'Bathrooms'],
  size: '3,200 sq ft',
  description: 'A full kitchen and two bathrooms, refreshed for a growing family.',
  builder: 'Yes',
  builderName: 'Example Builders',
  plans: 'In progress',
  beginTime: '1–3 months',
  completion: '6–12 months',
  deadlines: 'none',
  builtBefore: 'Yes',
  builtBeforeNote: '',
  workedDesigner: 'No',
  workedDesignerNote: '',
  investment: '$250,000 – $500,000',
  designBudgetAllocated: 'Yes',
  designInvestment: '$20,000 – $40,000',
  builderApproach: 'Design-build',
  designSupport: 'Full service',
  decisionMaker: 'Myself',
  decisionComfort: 'Very comfortable',
  openToRecs: 'Yes',
  involvement: 'Collaborative with guidance',
  changesApproach: '',
  style: 'Warm, layered traditional.',
  priorities: ['Functionality', 'Aesthetic / design'],
  structuredComm: 'Yes',
  anythingElse: 'nothing else',
  howHeard: 'Instagram',
  website: ''
};

describe('inquirySchema', () => {
  it('accepts a complete submission', () => {
    const result = inquirySchema.safeParse(VALID);
    expect(result.success).toBe(true);
  });

  it('rejects a malformed email and an empty required field', () => {
    const result = inquirySchema.safeParse({ ...VALID, email: 'not-an-email', name: '  ' });
    expect(result.success).toBe(false);
    const paths = result.error!.issues.map(issue => issue.path[0]);
    expect(paths).toContain('email');
    expect(paths).toContain('name');
  });

  it('caps priorities at three', () => {
    const result = inquirySchema.safeParse({
      ...VALID,
      priorities: ['Functionality', 'Aesthetic / design', 'Budget', 'Timeline']
    });
    expect(result.success).toBe(false);
  });
});

describe('pieceRequestSchema', () => {
  it('accepts a minimal request and rejects a bad email', () => {
    const base = {
      pieceSlug: 'x',
      name: 'Jane',
      email: 'jane@example.com',
      phone: '',
      quantity: '',
      deliverTo: '',
      notes: '',
      website: ''
    };
    expect(pieceRequestSchema.safeParse(base).success).toBe(true);
    expect(pieceRequestSchema.safeParse({ ...base, email: 'nope' }).success).toBe(false);
  });
});

describe('inquiry payload', () => {
  it('answers every question', () => {
    const answers = normalizeAnswers(VALID);
    expect(Object.keys(answers).sort()).toEqual(Object.keys(QUESTIONS).sort());
  });

  it('renders the full markdown with the visitor’s answers', () => {
    const md = toFullMarkdown(VALID, SUBMITTED_AT);
    expect(md).toContain('jane@example.com');
    expect(toAnswerBands(VALID).length).toBeGreaterThan(0);
  });
});

describe('confirmation email', () => {
  it('escapes the name in HTML and leaves it raw in text', () => {
    expect(confirmationHtml(VALID, SUBMITTED_AT)).not.toContain("D'Angelo,");
    expect(confirmationText(VALID, SUBMITTED_AT)).toContain("D'Angelo,");
  });
});

describe('inquiry PDF', () => {
  it('renders a non-trivial PDF', { timeout: 30_000 }, async () => {
    const pdf = await renderInquiryPdf(VALID, SUBMITTED_AT);
    expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(pdf.length).toBeGreaterThan(5_000);
  });
});
