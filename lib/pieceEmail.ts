import { formatSubmittedAt } from '@/lib/inquiryPayload';
import type { Piece } from '@/lib/pieces';
import { SITE, absoluteUrl } from '@/lib/site';

/**
 * The confirmation a visitor receives after requesting a credited piece. To change the wording, edit `COPY` and
 * nothing else — both the HTML and plain-text parts render from it, so they cannot drift.
 *
 * Modelled on lib/inquiryEmail.ts, and the fourth renderer in the repo with no CSSOM (after the inquiry PDF,
 * lib/og.tsx and that file): brand hexes are literal, styling is inline `style` attributes only, and Cormorant is
 * deliberately not loaded because a webfont in email silently falls back.
 *
 * Kept as its own file rather than a branch inside the inquiry's builders: the two say different things, and one
 * `COPY` serving both would need a conditional per line, which is how the plain-text and HTML parts drift apart.
 */

const ink = '#0f1a2b'; // navy ink
const paper = '#f4f1ea'; // bone white
const muted = '#a89f96'; // warm stone
const accent = '#8a5a32'; // saddle leather

const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/**
 * Everything the email says.
 *
 * Three tokens, replaced by both builders: `{piece}` and `{brand}` become plain text in either part, and `{link}`
 * becomes an anchor in HTML or a bare URL on its own line in text. `<em>` is the only tag allowed in `headline` —
 * anything else shows as literal angle brackets in a text client.
 */
const COPY = {
  subject: `Your request is received — ${SITE.name}`,

  /** The two letterspaced lines of the wordmark at the top. */
  wordmarkTop: 'LAUREL LEAF',
  wordmarkBottom: 'DESIGN STUDIO',

  eyebrow: '— THANK YOU',

  headline: 'Your request is <em>received</em>.',

  /** Used when the submitted name has no usable first word. */
  greetingFallback: 'Hello',

  /**
   * `{brand}` is never placed immediately before a full stop. A maker's name routinely ends in one — `Visual Comfort
   * & Co.`, `Arteriors Home Inc.` — and an earlier draft read `by {brand}.`, which rendered as `Co..`. An em dash
   * after the token keeps that impossible without the builders having to strip punctuation out of a proper noun.
   */
  body:
    'Thank you for your interest in the {piece} by {brand} — we will follow up shortly with availability, lead time ' +
    'and pricing. Pieces like this one are ordered through the studio rather than bought off a shelf, so the note we ' +
    'send back will be a quote rather than a checkout link. In the meantime, you may wish to revisit our {link}.',

  /** The single link in the body. `path` is site-relative. */
  link: { label: 'recent projects', path: '/projects' },

  /** Prefix on the timestamp line, which doubles as the visitor's receipt. */
  receivedLabel: 'REQUESTED'
} as const;

/** What the builders read off a piece. Narrower than `Piece` so the preview route need not invent a story. */
export type RequestedPiece = Pick<Piece, 'name' | 'brand'>;

/** What the builders read off a submission. */
export type Recipient = { name: string };

/**
 * Escape for the HTML body — visitor input and piece names only. `COPY` is trusted, and escaping it would make the
 * headline's `<em>` literal. The markdown builder leaves answers unescaped because ClickUp is a trusted context; a
 * mail client is not.
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

/** Fill `{piece}` and `{brand}`. `{link}` is left for each builder, which renders it differently. */
function withPiece(template: string, piece: RequestedPiece): string {
  return template.replace('{piece}', piece.name).replace('{brand}', piece.brand);
}

export function requestSubject(): string {
  return COPY.subject;
}

export function requestText(data: Recipient, piece: RequestedPiece, submittedAt: string): string {
  const url = absoluteUrl(COPY.link.path);

  return [
    // Same source as the HTML wordmark — editing COPY must change both parts.
    `${COPY.wordmarkTop} ${COPY.wordmarkBottom}`,
    '',
    greeting(data.name),
    '',
    stripTags(COPY.headline),
    '',
    withPiece(COPY.body, piece).replace('{link}', COPY.link.label),
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

export function requestHtml(data: Recipient, piece: RequestedPiece, submittedAt: string): string {
  const url = absoluteUrl(COPY.link.path);
  const anchor = `<a href="${url}" style="color:${ink}; text-decoration:none; border-bottom:1px solid ${accent};">${COPY.link.label}</a>`;
  // Escaped here, at the call site: a maker's name carrying an ampersand ("Visual Comfort & Co.") is the common case.
  const body = withPiece(COPY.body, { name: esc(piece.name), brand: esc(piece.brand) }).replace('{link}', anchor);

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
            ${body}
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
