'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PROJECTS, type Project } from '@/lib/projects';
import { useReveal } from '@/hooks/useReveal';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { Grid } from '@/components/ui/Grid';
import { brand, motion } from '@/lib/tokens';

export function ProjectsGrid() {
  // Bespoke 32px/20px gutters maximize tile width; Section's 8vw would crop ~165px off each side at 1440.
  // The tiers are Tailwind classes rather than `useCompact()`: that hook initialises `false`, so every one of these
  // used to render its desktop value on the server and at first paint, then reflow on hydrate.
  return (
    <>
      {/* Clearance so the grid starts below the fixed global header */}
      <div aria-hidden className="h-[96px] lg:h-[120px]" />

      <section className="px-[20px] pb-[80px] lg:px-[32px] lg:pb-[120px]">
        <div style={{ maxWidth: 1600, margin: '0 auto' }}>
          {/* The grid has no visible heading, so this carries the page's one <h1>. */}
          <h1 className="sr-only">Projects — Laurel Leaf Design Studio</h1>
          <ProjectsView />
        </div>
      </section>
    </>
  );
}

function ProjectsView() {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(false);

  // Flip on the next frame so the CSS transition has a 0→1 to animate. Reduced-motion is handled in the styles below.
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="mt-[40px] lg:mt-[56px]"
      style={{
        opacity: shown || reduced ? 1 : 0,
        transform: shown || reduced ? 'none' : 'translateY(16px)',
        transition: reduced ? undefined : `opacity ${motion.durMed} ${motion.ease}, transform ${motion.durMed} ${motion.ease}`
      }}>
      <Grid
        cols={{ d: 'repeat(4, 1fr)', t: 'repeat(3, 1fr)', m: '1fr' }}
        columnGap={{ d: 32, t: 24, m: 0 }}
        rowGap={{ d: 64, t: 40, m: 56 }}>
        {PROJECTS.map((p, idx) => (
          <ProjectsTile key={p.slug} project={p} index={idx} />
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
      <Link href={`/projects/${project.slug}`} style={{ display: 'block', color: 'inherit' }}>
        {/* `position: relative` is load-bearing: `fill` renders an absolutely-positioned <img>, and body is itself
            relative, so a missing position lets the photo cover the whole page rather than failing loudly. */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '1440 / 1860',
            overflow: 'hidden',
            background: brand.modernTan,
            marginBottom: 22
          }}>
          {/* The class rides on the <img> because it carries only a transform, which replaced elements do honour. */}
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            fill
            className="project-tile__media"
            // Tiers are 1 / 3 / 4 columns at the sm and lg breakpoints. Mobile is a single tile between 20px gutters,
            // so it asks for the exact box. The last two split because the container caps at 1600: a flat 25vw would
            // ask for 500px slots on a 2000px display where the tile is 376.
            sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1024px) 33vw, (max-width: 1664px) calc(25vw - 40px), 376px"
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
