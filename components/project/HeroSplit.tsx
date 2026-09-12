import Image from 'next/image';
import { FileBadge } from '@/components/project/FileBadge';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Heading';
import { brand, motion, text } from '@/lib/tokens';
import type { ProjectHeroProps } from '@/components/project/heroProps';

/**
 * Template `split` — photograph on the left, title block on the right, built the way the About hero is. For the
 * project whose best opening frame is portrait: `banner` crops to a band wider than 16:9, and a room shot vertically
 * is usually vertical *because* the height is the subject.
 *
 * The photograph fills its half outright — left edge to column edge, top to bottom, `objectFit: cover` taking up the
 * difference — rather than being sized by its own `aspect`. That is the About behaviour, and it is what keeps the
 * column honest: an aspect-sized box leaves the frame floating in its half the moment the copy is the taller of the
 * two, and it cannot be made to fill without also letting it set the section's height.
 *
 * What makes this kind to a portrait is the *shape of the box*, not an absence of cropping: half a viewport, full
 * height, is itself roughly a portrait, so a 3/4 frame loses a little top and bottom here against the two-thirds it
 * loses to a full-width band. The row is `min-h`, not `h` — copy longer than the viewport grows the section rather
 * than overflowing it, and the photograph stretches with it.
 */
export function HeroSplit({ image, title, meta, intro, opening }: ProjectHeroProps) {
  return (
    // One column until 1025px: side-by-side needs room for a real measure of text beside the frame, and below that
    // tier the copy column would be narrower than the photograph. Stacked, it reads as `banner` with a taller crop.
    //
    // `min-h` plus the default `stretch` alignment is what fills the left half. The row is at least 88vh and grows
    // with whichever column is taller, and both items stretch to it — so the photograph is exactly as tall as the
    // section at every width, with no height of its own to keep in step. Do not put `items-center` back: it would
    // shrink each item to its content and strand the frame in the middle of its half again.
    //
    // The trailing margin is this template's own, and it has to be: the gallery's <Section> below runs `padTop="none"`
    // because under `banner` the title block's own section already supplies that space. `split` has no such block —
    // it ends on a full-bleed photo edge running the width of the page — so without this the first gallery plate
    // butts straight onto the hero and the two read as one continuous stack. Mirrors `sectionPadY.xs` (32 / 80),
    // a step above the 24/60 `banner` ends on, because a hard edge needs more of a stop than a paragraph does.
    <section className="mb-[32px] grid sm:mb-[80px] lg:min-h-[88vh] lg:grid-cols-2">
      {/* The photograph's half. It bleeds to the left edge at every tier — the gutter belongs to the copy, not to
          the frame — and to the column edge on the right, so the two halves meet with no seam. Height comes from the
          grid stretch at the split tier; stacked, there is no sibling in the row to stretch against, so the band is
          given one outright. The opening scale stays on this wrapper rather than the <img>, as it does in `banner`. */}
      <div
        className="h-[72svh] lg:h-auto"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: brand.modernTan,
          transform: opening ? 'scale(1.05)' : 'scale(1)',
          transition: `transform ${motion.durXSlow} ${motion.ease}`
        }}>
        {/* TEMPORARY — review aid, see components/project/FileBadge.tsx. */}
        <FileBadge src={image.src} placement="top" />
        {/* LCP element, same as the banner's hero — see the note there on `loading`/`fetchPriority` over `priority`.
            `sizes` tracks the column: full width stacked, a little under half once the grid splits. */}
        <Image
          src={image.src}
          alt={image.alt}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 1024px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
          draggable={false}
        />
      </div>

      {/* Title block, and the gutter is the whole trick. It is symmetric from 601px up, so the copy stands off the
          photograph by exactly what it stands off the right edge — the two gaps are one value, and cannot drift.
          The measure is held by that same gutter rather than by a `max-width` on the text: a cap would pull the
          text off the right gutter and make the gaps unequal again, which is the thing being fixed. So the padding
          is `max(8vw, half the slack over 620px)` — 8vw while the column is narrow, widening once the half is wide
          enough that the line would otherwise run past ~60 characters. At 1600 that is 8vw on the nose; on a 2560
          display it grows to ~370px a side and the measure stays put instead of stretching to 96 characters. */}
      <div className="flex flex-col justify-center px-[24px] pt-[36px] sm:px-[max(8vw,calc((100%-620px)/2))] lg:py-[60px]">
        {/* Composed upstream so the separators are exact — see the note in `ProjectDetail`. */}
        <Eyebrow style={{ marginBottom: 24 }}>{meta}</Eyebrow>
        {/* Smaller than the banner's display size: this heading has a column, not a page, so `7vw` would set two or
            three words per line. It is still the page's only <h1>. */}
        <Heading
          level="display"
          italic
          style={{ fontSize: 'clamp(44px, 4.6vw, 78px)', lineHeight: 1, letterSpacing: '-0.012em', maxWidth: '12ch' }}>
          {title}
        </Heading>
        {/* One <p> per paragraph — an array of strings renders with nothing between them. */}
        <div style={{ marginTop: 20 }}>
          {intro.map((paragraph, i) => (
            <p key={i} style={{ ...text.body, fontSize: 18, margin: i === 0 ? 0 : '1.1em 0 0' }}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
