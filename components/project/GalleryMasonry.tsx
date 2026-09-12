import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useReveal } from '@/hooks/useReveal';
import type { GalleryImage } from '@/lib/projects';
import { brand } from '@/lib/tokens';

type Props = {
  gallery: GalleryImage[];
};

/**
 * How many columns the grid runs at the wide tiers. The columns are real elements, so both the packing and the grid
 * track derive from this one number — it rides out as the `--masonry-cols` custom property rather than a literal
 * `repeat(2, 1fr)` in the stylesheet, which would silently disagree the moment this changed and wrap each run into a
 * broken second row. Below 601px globals.css renders one column regardless; see `.project-masonry__run` there.
 */
const COLUMNS = 2;

/** A plate plus its index in the authored `gallery`. The index survives the packing because the phone tier renders
    one column and has to replay the shoot in its authored order — see `.project-masonry__item` in globals.css. */
type Plate = { image: GalleryImage; order: number };

/** A run of column-packed plates, or a single plate spanning the full width. */
type Block = { kind: 'run'; columns: Plate[][] } | { kind: 'feature'; plate: Plate };

/**
 * Deal plates into the currently shortest column. Heights come from the authored `aspect` — at a fixed column width
 * a plate's height is exactly `width / aspect` — so the packing is computed rather than measured: it is identical on
 * the server and the client, needs no post-layout pass, and cannot shift once the photographs load.
 *
 * Inter-tile gaps are left out of the model. They are a fixed pixel amount against a column width that changes with
 * the viewport, and including them would make the packing viewport-dependent for a few percent of a tile's height —
 * while whenever the columns end up with the same number of plates, which is the common case, they cancel exactly.
 */
function packColumns(plates: Plate[]): Plate[][] {
  const columns: Plate[][] = Array.from({ length: COLUMNS }, () => []);
  const heights = new Array<number>(COLUMNS).fill(0);

  for (const plate of plates) {
    let shortest = 0;
    for (let i = 1; i < COLUMNS; i++) {
      if (heights[i] < heights[shortest]) shortest = i;
    }
    columns[shortest].push(plate);
    heights[shortest] += 1 / plate.image.aspect;
  }
  return columns;
}

/** Split the shoot at every feature, so each full-width plate sits between two independently packed runs. */
function toBlocks(gallery: GalleryImage[]): Block[] {
  const blocks: Block[] = [];
  let run: Plate[] = [];

  const flush = () => {
    if (run.length) blocks.push({ kind: 'run', columns: packColumns(run) });
    run = [];
  };

  gallery.forEach((image, order) => {
    if (image.feature) {
      flush();
      blocks.push({ kind: 'feature', plate: { image, order } });
    } else {
      run.push({ image, order });
    }
  });
  flush();
  return blocks;
}

/**
 * Template `masonry` — an Unsplash-style column grid. Nothing is cropped: each tile takes the photograph's own
 * aspect, so a mixed-orientation shoot keeps its framing instead of being squared off.
 *
 * Unlike `plates`, the tiles are inert — plain figures, not buttons. Promoting a tile to the hero is the plates
 * interaction, and it does not survive this layout: the hero sits above the title block, thousands of pixels above
 * a tile in the lower columns, so the click lands with nothing visibly happening. An affordance that reliably
 * appears broken is worse than none, and dropping it also spares keyboard users a tab stop per photograph.
 *
 * The columns are packed here rather than by CSS multi-column. Multicol balances the run above a `column-span: all`
 * feature, and balancing cannot split an unbreakable tile, so it left a visible hole above every full-width plate.
 * Dealing each plate into the shortest column closes those holes, and costs nothing at runtime because the heights
 * are already known from the data.
 */
export function GalleryMasonry({ gallery }: Props) {
  const blocks = toBlocks(gallery);

  return (
    <div className="project-masonry">
      {blocks.map((block, b) =>
        block.kind === 'feature' ? (
          <MasonryTile key={block.plate.image.src} plate={block.plate} column={0} feature />
        ) : (
          // The track itself is in globals.css so the phone tier can override it; `COLUMNS` still owns the count and
          // rides out as a custom property, which keeps it the one number both the packing and the grid read.
          <div className="project-masonry__run" key={`run-${b}`} style={{ '--masonry-cols': COLUMNS } as CSSProperties}>
            {block.columns.map((column, c) => (
              <div className="project-masonry__col" key={c}>
                {column.map(plate => (
                  <MasonryTile key={plate.image.src} plate={plate} column={c} />
                ))}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

type TileProps = { plate: Plate; column: number; feature?: boolean };

function MasonryTile({ plate: { image, order }, column, feature = false }: TileProps) {
  const [ref, seen] = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`project-masonry__item reveal${seen ? ' is-in' : ''}`}
      style={
        {
          position: 'relative',
          // `aspect-ratio` from the data — the same number the packing above used, so the reserved box and the
          // computed column height cannot disagree.
          aspectRatio: image.aspect,
          background: brand.modernTan,
          // Both are read by globals.css, which decides per tier what to do with them: `--col` drives the stagger
          // where there are neighbouring columns, `--order` replays the authored sequence where there are not.
          '--col': column,
          '--order': order
        } as CSSProperties
      }>
      {/* TEMPORARY — review aid, see FileBadge below. */}
      <FileBadge src={image.src} />
      {/* Nothing wraps this any more, so the alt text is the only description of the photograph — it carries it. */}
      <Image
        src={image.src}
        alt={image.alt}
        fill
        loading="lazy"
        // Column widths, not the hero's. A feature spans every column, so it needs its own hint or it loads a
        // half-width candidate and renders soft — and below 601px every tile is full width, feature or not.
        sizes={feature ? '(max-width: 600px) 92vw, 84vw' : '(max-width: 600px) 92vw, 42vw'}
        style={{ objectFit: 'cover' }}
        draggable={false}
      />
    </div>
  );
}

/**
 * TEMPORARY — stamps each tile with its file name so a shoot can be reviewed by name ("drop 6664", "move this up")
 * against the live page. The name is selectable, and the button beside it copies it to the clipboard. Not part of
 * the design: delete this function and the <FileBadge /> call in MasonryTile above to remove it, and nothing else
 * changes.
 */
function FileBadge({ src }: { src: string }) {
  const file = src.split('/').pop() ?? src;
  const [copied, setCopied] = useState(false);

  // The timer is cleared on unmount, and on a second click before the first has elapsed — otherwise a stale timeout
  // would flip the icon back while the newer copy is still being acknowledged.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(file);
    } catch {
      // Clipboard access can be refused (an insecure origin, or a denied permission). The name stays selectable, so
      // failing silently still leaves a way to copy it by hand.
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1400);
  };

  return (
    <span
      style={{
        position: 'absolute',
        left: 8,
        bottom: 8,
        zIndex: 2,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        maxWidth: 'calc(100% - 16px)',
        padding: '4px 4px 4px 7px',
        background: brand.navyInk,
        color: brand.boneWhite,
        font: '500 11px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace',
        letterSpacing: '0.02em'
      }}>
      <span
        style={{
          // Filenames are long and the columns are narrow on a phone; wrapping keeps the whole name readable, which
          // truncating it would defeat.
          overflowWrap: 'anywhere',
          userSelect: 'text',
          cursor: 'text'
        }}>
        {file}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? `Copied ${file}` : `Copy ${file}`}
        title={copied ? 'Copied' : 'Copy file name'}
        style={{
          flex: 'none',
          display: 'inline-flex',
          padding: 3,
          border: 'none',
          borderRadius: 2,
          background: 'none',
          color: 'inherit',
          cursor: 'pointer',
          opacity: copied ? 1 : 0.75
        }}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </span>
  );
}

/** TEMPORARY — goes with FileBadge. */
function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="5.75" y="5.75" width="8.5" height="8.5" rx="1.5" />
      <path d="M10.5 3.75A1.75 1.75 0 0 0 8.75 2h-5A1.75 1.75 0 0 0 2 3.75v5c0 .966.784 1.75 1.75 1.75" />
    </svg>
  );
}

/** TEMPORARY — goes with FileBadge. */
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M3 8.5 6.25 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
