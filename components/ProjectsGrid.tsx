'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PROJECTS, type Project } from '@/lib/projects';
import { useCompact } from '@/hooks/useCompact';
import { useReveal } from '@/hooks/useReveal';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { Grid } from '@/components/ui/Grid';
import { motion } from '@/lib/tokens';

export function ProjectsGrid() {
  const compact = useCompact();

  // Bespoke 32px desktop / 20px mobile gutters maximize tile width for the
  // project grid. Section's standard 8vw gutters would crop ~165px off each
  // side on a 1440 viewport, so this stays raw.
  return (
    <>
      {/* Clearance so the grid starts below the fixed global header */}
      <div aria-hidden style={{ height: compact ? 96 : 120 }} />

      <section style={{ padding: compact ? '0 20px 80px' : '0 32px 120px' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto' }}>
          <ProjectsView compact={compact} />
        </div>
      </section>
    </>
  );
}

function ProjectsView({ compact }: { compact: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(false);

  // Flip to shown on the next frame so the CSS transition has a 0→1 to animate.
  // Reduced-motion is handled in the styles below (opacity/transform read
  // `reduced` directly), so no synchronous state work is needed here.
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      style={{
        marginTop: compact ? 40 : 56,
        opacity: shown || reduced ? 1 : 0,
        transform: shown || reduced ? 'none' : 'translateY(16px)',
        transition: reduced ? undefined : `opacity ${motion.durMed} ${motion.ease}, transform ${motion.durMed} ${motion.ease}`
      }}>
      <Grid
        cols={{ d: 'repeat(4, 1fr)', t: 'repeat(3, 1fr)', m: 'repeat(2, 1fr)' }}
        columnGap={{ d: 32, t: 24, m: 16 }}
        rowGap={{ d: 64, m: 40 }}>
        {PROJECTS.map((p, idx) => (
          <ProjectsTile key={p.id} project={p} index={idx} />
        ))}
      </Grid>
    </div>
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
        <h3
          className="serif"
          style={{
            fontSize: 'clamp(22px, 2vw, 30px)',
            fontWeight: 300,
            letterSpacing: '0.005em',
            textAlign: 'center',
            margin: 0
          }}>
          {project.title}
        </h3>
      </Link>
    </article>
  );
}
