'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PROJECTS, type Project } from '@/lib/projects';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Grid } from '@/components/ui/Grid';
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

  const idx = PROJECTS.findIndex(p => p.id === project.id);
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  return (
    <div
      style={{
        opacity: opening ? 0 : 1,
        transition: `opacity ${motion.durMed} ease`
      }}>
      {/* Top bar — sits below the fixed global header. Bespoke 36px gutter to
          align tightly with the global header's content rhythm. */}
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

        <Link href={`/projects/${next.id}`} className="micro" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit' }}>
          Next:{' '}
          <span style={{}} className="serif">
            {next.title}
          </span>{' '}
          <span style={{ fontSize: 14, lineHeight: 1 }}>→</span>
        </Link>
      </div>

      {/* Hero image. The opening scale stays on the wrapper, not the <img>: the wrapper
          is also what gives `fill` its containing block, and transforming it scales the
          absolutely-positioned child exactly as it used to scale the painted background.
          No `overflow: hidden` here — the 1.05 bleed is meant to show. */}
      <div
        style={{
          position: 'relative',
          height: '85vh',
          background: brand.modernTan,
          transform: opening ? 'scale(1.05)' : 'scale(1)',
          transition: `transform ${motion.durXSlow} ${motion.ease}`
        }}>
        {/* No `key` on this: clicking a plate mutates src on the existing element, and
            the browser keeps painting the current image until the next one has fully
            decoded. A key would remount and blank the box mid-swap. */}
        <Image
          src={project.gallery[imgIndex].src}
          alt={project.gallery[imgIndex].alt}
          fill
          preload
          sizes="100vw"
          style={{ objectFit: 'cover' }}
          draggable={false}
        />
      </div>

      {/* Title block */}
      <Section padY="xxs">
        <Container maxWidth={1400} align="center">
          <Eyebrow style={{ marginBottom: 28 }}>
            {project.location} · {project.year}
          </Eyebrow>
          <Heading
            level="display"
            italic
            style={{ fontSize: 'clamp(48px, 7vw, 110px)', lineHeight: 0.98, letterSpacing: '-0.012em', maxWidth: '14ch' }}>
            {project.title}
          </Heading>
          <p style={{ ...text.body, fontSize: 19, marginTop: 8, maxWidth: '80ch' }}>{project.intro}</p>
        </Container>
      </Section>

      {/* Gallery */}
      <Section padTop="none" padBottom="sm" style={{ display: 'grid', gap: 24 }}>
        {project.gallery.map((image, i) => (
          <button
            key={image.src + i}
            onClick={() => setImgIndex(i)}
            aria-label={`View plate ${i + 1} of ${project.title}`}
            aria-pressed={imgIndex === i}
            style={{ cursor: 'pointer', textAlign: 'left', padding: 0, background: 'none', border: 'none' }}>
            <div style={{ position: 'relative', height: i === 1 ? '60vh' : '80vh', background: brand.modernTan }}>
              {/* The button's aria-label already names the action, and it overrides the
                  button's contents for the accessibility tree — so this alt is not read
                  out twice. It is here for crawlers, which read alt and not aria-label.
                  Do not "de-duplicate" it to alt="". */}
              <Image
                src={image.src}
                alt={image.alt}
                fill
                // Deliberately 100vw rather than the ~84vw these actually occupy: it makes
                // the srcset candidate identical to the hero's, so clicking a plate swaps
                // the hero straight from cache instead of fetching a near-identical width.
                sizes="100vw"
                style={{ objectFit: 'cover' }}
                draggable={false}
              />
            </div>
          </button>
        ))}
        <Eyebrow opacity={0.6}>Built by {project.builder}</Eyebrow>
      </Section>

      {/* Footer nav between projects — bespoke 36px gutter to align with top bar.
          Grid collapses to 1-col at ≤1024 via the cols-string default. */}
      <Grid
        cols="1fr 1fr 1fr"
        gap={32}
        alignItems="center"
        style={{
          borderTop: `1px solid ${color.hairline}`,
          padding: '60px 36px'
        }}>
        <Link
          href={`/projects/${prev.id}`}
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
          href={`/projects/${next.id}`}
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
