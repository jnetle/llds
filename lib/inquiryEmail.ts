import { formatSubmittedAt } from './inquiryPayload';
import type { InquiryInput } from './inquirySchema';
import { SITE, absoluteUrl } from './site';

/**
 * The confirmation the visitor receives after submitting. To change the wording, edit `COPY` and nothing else — both
 * the HTML and plain-text parts render from it, so they cannot drift.
 *
 * No CSSOM here, as in lib/pdf/inquiryDocument.tsx and lib/og.tsx: brand hexes are literal, and styling is inline
 * `style` attributes only — Gmail strips most of what sits in a head. Cormorant is deliberately not loaded, since a
 * webfont in email silently falls back.
 */

const ink = '#0f1a2b'; // navy ink
const paper = '#f4f1ea'; // bone white
const muted = '#a89f96'; // warm stone
const accent = '#8a5a32'; // saddle leather

const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Everything the email says. Plain strings beyond the two notes below, so it stays editable by a non-coder. */
const COPY = {
  subject: `Your inquiry is received — ${SITE.name}`,

  /** The two letterspaced lines of the wordmark at the top. */
  wordmarkTop: 'LAUREL LEAF',
  wordmarkBottom: 'DESIGN STUDIO',

  /** Small label above the headline. */
  eyebrow: '— THANK YOU',

  /** `<em>` is the only tag allowed here — anything else shows as literal angle brackets in a text client. */
  headline: 'Your inquiry is <em>received</em>.',

  /** Used when the submitted name has no usable first word. */
  greetingFallback: 'Hello',

  /** `{link}` becomes an anchor in HTML, and bare text plus the URL on its own line in the plain-text part. */
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
 * Escape for the HTML body — visitor input only. `COPY` is trusted, and escaping it would make the headline's `<em>`
 * literal. The markdown builders leave answers unescaped because ClickUp is a trusted context; a mail client is not.
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
 * `Jane` → `Jane,` · `''` → `Hello,`. Returns raw text: escaping belongs at the HTML call site, never here, or the
 * plain-text part renders `O'Brien` as `O&#39;Brien`.
 */
function greeting(name: string): string {
  const first = firstName(name);
  return first ? `${first},` : `${COPY.greetingFallback},`;
}

/** What the builders read off a submission. Narrower than `InquiryInput` so the preview route need not invent 33 answers. */
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
