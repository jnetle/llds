import Link from 'next/link';
import type { ResolvedCredit } from '@/lib/projects';
import { color, space, text } from '@/lib/tokens';

/**
 * The credit line beneath a photograph — a magazine's "what the model is wearing", for a sconce or a faucet.
 *
 * **Beneath the frame, never over it.** A marker pinned to the object itself — the shoppable-image dot — would be
 * clicked more, and it is the wrong trade: the photography is what this site is arguing with, and putting a UI
 * affordance on top of it spends the thing that is working to buy a little conversion. This is the first change
 * someone will propose; it was considered and declined.
 *
 * Two lines, and no eyebrow above them. An earlier draft bracketed the note between a `LIGHTING` eyebrow and the
 * brand set in uppercase `.micro`, which read as a spec label rather than a caption. The category lives on the piece
 * page, where a reader who followed the link is actually asking for it.
 *
 * The brand sits on its own line rather than inside the sentence: interpolating a link into authored prose would mean
 * either parsing a token out of the string or putting HTML in a data file, and one short paragraph followed by a name
 * is what the magazines actually print.
 *
 * Rendered inside a `<figure>` by both gallery templates, so this is a `<figcaption>` and the photograph above it is
 * the figure's content. Hover lives in `.photo-credit__link` in globals.css — an inline `border-color` would outrank
 * the `:hover` rule, the same reason `.btn-primary` keeps its background there.
 */
export function PhotoCredit({ credit }: { credit: ResolvedCredit }) {
  return (
    // Tighter to the photograph above than to whatever follows, so the caption is unambiguously *this* frame's:
    // 14px up to the image against 22px plus the gallery's own gap below.
    <figcaption style={{ marginTop: space[3], marginBottom: space[4] }}>
      <span aria-hidden="true" style={{ display: 'block', width: 28, height: 1, background: color.hairline, marginBottom: space[3] }} />

      {/* Capped by measure rather than by the frame's width: a caption running the full bleed of an 80vh band would
          be a single 200-character line. */}
      <p style={{ ...text.bodySm, maxWidth: '46ch', margin: 0 }}>{credit.note}</p>

      <Link href={`/pieces/${credit.slug}`} className="photo-credit__link serif" style={{ marginTop: space[2] }}>
        {credit.brand}
        {/* The visible brand name alone does not say where the link goes, and a screen reader's link list has no
            figcaption around it. Appended rather than replacing the name via aria-label, so the accessible name still
            *starts* with the visible text — which is what voice control matches on. */}
        <span className="sr-only"> — view this piece</span>
      </Link>
    </figcaption>
  );
}
