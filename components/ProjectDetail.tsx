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
      {/* Top bar. Bespoke 36px gutter to align with the global header. */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '110px 36px 24px',
          borderBottom: `1px solid ${color.hairline}`,
          gap: 16
        }}>
        <Link href="/projects" className="micro" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit' }}>
          <span style={{ fontSize: 14, lineHeight: 1 }}>←</span> All Projects
        </Link>

        <Link
          href={`/projects/${next.slug}`}
          className="micro"
          style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit' }}>
          Next:{' '}
          <span style={{}} className="serif">
            {next.title}
          </span>{' '}
          <span style={{ fontSize: 14, lineHeight: 1 }}>→</span>
        </Link>
      </div>

      {/* Hero image. The opening scale stays on the wrapper, not the <img>. */}
      <div
        style={{
          position: 'relative',
          height: '85vh',
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

      {/* Footer nav between projects. Bespoke 36px gutter, to align with the top bar. */}
      <Grid
        cols="1fr 1fr 1fr"
        gap={32}
        alignItems="center"
        style={{
          borderTop: `1px solid ${color.hairline}`,
          padding: '60px 36px'
        }}>
        <Link
          href={`/projects/${prev.slug}`}
          className="micro"
          style={{ display: 'flex', alignItems: 'center', gap: 12, justifySelf: 'start', color: 'inherit' }}>
          <span style={{ fontSize: 14 }}>←</span>
          <span style={{ display: 'grid', gap: 4, textAlign: 'left' }}>
            <span style={{ opacity: 0.5 }}>Previous</span>
            <span className="serif" style={{ fontSize: 18, opacity: 0.95, textTransform: 'none', letterSpacing: 0 }}>
              {prev.title}
            </span>
          </span>
        </Link>
        <Link
          href="/projects"
          className="micro"
          style={{ justifySelf: 'center', borderBottom: `1px solid ${color.ink}`, paddingBottom: 4, color: 'inherit' }}>
          All Projects
        </Link>
        <Link
          href={`/projects/${next.slug}`}
          className="micro"
          style={{ display: 'flex', alignItems: 'center', gap: 12, justifySelf: 'end', color: 'inherit' }}>
          <span style={{ display: 'grid', gap: 4, textAlign: 'right' }}>
            <span style={{ opacity: 0.5 }}>Next</span>
            <span className="serif" style={{ fontSize: 18, opacity: 0.95, textTransform: 'none', letterSpacing: 0 }}>
              {next.title}
            </span>
          </span>
          <span style={{ fontSize: 14 }}>→</span>
        </Link>
      </Grid>
    </div>
  );
}
