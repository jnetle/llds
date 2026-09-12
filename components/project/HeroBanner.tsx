import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { FileBadge } from '@/components/project/FileBadge';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { brand, motion, text } from '@/lib/tokens';
import type { ProjectHeroProps } from '@/components/project/heroProps';

/**
 * Template `banner` — the original treatment, and the default. One photograph cropped to the full viewport width,
 * with the title block stacked beneath it. It wants a frame that reads at 16:9 or wider; a portrait one loses its
 * top and bottom to the crop, which is what `split` exists for.
 */
export function HeroBanner({ image, title, meta, intro, opening }: ProjectHeroProps) {
  return (
    <>
      {/* Hero image. The opening scale stays on the wrapper, not the <img>. Height is a class so it is right on the
          server, and `svh` on a phone: `vh` there is measured against the viewport with the browser chrome retracted,
          so the hero pushed the title block off-screen on load and then settled as the bar collapsed.
          With the top bar gone below 601px this is the first thing on the page, sitting under the fixed header the
          way the home hero does — which is what the header's own scrim gradient is for. */}
      <div
        className="h-[62svh] sm:h-[85vh]"
        style={{
          position: 'relative',
          background: brand.modernTan,
          transform: opening ? 'scale(1.05)' : 'scale(1)',
          transition: `transform ${motion.durXSlow} ${motion.ease}`
        }}>
        {/* TEMPORARY — review aid, see components/project/FileBadge.tsx. */}
        <FileBadge src={image.src} placement="top" />
        {/* No `key`: clicking a plate mutates src on the existing element rather than remounting. */}
        {/* This is the LCP element on every project page, and it was on `preload` — which emits a preload link but
            leaves the <img> lazy, so Next flagged it. `loading="eager"` + `fetchPriority="high"` matches HeroGrid:
            React 19 emits the preload link itself for an eager high-priority image, without Next adding a second
            competing one. */}
        <Image
          src={image.src}
          alt={image.alt}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          style={{ objectFit: 'cover' }}
          draggable={false}
        />
      </div>

      {/* Title block */}
      <Section padY="xxs">
        <Container maxWidth={1400} align="center">
          {/* Built as a string rather than JSX fragments so the separators are exact — a project with no authored
              `scope` drops the segment and its divider together, instead of leaving a trailing pipe. The region is
              spelled out here and only here; see `formatLocationLong`. */}
          <Eyebrow style={{ marginBottom: 28 }}>{meta}</Eyebrow>
          <Heading
            level="display"
            italic
            style={{ fontSize: 'clamp(48px, 7vw, 110px)', lineHeight: 0.98, letterSpacing: '-0.012em', maxWidth: '14ch' }}>
            {title}
          </Heading>
          {/* One <p> per paragraph. Rendering the array directly would type-check and then silently run the
              paragraphs together, since React concatenates an array of strings with nothing between them. */}
          <div style={{ marginTop: 8, maxWidth: '80ch' }}>
            {intro.map((paragraph, i) => (
              <p key={i} style={{ ...text.body, fontSize: 19, margin: i === 0 ? 0 : '1.1em 0 0' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
