import { formatSubmittedAt } from './inquiryPayload';
import type { InquiryInput } from './inquirySchema';
import { SITE, absoluteUrl } from './site';

/**
 * The confirmation the visitor receives after submitting the questionnaire.
 *
 * **To change what the email says, edit `COPY` below and nothing else.** Both
 * the HTML and the plain-text version render from it, so the two cannot drift
 * apart — which they had already started to do when the wording lived inline in
 * each builder.
 *
 * Two constraints shape the markup, and they are the same two that shape
 * `lib/pdf/inquiryDocument.tsx` and `lib/og.tsx` — none of these renderers has a
 * CSSOM:
 *
 * 1. Brand hexes are written literally. `lib/tokens.ts` resolves every color
 *    through a CSS custom property, which an email client will never see.
 * 2. Styling is inline `style` attributes only — no `<style>` block, no classes,
 *    no Tailwind. Gmail strips or rewrites most of what sits in a head.
 *
 * The site's Cormorant Garamond is deliberately not loaded: a webfont in email
 * is unreliable at best and silently falls back at worst, so this uses a
 * web-safe serif stack and lets color and spacing carry the brand instead.
 */

// Brand hexes, verbatim from the 2026 brand book — see the note above.
const ink = '#0f1a2b'; // navy ink
const paper = '#f4f1ea'; // bone white
const muted = '#a89f96'; // warm stone
const accent = '#8a5a32'; // saddle leather

const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/**
 * Everything the email says, in one place. Plain strings — no markup beyond the
 * two notes below, so this stays editable by someone who does not read HTML.
 *
 * The studio's name and tagline are deliberately absent: they come from `SITE`,
 * which is the single source of truth for identity across the whole site. Change
 * them there and this follows.
 */
const COPY = {
  /** Subject line. */
  subject: `Your inquiry is received — ${SITE.name}`,

  /** The two letterspaced lines of the wordmark at the top. */
  wordmarkTop: 'LAUREL LEAF',
  wordmarkBottom: 'DESIGN STUDIO',

  /** Small label above the headline. */
  eyebrow: '— THANK YOU',

  /**
   * The headline. `<em>` is the one tag allowed here — it renders italic in the
   * HTML and is stripped for the plain-text version. Anything else will show up
   * as literal angle brackets in a text client; links belong in `link` below.
   */
  headline: 'Your inquiry is <em>received</em>.',

  /** Used when the submitted name has no usable first word. */
  greetingFallback: 'Hello',

  /**
   * The body paragraph. `{link}` is replaced by `link.label` — as a real anchor
   * in the HTML, and as bare text in the plain-text version, which appends the
   * URL on its own line afterwards.
   */
  body:
    'Thank you for taking the time to complete this inquiry. After reviewing your submission, we will follow up with next steps — ' +
    'which may include a consultation or placement within our upcoming project schedule. In the meantime, you may wish to revisit ' +
    'our {link}.',

  /** The single link in the body. `path` is site-relative. */
  link: { label: 'recent projects', path: '/projects' },

  /** Prefix on the timestamp line, which doubles as the visitor's receipt. */
  receivedLabel: 'RECEIVED'
} as const;

/**
 * Escape for interpolation into the HTML body.
 *
 * Applied to visitor input only. `COPY` is authored here and trusted — running
 * it through this would turn the headline's `<em>` into literal text.
 *
 * The markdown builders in `lib/inquiryPayload.ts` leave answers unescaped on
 * purpose, because ClickUp renders them in a trusted context. This does not: the
 * visitor's own name is attacker-controlled text going into a document someone
 * else's mail client will parse.
 */
function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Drop the inline emphasis tags `COPY.headline` is allowed to carry. */
function stripTags(value: string): string {
  return value.replace(/<\/?[a-z]+>/gi, '');
}

/** `Jane Doe` → `Jane`. Falls back to the whole string, then to the empty string. */
function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? '';
}

/**
 * `Jane` → `Jane,` · `''` → `Hello,`
 *
 * Returns raw text. Escaping happens at the HTML call site and must not happen
 * here — the plain-text part would otherwise render `O'Brien` as `O&#39;Brien`.
 */
function greeting(name: string): string {
  const first = firstName(name);
  return first ? `${first},` : `${COPY.greetingFallback},`;
}

/**
 * What the builders actually read off a submission. Narrower than `InquiryInput`
 * on purpose: the full parsed form satisfies it at the call site in
 * app/inquire/actions.ts, and app/dev/email-preview can render a template
 * without inventing 33 answers it does not use.
 */
export type Recipient = Pick<InquiryInput, 'name'>;

export function confirmationSubject(): string {
  return COPY.subject;
}

export function confirmationText(data: Recipient, submittedAt: string): string {
  const url = absoluteUrl(COPY.link.path);

  return [
    // Same source as the HTML wordmark — editing COPY must change both parts.
    `${COPY.wordmarkTop} ${COPY.wordmarkBottom}`,
    '',
    greeting(data.name),
    '',
    stripTags(COPY.headline),
    '',
    COPY.body.replace('{link}', COPY.link.label),
    '',
    url,
    '',
    `${COPY.receivedLabel} ${formatSubmittedAt(submittedAt)}`,
    '',
    '—',
    SITE.name,
    SITE.tagline
  ].join('\n');
}

export function confirmationHtml(data: Recipient, submittedAt: string): string {
  const url = absoluteUrl(COPY.link.path);
  const anchor = `<a href="${url}" style="color:${ink}; text-decoration:none; border-bottom:1px solid ${accent};">${COPY.link.label}</a>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(COPY.subject)}</title>
</head>
<body style="margin:0; padding:0; background-color:${paper};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${paper};">
  <tr>
    <td align="center" style="padding:48px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:560px;">

        <tr>
          <td style="font-family:${SERIF}; font-size:19px; letter-spacing:0.22em; color:${ink}; padding-bottom:6px;">
            ${COPY.wordmarkTop.replace(/ /g, '&nbsp;')}
          </td>
        </tr>
        <tr>
          <td style="font-family:${SANS}; font-size:9px; letter-spacing:0.28em; color:${muted}; padding-bottom:40px;">
            ${COPY.wordmarkBottom.replace(/ /g, '&nbsp;')}
          </td>
        </tr>

        <tr>
          <td style="border-top:1px solid ${muted}; padding-top:40px; font-size:0; line-height:0;">&nbsp;</td>
        </tr>

        <tr>
          <td style="font-family:${SANS}; font-size:10px; letter-spacing:0.28em; color:${accent}; padding-bottom:20px;">
            ${COPY.eyebrow}
          </td>
        </tr>

        <tr>
          <td style="font-family:${SERIF}; font-size:38px; line-height:1.15; color:${ink}; padding-bottom:28px;">
            ${COPY.headline}
          </td>
        </tr>

        <tr>
          <td style="font-family:${SANS}; font-size:15px; line-height:1.7; color:${ink}; padding-bottom:16px;">
            ${esc(greeting(data.name))}
          </td>
        </tr>

        <tr>
          <td style="font-family:${SANS}; font-size:15px; line-height:1.7; color:${ink}; padding-bottom:32px;">
            ${COPY.body.replace('{link}', anchor)}
          </td>
        </tr>

        <tr>
          <td style="font-family:${SANS}; font-size:10px; letter-spacing:0.16em; color:${muted}; padding-bottom:40px;">
            ${COPY.receivedLabel} ${esc(formatSubmittedAt(submittedAt))}
          </td>
        </tr>

        <tr>
          <td style="border-top:1px solid ${muted}; padding-top:24px; font-family:${SANS}; font-size:12px; line-height:1.6; color:${muted};">
            ${esc(SITE.name)}<br>
            ${esc(SITE.tagline)}
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
