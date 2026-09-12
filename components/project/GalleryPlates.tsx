import Image from 'next/image';
import { useReveal } from '@/hooks/useReveal';
import type { GalleryImage } from '@/lib/projects';
import { brand } from '@/lib/tokens';

type Props = {
  gallery: GalleryImage[];
  selected: number;
  onSelect: (index: number) => void;
  title: string;
};

/**
 * Template `plates` — the original treatment. Every photograph is cropped to a full-width band of fixed height, and
 * clicking one promotes it to the hero above. It reads as an edit rather than a contact sheet, so it suits a project
 * whose shoot has been cut to a handful of frames; a full shoot renders tens of screens of scrolling here.
 */
export function GalleryPlates({ gallery, selected, onSelect, title }: Props) {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {gallery.map((image, i) => (
        <Plate key={image.src + i} image={image} index={i} selected={selected === i} onSelect={() => onSelect(i)} title={title} />
      ))}
    </div>
  );
}

type PlateProps = {
  image: GalleryImage;
  index: number;
  selected: boolean;
  onSelect: () => void;
  title: string;
};

function Plate({ image, index, selected, onSelect, title }: PlateProps) {
  const [ref, seen] = useReveal<HTMLDivElement>();

  return (
    <button
      onClick={onSelect}
      aria-label={`View plate ${index + 1} of ${title}`}
      aria-pressed={selected}
      style={{ cursor: 'pointer', textAlign: 'left', padding: 0, background: 'none', border: 'none' }}>
      {/* The second band is shorter on purpose — three equal bands read as a stack rather than a sequence. */}
      {/* No `--reveal-delay`: a plate is a full-width band, so it enters view alone and has no neighbour to stagger
          against. Delaying by index would just make the tenth band hang for the better part of a second. */}
      {/* Heights are classes so the phone tier is right on the server. `svh` below 601px, not `vh`: a mobile browser
          measures `vh` against the viewport with its chrome retracted, so an 80vh band overflowed the screen on load
          and then settled — and a band taller than the screen can never be seen whole. */}
      <div
        ref={ref}
        className={`reveal${seen ? ' is-in' : ''} ${index === 1 ? 'h-[42svh] sm:h-[60vh]' : 'h-[56svh] sm:h-[80vh]'}`}
        style={{ position: 'relative', background: brand.modernTan }}>
        {/* The button's aria-label names the action, so the image inside is decorative. */}
        <Image
          src={image.src}
          alt={image.alt}
          fill
          loading="lazy"
          // 100vw rather than the ~84vw these occupy, so the srcset candidate matches the hero's and clicking a
          // plate swaps it straight from cache instead of fetching a near-identical width.
          sizes="100vw"
          style={{ objectFit: 'cover' }}
          draggable={false}
        />
      </div>
    </button>
  );
}
