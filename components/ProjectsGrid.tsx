'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PROJECTS, type Project } from '@/lib/projects';
import { useCompact } from '@/hooks/useCompact';
import { useReveal } from '@/hooks/useReveal';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { Grid } from '@/components/ui/Grid';
import { brand, motion } from '@/lib/tokens';

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
          {/* The index of fifteen projects had no heading of any kind — the tiles are
              <h3>s under nothing. The design has no room for a visible one above the
              grid, so this is hidden: it gives the page a document outline without
              changing the layout. A visible editorial line here would be worth more,
              but that is a design decision, not an SEO fix. */}
          <h1 className="sr-only">Projects — Laurel Leaf Design Studio</h1>
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
  const delay = `${(index % 2) * 0.08}s`;

  return (
    <article
      ref={ref}
      className="project-tile"
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity ${motion.durXSlow} ${motion.ease} ${delay}, transform ${motion.durXSlow} ${motion.ease} ${delay}`
      }}>
      <Link href={`/projects/${project.id}`} style={{ display: 'block', color: 'inherit' }}>
        {/* `position: relative` is load-bearing: `fill` renders an absolutely-positioned
            <img>, and body is itself `position: relative` (globals.css) — so without a
            positioned parent here the photo escapes and covers the whole page. */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '1440 / 1860',
            overflow: 'hidden',
            background: brand.modernTan,
            marginBottom: 22
          }}>
          {/* The class rides on the <img> itself — it carries only the hover zoom, and
              `transform` applies to replaced elements. See globals.css. */}
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            fill
            className="project-tile__media"
            // Tiers are 2 / 3 / 4 columns at the sm (601px) and lg (1025px) breakpoints.
            // The last two entries split because the container caps at maxWidth 1600: a
            // flat 25vw would ask for 500px slots on a 2000px display where the tile is 376.
            sizes="(max-width: 600px) 50vw, (max-width: 1024px) 33vw, (max-width: 1664px) calc(25vw - 40px), 376px"
            style={{ objectFit: 'cover' }}
            draggable={false}
          />
        </div>
        <h3
          className="serif"
          style={{
            fontSize: 'clamp(22px, 2vw, 30px)',
            fontWeight: 300,
            letterSpacing: '0.005em',
            margin: 0
          }}>
          {project.title}
        </h3>
      </Link>
    </article>
  );
}
