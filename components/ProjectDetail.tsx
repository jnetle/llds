'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PROJECTS, formatLocationLong, type Project } from '@/lib/projects';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Grid } from '@/components/ui/Grid';
import { GalleryMasonry } from '@/components/project/GalleryMasonry';
import { GalleryPlates } from '@/components/project/GalleryPlates';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { brand, color, motion, text } from '@/lib/tokens';

type Props = {
  project: Project;
};

export function ProjectDetail({ project }: Props) {
  const [imgIndex, setImgIndex] = useState(0);
  const [opening, setOpening] = useState(true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpening(false));
    return () => cancelAnimationFrame(raf);
  }, []);

  const meta = [`${formatLocationLong(project.location)} · ${project.year}`, project.scope].filter(Boolean).join(' | ');

  const idx = PROJECTS.findIndex(p => p.slug === project.slug);
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  return (
    <div
      style={{
        opacity: opening ? 0 : 1,
        transition: `opacity ${motion.durMed} ease`
      }}>
      {/* Top bar. Bespoke gutter to align with the global header — 18px on a phone, 36px above it — and clearance of
          the header's own height plus a beat: it is ~68px on a phone and ~74px above. One row at every width; the
          phone tier drops the next project's title to keep it that way, which is `.project-topbar__*` in
          globals.css. Layout lives there rather than inline, or the media query could not reach it. */}
      <div
        className="project-topbar flex items-center justify-between gap-[16px] px-[18px] pt-[78px] pb-[14px] sm:px-[36px] sm:pt-[110px] sm:pb-[24px]"
        style={{ borderBottom: `1px solid ${color.hairline}` }}>
        <Link href="/projects" className="micro project-topbar__link" style={{ color: 'inherit' }}>
          <span className="project-topbar__arrow" aria-hidden>
            ←
          </span>
          All Projects
        </Link>

        <Link
          href={`/projects/${next.slug}`}
          aria-label={`Next project: ${next.title}`}
          className="micro project-topbar__link"
          style={{ color: 'inherit' }}>
          <span className="project-topbar__label">Next</span>
          <span className="project-topbar__title serif">{next.title}</span>
          <span className="project-topbar__arrow" aria-hidden>
            →
          </span>
        </Link>
      </div>

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
        {/* No `key`: clicking a plate mutates src on the existing element rather than remounting. */}
        {/* This is the LCP element on every project page, and it was on `preload` — which emits a preload link but
            leaves the <img> lazy, so Next flagged it. `loading="eager"` + `fetchPriority="high"` matches HeroGrid:
            React 19 emits the preload link itself for an eager high-priority image, without Next adding a second
            competing one. */}
        <Image
          src={project.gallery[imgIndex].src}
          alt={project.gallery[imgIndex].alt}
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
            {project.title}
          </Heading>
          {/* One <p> per paragraph. Rendering the array directly would type-check and then silently run the
              paragraphs together, since React concatenates an array of strings with nothing between them. */}
          <div style={{ marginTop: 8, maxWidth: '80ch' }}>
            {project.intro.map((paragraph, i) => (
              <p key={i} style={{ ...text.body, fontSize: 19, margin: i === 0 ? 0 : '1.1em 0 0' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      </Section>

      {/* Gallery. The layout is per-project data, not a decision this component makes — a shoot cut to a few frames
          wants the full-bleed plates, a full one wants the masonry. `components/project/Gallery*.tsx`. */}
      <Section padTop="none" padBottom="sm">
        {project.galleryTemplate === 'masonry' ? (
          // Masonry tiles are inert, so they neither read nor set the hero index — see the note in GalleryMasonry.
          <GalleryMasonry gallery={project.gallery} />
        ) : (
          <GalleryPlates gallery={project.gallery} selected={imgIndex} onSelect={setImgIndex} title={project.title} />
        )}
        <Eyebrow opacity={0.6} style={{ marginTop: 24 }}>
          Built by {project.builder}
        </Eyebrow>
      </Section>

      {/* Footer nav between projects. Bespoke gutter, to align with the top bar. Three across at every tier — on a
          phone the outer tracks shrink to the arrows alone and the titles drop out (globals.css `.project-nav__*`),
          so the whole thing is one 44px row instead of three stacked links. Layout and alignment live there rather
          than inline: an inline `display` or `justifySelf` would outrank the phone tier's media query.
          The titles stay in each link's `aria-label`, which is also why it is set at every width — the visible
          `Previous <title>` and the accessible name then say the same thing wherever both exist. */}
      <Grid
        cols={{ d: '1fr 1fr 1fr', t: '1fr 1fr 1fr', m: 'auto 1fr auto' }}
        gap={{ d: 32, t: 28, m: 12 }}
        alignItems="center"
        className="px-[18px] py-[28px] sm:px-[36px] sm:py-[44px] lg:py-[60px]"
        style={{ borderTop: `1px solid ${color.hairline}` }}>
        <Link
          href={`/projects/${prev.slug}`}
          aria-label={`Previous project: ${prev.title}`}
          className="micro project-nav__link project-nav__link--prev"
          style={{ color: 'inherit' }}>
          <span className="project-nav__arrow" aria-hidden>
            ←
          </span>
          <span className="project-nav__stack">
            <span style={{ opacity: 0.5 }}>Previous</span>
            <span className="serif" style={{ fontSize: 18, opacity: 0.95, textTransform: 'none', letterSpacing: 0 }}>
              {prev.title}
            </span>
          </span>
        </Link>
        <Link
          href="/projects"
          className="micro project-nav__link project-nav__link--all"
          style={{ borderBottom: `1px solid ${color.ink}`, paddingBottom: 4, color: 'inherit' }}>
          All Projects
        </Link>
        <Link
          href={`/projects/${next.slug}`}
          aria-label={`Next project: ${next.title}`}
          className="micro project-nav__link project-nav__link--next"
          style={{ color: 'inherit' }}>
          <span className="project-nav__stack">
            <span style={{ opacity: 0.5 }}>Next</span>
            <span className="serif" style={{ fontSize: 18, opacity: 0.95, textTransform: 'none', letterSpacing: 0 }}>
              {next.title}
            </span>
          </span>
          <span className="project-nav__arrow" aria-hidden>
            →
          </span>
        </Link>
      </Grid>
    </div>
  );
}
