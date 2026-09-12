import Image from 'next/image';
import type { CSSProperties } from 'react';
import { useReveal } from '@/hooks/useReveal';
import type { GalleryImage } from '@/lib/projects';
import { brand } from '@/lib/tokens';

type Props = {
  gallery: GalleryImage[];
};

/**
 * How many columns the grid runs. The columns are real elements, so both the packing and the grid track derive from
 * this one number — the track is written inline below rather than left in the stylesheet, because a `repeat(2, 1fr)`
 * sitting in CSS would silently disagree the moment this changed, and each run would wrap into a broken second row.
 */
const COLUMNS = 2;

/** A run of column-packed plates, or a single plate spanning the full width. */
type Block = { kind: 'run'; columns: GalleryImage[][] } | { kind: 'feature'; plate: GalleryImage };

/**
 * Deal plates into the currently shortest column. Heights come from the authored `aspect` — at a fixed column width
 * a plate's height is exactly `width / aspect` — so the packing is computed rather than measured: it is identical on
 * the server and the client, needs no post-layout pass, and cannot shift once the photographs load.
 *
 * Inter-tile gaps are left out of the model. They are a fixed pixel amount against a column width that changes with
 * the viewport, and including them would make the packing viewport-dependent for a few percent of a tile's height —
 * while whenever the columns end up with the same number of plates, which is the common case, they cancel exactly.
 */
function packColumns(plates: GalleryImage[]): GalleryImage[][] {
  const columns: GalleryImage[][] = Array.from({ length: COLUMNS }, () => []);
  const heights = new Array<number>(COLUMNS).fill(0);

  for (const plate of plates) {
    let shortest = 0;
    for (let i = 1; i < COLUMNS; i++) {
      if (heights[i] < heights[shortest]) shortest = i;
    }
    columns[shortest].push(plate);
    heights[shortest] += 1 / plate.aspect;
  }
  return columns;
}

/** Split the shoot at every feature, so each full-width plate sits between two independently packed runs. */
function toBlocks(gallery: GalleryImage[]): Block[] {
  const blocks: Block[] = [];
  let run: GalleryImage[] = [];

  const flush = () => {
    if (run.length) blocks.push({ kind: 'run', columns: packColumns(run) });
    run = [];
  };

  for (const image of gallery) {
    if (image.feature) {
      flush();
      blocks.push({ kind: 'feature', plate: image });
    } else {
      run.push(image);
    }
  }
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
          <MasonryTile key={block.plate.src} image={block.plate} column={0} feature />
        ) : (
          <div className="project-masonry__run" key={`run-${b}`} style={{ gridTemplateColumns: `repeat(${COLUMNS}, 1fr)` }}>
            {block.columns.map((column, c) => (
              <div className="project-masonry__col" key={c}>
                {column.map(image => (
                  <MasonryTile key={image.src} image={image} column={c} />
                ))}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

type TileProps = { image: GalleryImage; column: number; feature?: boolean };

function MasonryTile({ image, column, feature = false }: TileProps) {
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
          // Neighbouring columns rise a beat apart. Keyed off the column, not the sequence index, or the last plate
          // in the shoot would wait several seconds before appearing.
          '--reveal-delay': `${column * 0.08}s`
        } as CSSProperties
      }>
      {/* Nothing wraps this any more, so the alt text is the only description of the photograph — it carries it. */}
      <Image
        src={image.src}
        alt={image.alt}
        fill
        loading="lazy"
        // Column widths, not the hero's. A feature spans every column, so it needs its own hint or it loads a
        // half-width candidate and renders soft.
        sizes={feature ? '(max-width: 600px) 92vw, 84vw' : '(max-width: 600px) 46vw, 42vw'}
        style={{ objectFit: 'cover' }}
        draggable={false}
      />
    </div>
  );
}
