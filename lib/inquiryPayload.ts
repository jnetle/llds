import type { InquiryInput } from './inquirySchema';
import { INQUIRY_BANDS, QUESTIONS, type AnswerKey } from './inquiryQuestions';

/**
 * Fields the form only reveals when a gate field is in a particular state. Their
 * stored value survives a client changing their mind (react-hook-form keeps the
 * text after the input unmounts), so it has to be stripped rather than shipped —
 * otherwise a lead who switched `builder` from Yes to No arrives in ClickUp with
 * a builder name attached.
 *
 * These are also the only keys omitted entirely from the task body when blank; a
 * gate that never opened means the question was never asked.
 */
const CONDITIONAL_KEYS = new Set<AnswerKey>(['projectTypeOther', 'builderName', 'builtBeforeNote', 'workedDesignerNote']);

/** ClickUp rejects task names longer than this. */
const MAX_TASK_NAME = 255;

const joinList = (values: readonly string[]) => values.join(', ');

/**
 * Flatten a validated submission to one string per question, with orphaned
 * conditional values removed.
 */
export function normalizeAnswers(data: InquiryInput): Record<AnswerKey, string> {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone,

    address: data.address,
    projectType: joinList(data.projectType),
    projectTypeOther: data.projectType.length > 0 ? data.projectTypeOther : '',
    areas: joinList(data.areas),
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
    priorities: joinList(data.priorities),

    structuredComm: data.structuredComm,

    anythingElse: data.anythingElse,
    howHeard: data.howHeard
  };
}

/**
 * `2026-08-15 14:22 UTC` — deliberately UTC rather than a guessed studio
 * timezone. ClickUp already shows task creation time in the viewer's own zone;
 * this line exists so the submission time survives in the body verbatim.
 */
function formatSubmittedAt(iso: string): string {
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

/**
 * Build the ClickUp task for one submission: a scannable name, and a markdown
 * body carrying every question and answer in the order the form asked them.
 *
 * Answer text is inserted unescaped. This is a private task body written by a
 * prospective client in prose, and mangling their apostrophes and dashes to
 * defend against a stray `#` is the worse trade.
 */
export function toClickUpTask(data: InquiryInput, submittedAt: string): { name: string; markdown: string } {
  const answers = normalizeAnswers(data);

  const summary = answers.projectType || 'Website inquiry';
  const name = `${answers.name} — ${summary}`.slice(0, MAX_TASK_NAME);

  const lead = [
    `**Submitted** ${formatSubmittedAt(submittedAt)}`,
    `**Email** ${answers.email}`,
    `**Phone** ${answers.phone}`,
    `**Address** ${answers.address}`
  ].join(' · ');

  const sections = INQUIRY_BANDS.map(band => {
    const entries = band.keys
      .filter(key => answers[key].length > 0 || !CONDITIONAL_KEYS.has(key))
      // Each answer sits on its own line so multi-line textarea content survives
      // intact rather than collapsing into the bolded question.
      .map(key => `**${QUESTIONS[key]}**\n\n${answers[key] || '—'}`);

    if (entries.length === 0) return null;
    return `## ${band.numeral} · ${band.label}\n\n${entries.join('\n\n')}`;
  }).filter((section): section is string => section !== null);

  return { name, markdown: [lead, ...sections].join('\n\n') };
}
