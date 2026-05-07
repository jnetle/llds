'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PROJECTS, type Project } from '@/lib/projects';
import { useCompact } from '@/hooks/useCompact';
import { useReveal } from '@/hooks/useReveal';
import { Grid } from '@/components/ui/Grid';
import { motion } from '@/lib/tokens';

export function ProjectsGrid() {
  const compact = useCompact();

  // Bespoke 32px desktop / 20px mobile gutters maximize tile width for the
  // 2-col project grid. Section's standard 8vw gutters would crop ~165px off
  // each side on a 1440 viewport, so this stays raw.
  return (
    <section style={{ padding: compact ? '120px 20px 80px' : '140px 32px 120px' }}>
      <Grid cols="repeat(2, 1fr)" columnGap={32} rowGap={{ d: 96, m: 56 }} style={{ maxWidth: 1600, margin: '0 auto' }}>
        {PROJECTS.map((p, i) => (
          <ProjectsTile key={p.id} project={p} index={i} />
        ))}
      </Grid>
    </section>
  );
}

function ProjectsTile({ project, index }: { project: Project; index: number }) {
  const [ref, seen] = useReveal<HTMLElement>();
  const [hovered, setHovered] = useState(false);
  const delay = `${(index % 2) * 0.08}s`;

  return (
    <article
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity ${motion.durXSlow} ${motion.ease} ${delay}, transform ${motion.durXSlow} ${motion.ease} ${delay}`
      }}>
      <Link href={`/projects/${project.id}`} style={{ display: 'block', color: 'inherit' }}>
        <div
          style={{
            aspectRatio: '1440 / 1860',
            overflow: 'hidden',
            background: '#d8d4cb',
            marginBottom: 22
          }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url("${project.cover}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: hovered ? 'scale(1.03)' : 'scale(1)',
              transition: `transform 1.4s ${motion.ease}`
            }}
          />
        </div>
        <h2
          className="serif"
          style={{
            fontSize: 'clamp(22px, 2vw, 30px)',
            fontWeight: 300,
            letterSpacing: '0.005em',
            textAlign: 'center',
            margin: 0
          }}>
          {project.title}
        </h2>
      </Link>
    </article>
  );
}
