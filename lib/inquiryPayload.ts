import type { InquiryInput } from './inquirySchema';
import { INQUIRY_BANDS, QUESTIONS, type AnswerKey } from './inquiryQuestions';

/**
 * Fields the form only reveals when a gate field is in a particular state. Their
 * stored value survives a client changing their mind (react-hook-form keeps the
 * text after the input unmounts), so it has to be stripped rather than shipped —
 * otherwise a lead who switched `builder` from Yes to No arrives in ClickUp with
 * a builder name attached.
 *
 * These are also the only keys dropped entirely when blank; a gate that never
 * opened means the question was never asked, which is different from a question
 * that was asked and skipped.
 */
const CONDITIONAL_KEYS = new Set<AnswerKey>(['projectTypeOther', 'builderName', 'builtBeforeNote', 'workedDesignerNote']);

/** ClickUp rejects task names longer than this. */
const MAX_TASK_NAME = 255;

/** Shown for a question that was asked and left blank. */
const BLANK = '—';

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

export type AnswerEntry = { key: AnswerKey; question: string; answer: string };
export type AnswerBand = { numeral: string; label: string; entries: AnswerEntry[] };

/**
 * The submission as ordered bands of question/answer pairs — the one shape both
 * the markdown description and the PDF render from, so they can never disagree
 * about what was asked or in what order.
 */
export function toAnswerBands(data: InquiryInput): AnswerBand[] {
  const answers = normalizeAnswers(data);
  return INQUIRY_BANDS.map(band => ({
    numeral: band.numeral,
    label: band.label,
    entries: band.keys
      .filter(key => answers[key].length > 0 || !CONDITIONAL_KEYS.has(key))
      .map(key => ({ key, question: QUESTIONS[key], answer: answers[key] || BLANK }))
  })).filter(band => band.entries.length > 0);
}

/** `<client> — <project types>`, capped to what ClickUp accepts. */
export function toTaskName(data: InquiryInput): string {
  const answers = normalizeAnswers(data);
  const summary = answers.projectType || 'Website inquiry';
  return `${answers.name} — ${summary}`.slice(0, MAX_TASK_NAME);
}

/**
 * `2026-08-15 14:22 UTC` — deliberately UTC rather than a guessed studio
 * timezone. ClickUp already shows task creation time in the viewer's own zone;
 * this exists so the submission time survives in the document verbatim.
 */
export function formatSubmittedAt(iso: string): string {
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

// Markdown collapses runs of plain spaces and tabs, so a literal non-breaking
// space is what carries the indent. Verified against ClickUp's own renderer.
const INDENT = ' '.repeat(4);

/** Indent an answer under its question, bolding each line. */
function indent(value: string, bold: boolean): string {
  return value
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => `${INDENT}${bold ? `**${line}**` : line}`)
    .join('\n\n');
}

const isProse = (value: string) => value.includes('\n') || value.length > 70;

/**
 * The complete questionnaire as markdown. This is the **fallback** description,
 * used when the PDF could not be produced — normally the task carries
 * `toSummaryMarkdown` instead and the detail lives in the attachment.
 *
 * Answer text is inserted unescaped. This is a private task body written by a
 * prospective client in prose, and mangling their apostrophes and dashes to
 * defend against a stray `#` is the worse trade.
 */
export function toFullMarkdown(data: InquiryInput, submittedAt: string): string {
  const out: string[] = [`**Inquiry received** ${formatSubmittedAt(submittedAt)}`];

  for (const band of toAnswerBands(data)) {
    out.push('---', `## ${band.numeral} · ${band.label}`);
    for (const entry of band.entries) {
      // Two trailing spaces are a hard line break, so the answer sits directly
      // under its question rather than a blank line below it.
      out.push(`${entry.question}  \n${indent(entry.answer, !isProse(entry.answer))}`);
    }
  }

  return out.join('\n\n');
}

/**
 * The scannable version: who they are and the handful of facts that decide
 * whether this is a fit. Everything else is in the attached PDF.
 */
export function toSummaryMarkdown(data: InquiryInput, submittedAt: string): string {
  const a = normalizeAnswers(data);
  const line = (label: string, value: string) => `${label}  \n${INDENT}**${value || BLANK}**`;

  return [
    `**Inquiry received** ${formatSubmittedAt(submittedAt)}`,
    '---',
    `## ${a.name}`,
    `${a.email} · ${a.phone}  \n${a.address}`,
    '---',
    line('Project type', [a.projectType, a.projectTypeOther].filter(Boolean).join(' · ')),
    line('Areas', a.areas),
    line('Anticipated investment', a.investment),
    line('Design fee comfort', a.designInvestment),
    line('Ideal start', a.beginTime),
    line('Ideal completion', a.completion),
    line('Heard about us via', a.howHeard),
    '---',
    '📎 **The full questionnaire is attached as a PDF.**'
  ].join('\n\n');
}
