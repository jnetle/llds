import { z } from 'zod';

export const PROJECT_TYPES = ['New construction', 'Renovation', 'Furnishings / styling', 'Not sure yet'] as const;

export const AREAS = ['Kitchen', 'Bathrooms', 'Full home', 'Exterior', 'Furnishings'] as const;

export const BUILDER_OPTIONS = ['Yes', 'No', 'In progress'] as const;
export const PLANS_OPTIONS = ['Yes', 'In progress', 'No'] as const;

export const BEGIN_TIMES = ['Immediately', '1–3 months', '3–6 months', '6+ months'] as const;
export const COMPLETION_TIMES = ['3–6 months', '6–12 months', '12–18 months', '18+ months', 'Flexible'] as const;

export const YES_NO = ['Yes', 'No'] as const;

export const INVESTMENT_RANGES = [
  'Under $100,000',
  '$100,000 – $250,000',
  '$250,000 – $500,000',
  '$500,000 – $800,000',
  '$800,000 – $1M',
  '$1M – $2M',
  '$2M+',
  'Not sure yet'
] as const;

export const DESIGN_BUDGET_OPTIONS = ['Yes', 'Not yet', 'Not sure what to expect'] as const;

export const DESIGN_INVESTMENT_OPTIONS = [
  '$5,000 – $10,000',
  '$10,000 – $20,000',
  '$20,000 – $40,000',
  '$40,000+',
  'Open to recommendation based on scope'
] as const;

export const BUILDER_APPROACH_OPTIONS = [
  'Builder-led with allowances',
  'Builder-led with customized selections beyond allowances',
  'Fully custom (highly tailored selections throughout)',
  'Not sure yet'
] as const;

export const DESIGN_SUPPORT_OPTIONS = [
  'Full-service design (selections, drawings, coordination)',
  'Design guidance (consulting + selections)',
  'Not sure yet'
] as const;

export const DECISION_MAKER_OPTIONS = ['Myself', 'Myself and spouse / partner', 'Multiple decision-makers'] as const;
export const DECISION_COMFORT_OPTIONS = ['Very comfortable', 'Somewhat comfortable', 'I prefer to take my time'] as const;
export const OPEN_TO_RECS_OPTIONS = ['Yes', 'Somewhat', 'No'] as const;
export const INVOLVEMENT_OPTIONS = ['Highly involved', 'Collaborative with guidance', 'Prefer designer to lead'] as const;
export const CHANGES_APPROACH_OPTIONS = [
  'I trust the process and adapt as needed',
  'I prefer to review all options before deciding',
  'I find changes stressful and prefer everything to be fully defined upfront'
] as const;

export const PRIORITIES = ['Functionality', 'Aesthetic / design', 'Budget', 'Timeline', 'Resale value', 'Custom / one-of-a-kind'] as const;

export const STRUCTURED_COMM_OPTIONS = ['Yes', 'Somewhat', 'No'] as const;

export const PRIORITIES_MAX = 3;

export const inquirySchema = z.object({
  // 01 — Contact
  name: z.string().trim().min(1, 'Please share your full name.'),
  email: z.email('This doesn’t look like a valid email address.').trim(),
  phone: z.string().trim().min(1, 'A phone number, please — we may follow up by call.'),

  // 02 — Project Overview
  address: z.string().trim().min(1, 'Please share the project address.'),
  projectType: z.array(z.string()).min(1, 'Please choose at least one project type.'),
  projectTypeOther: z.string().trim().max(120),
  areas: z.array(z.string()).min(1, 'Please tell us which areas are included.'),
  size: z.string().trim().max(160),
  description: z
    .string()
    .trim()
    .min(1, 'A few words about the project, please.')
    .min(20, 'Could you share a little more? At least a sentence or two.'),

  // 03 — Project Team + Readiness
  builder: z.string().min(1, 'Please tell us whether a builder is selected.'),
  builderName: z.string().trim().max(160),
  plans: z.string().min(1, 'Please share the status of the architectural plans.'),

  // 04 — Timeline
  beginTime: z.string().min(1, 'When would you ideally like to begin?'),
  completion: z.string().min(1, 'Please share an ideal completion timeframe.'),
  deadlines: z.string().trim().min(1, 'If there are none, please write “none” — this field is required.'),

  // 05 — Project Experience
  builtBefore: z.string().min(1, 'Have you previously built or renovated?'),
  builtBeforeNote: z.string().trim().max(800),
  workedDesigner: z.string().min(1, 'Have you worked with a designer before?'),
  workedDesignerNote: z.string().trim().max(800),

  // 06 — Investment
  investment: z.string().min(1, 'Please share an anticipated overall investment.'),
  designBudgetAllocated: z.string().min(1, 'Please share whether a design-fee budget is allocated.'),
  designInvestment: z.string().min(1, 'Please share a comfort range for design fees.'),

  // 07 — Project Approach
  builderApproach: z.string().min(1, 'Please choose the closest project approach.'),
  designSupport: z.string().min(1, 'Please choose a level of design support.'),

  // 08 — Decision-Making + Expectations
  decisionMaker: z.string().min(1, 'Please share who will decide on this project.'),
  decisionComfort: z.string().min(1, 'Please share your comfort with timed decisions.'),
  openToRecs: z.string().min(1, 'Please share how open you are to recommendations.'),
  involvement: z.string().min(1, 'Please share a preferred involvement level.'),
  changesApproach: z.string(),

  // 09 — Style + Priorities
  style: z.string().trim().min(1, 'A few words on your style, please.'),
  priorities: z
    .array(z.string())
    .min(1, 'Please choose at least one priority (up to three).')
    .max(PRIORITIES_MAX, `Please choose up to ${PRIORITIES_MAX} priorities.`),

  // 10 — Communication
  structuredComm: z.string().min(1, 'Please share your comfort with structured communication.'),

  // 11 — Final Details
  anythingElse: z.string().trim().min(1, 'If nothing else, please write “nothing else” — this field is required.'),
  howHeard: z.string().trim().min(1, 'How did you hear about Laurel Leaf?'),
  newsletter: z.boolean(),

  // Honeypot
  website: z.string()
});

export type InquiryInput = z.infer<typeof inquirySchema>;

// Display label per required field — used by the error summary panel.
export const FIELD_LABELS: Record<string, string> = {
  name: 'your full name',
  email: 'an email address',
  phone: 'a phone number',
  address: 'the project address',
  projectType: 'a project type',
  areas: 'the areas included in your project',
  description: 'a brief description of the project & goals',
  builder: 'whether a builder is selected',
  plans: 'architectural plans status',
  beginTime: 'an ideal start time',
  completion: 'an ideal completion timeframe',
  deadlines: 'any specific deadlines',
  builtBefore: 'previous build/renovation experience',
  workedDesigner: 'previous designer experience',
  investment: 'an anticipated overall investment',
  designBudgetAllocated: 'a design-fee budget status',
  designInvestment: 'a comfort range for design fees',
  builderApproach: 'a project approach',
  designSupport: 'a level of design support',
  decisionMaker: 'the primary decision-maker',
  decisionComfort: 'comfort with timed decisions',
  openToRecs: 'openness to recommendations',
  involvement: 'a preferred involvement level',
  style: 'a description of your style',
  priorities: 'your top priorities (up to three)',
  structuredComm: 'comfort with structured communication',
  anythingElse: 'anything else we should know',
  howHeard: 'how you heard about Laurel Leaf'
};
