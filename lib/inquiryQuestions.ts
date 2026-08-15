import type { InquiryInput } from './inquirySchema';

/**
 * Every field a human actually answers — the schema minus the honeypot.
 */
export type AnswerKey = Exclude<keyof InquiryInput, 'website'>;

/**
 * The question text for each field, in one place.
 *
 * Both the form UI and the ClickUp task body read from here, so a lead arriving
 * in ClickUp is labelled with the exact words the client was asked. The
 * `Record<AnswerKey, string>` annotation is load-bearing: adding a field to
 * `inquirySchema` without adding its question here is a `tsc` error, which is
 * the only thing standing between us and a silently unlabelled answer.
 */
export const QUESTIONS: Record<AnswerKey, string> = {
  // 01 — Contact Information
  name: 'Full name',
  email: 'Email address',
  phone: 'Phone number',

  // 02 — Project Overview
  address: 'Project address',
  projectType: 'What type of project are you planning? — select all that apply',
  // Rendered as a placeholder in the form ("Other (optional)"), so it needs
  // standalone wording for the task body.
  projectTypeOther: 'Other project type',
  areas: 'What areas are included? — select all that apply',
  size: 'Approximate size of the home or area involved',
  description: 'Please briefly describe your project and goals',

  // 03 — Project Team + Readiness
  builder: 'Do you have a builder or contractor selected?',
  builderName: 'If yes, who are you working with?',
  plans: 'Are architectural plans completed?',

  // 04 — Timeline
  beginTime: 'When would you ideally like to begin?',
  completion: 'What is your ideal project completion timeframe?',
  deadlines: 'Are there any specific deadlines we should be aware of?',

  // 05 — Project Experience
  builtBefore: 'Have you previously built or renovated a home?',
  builtBeforeNote: 'If yes, how would you describe that experience?',
  workedDesigner: 'Have you worked with a designer before?',
  workedDesignerNote: 'If yes, how would you describe that experience?',

  // 06 — Investment
  investment: 'Anticipated overall investment (construction + materials)',
  designBudgetAllocated: 'Have you allocated a budget for professional design services?',
  designInvestment: 'What level of investment are you comfortable allocating toward design services?',

  // 07 — Project Approach
  builderApproach: 'Will your project be:',
  designSupport: 'What level of design support are you looking for?',

  // 08 — Decision-Making + Expectations
  decisionMaker: 'Who will be the primary decision-maker for this project?',
  decisionComfort: 'How comfortable are you making decisions within a defined timeline?',
  openToRecs: 'Are you open to professional recommendations, even if they differ from your initial ideas?',
  involvement: 'How involved would you like to be in the selection process?',
  changesApproach: 'During a project, unexpected decisions and adjustments may arise. How do you typically approach these situations?',

  // 09 — Style + Priorities
  style: 'How would you describe your style?',
  // The form appends a live "(n/3)" counter; the stored copy is the question itself.
  priorities: 'Top priorities for this project — select up to three',

  // 10 — Communication + Process
  structuredComm: 'Are you comfortable with structured communication and scheduled check-ins throughout the project?',

  // 11 — Final Details
  anythingElse: "Is there anything else you'd like us to know about your project?",
  howHeard: 'How did you hear about Laurel Leaf Design Studio?'
};

export type InquiryBand = {
  numeral: string;
  label: string;
  keys: readonly AnswerKey[];
};

/**
 * Render order for the ClickUp task body, mirroring the `<FormBand>` sequence in
 * `app/inquire/page.tsx` so the task reads in the same order the client filled it.
 */
export const INQUIRY_BANDS: readonly InquiryBand[] = [
  { numeral: '01', label: 'Contact Information', keys: ['name', 'email', 'phone'] },
  {
    numeral: '02',
    label: 'Project Overview',
    keys: ['address', 'projectType', 'projectTypeOther', 'areas', 'size', 'description']
  },
  { numeral: '03', label: 'Project Team + Readiness', keys: ['builder', 'builderName', 'plans'] },
  { numeral: '04', label: 'Timeline', keys: ['beginTime', 'completion', 'deadlines'] },
  {
    numeral: '05',
    label: 'Project Experience',
    keys: ['builtBefore', 'builtBeforeNote', 'workedDesigner', 'workedDesignerNote']
  },
  { numeral: '06', label: 'Investment', keys: ['investment', 'designBudgetAllocated', 'designInvestment'] },
  { numeral: '07', label: 'Project Approach', keys: ['builderApproach', 'designSupport'] },
  {
    numeral: '08',
    label: 'Decision-Making + Expectations',
    keys: ['decisionMaker', 'decisionComfort', 'openToRecs', 'involvement', 'changesApproach']
  },
  { numeral: '09', label: 'Style + Priorities', keys: ['style', 'priorities'] },
  { numeral: '10', label: 'Communication + Process', keys: ['structuredComm'] },
  { numeral: '11', label: 'Final Details', keys: ['anythingElse', 'howHeard'] }
];
