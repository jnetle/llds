'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PROJECTS, type Project } from '@/lib/projects';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Grid } from '@/components/ui/Grid';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { color, motion, text } from '@/lib/tokens';

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
        <Eyebrow opacity={0.6}>{project.discipline}</Eyebrow>
        <Link href={`/projects/${next.id}`} className="micro" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit' }}>
          Next:{' '}
          <span style={{ fontStyle: 'italic' }} className="serif">
            {next.title}
          </span>{' '}
          <span style={{ fontSize: 14, lineHeight: 1 }}>→</span>
        </Link>
      </div>

      {/* Hero image */}
      <div
        style={{
          height: '85vh',
          backgroundImage: `url("${project.gallery[imgIndex]}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: opening ? 'scale(1.05)' : 'scale(1)',
          transition: `transform ${motion.durXSlow} ${motion.ease}`
        }}
      />

      {/* Title block */}
      <Section padY="xs">
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
          <p style={{ ...text.body, fontSize: 19, marginTop: 60, maxWidth: '52ch' }}>{project.intro}</p>
        </Container>
      </Section>

      {/* Material palette */}
      <Section padTop="none" padBottom="xs" style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
        <Eyebrow opacity={0.5}>Material Palette</Eyebrow>
        <div style={{ display: 'flex', gap: 16 }}>
          {project.palette.map(c => (
            <div key={c} style={{ width: 64, height: 64, background: c, borderRadius: '50%' }} />
          ))}
        </div>
      </Section>

      {/* Gallery */}
      <Section padTop="none" padBottom="sm" style={{ display: 'grid', gap: 24 }}>
        {project.gallery.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setImgIndex(i)}
            aria-label={`View plate ${i + 1} of ${project.title}`}
            aria-pressed={imgIndex === i}
            style={{ cursor: 'pointer', textAlign: 'left', padding: 0, background: 'none', border: 'none' }}>
            <div
              style={{
                height: i === 1 ? '60vh' : '80vh',
                backgroundImage: `url("${src}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <Eyebrow size="sm" opacity={0.5} style={{ marginTop: 12 }}>
              Plate 0{i + 1} · {project.title}
            </Eyebrow>
          </button>
        ))}
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
            <span className="serif" style={{ fontStyle: 'italic', fontSize: 18, opacity: 0.95, textTransform: 'none', letterSpacing: 0 }}>
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
            <span className="serif" style={{ fontStyle: 'italic', fontSize: 18, opacity: 0.95, textTransform: 'none', letterSpacing: 0 }}>
              {next.title}
            </span>
          </span>
          <span style={{ fontSize: 14 }}>→</span>
        </Link>
      </Grid>
    </div>
  );
}
