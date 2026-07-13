'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CATEGORY_LABELS, CATEGORY_ORDER, projectsByCategory, type Project, type ProjectCategory } from '@/lib/projects';
import { useCompact } from '@/hooks/useCompact';
import { useReveal } from '@/hooks/useReveal';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { Grid } from '@/components/ui/Grid';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { color, motion } from '@/lib/tokens';

type Filter = 'all' | ProjectCategory;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...CATEGORY_ORDER.map(cat => ({ value: cat, label: CATEGORY_LABELS[cat] }))
];

export function ProjectsGrid() {
  const compact = useCompact();
  const [active, setActive] = useState<Filter>('all');
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  // Same sticky treatment as the Services quick-links nav: a sentinel just above
  // the filter flips the "stuck" state as it scrolls under the top, and we hide
  // the fixed global header (via the shared `globalHeader:setHidden` event) so the
  // filter can sit flush at top:0 instead of colliding with it.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const dispatch = (hidden: boolean) => window.dispatchEvent(new CustomEvent('globalHeader:setHidden', { detail: { hidden } }));
    const io = new IntersectionObserver(
      ([entry]) => {
        const isStuck = !entry.isIntersecting;
        setStuck(isStuck);
        dispatch(isStuck);
      },
      { threshold: 0 }
    );
    io.observe(node);
    return () => {
      io.disconnect();
      dispatch(false);
    };
  }, []);

  // Bespoke 32px desktop / 20px mobile gutters maximize tile width for the
  // 2-col project grid. Section's standard 8vw gutters would crop ~165px off
  // each side on a 1440 viewport, so this stays raw.
  return (
    <>
      {/* Clearance so the filter rests below the fixed global header at page top */}
      <div aria-hidden style={{ height: compact ? 96 : 120 }} />

      {/* Sentinel: flips the sticky state when the filter reaches the top */}
      <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />

      {/* Sticky one-line collection filter — mirrors app/services/page.tsx */}
      <nav
        aria-label="Filter projects by collection"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: stuck ? 'rgba(244,240,232,0.97)' : 'rgba(244,240,232,0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${stuck ? color.inkSoft : color.hairline}`,
          boxShadow: stuck ? '0 6px 24px rgba(42,46,37,0.06)' : 'none',
          padding: compact ? '14px 20px' : '16px 32px',
          transition: `background ${motion.durFast} ease, border-color ${motion.durFast} ease, box-shadow ${motion.durFast} ease`
        }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: compact ? 22 : 32 }}>
          {FILTERS.map(f => (
            <FilterButton key={f.value} label={f.label} isActive={active === f.value} onSelect={() => setActive(f.value)} />
          ))}
        </div>
      </nav>

      {/* Grid — crossfades to the active collection. Keyed so a filter change
          remounts and replays the entrance fade. */}
      <section style={{ padding: compact ? '0 20px 80px' : '0 32px 120px' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto' }}>
          <FilterView key={active} active={active} compact={compact} />
        </div>
      </section>
    </>
  );
}

function FilterButton({ label, isActive, onSelect }: { label: string; isActive: boolean; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  const lit = isActive || hovered;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="micro"
      style={{
        color: color.ink,
        opacity: lit ? 1 : 0.5,
        paddingBottom: 4,
        borderBottom: `1px solid ${isActive ? color.ink : 'transparent'}`,
        transition: `opacity ${motion.durFast} ${motion.ease}, border-color ${motion.durFast} ${motion.ease}`
      }}>
      {label}
    </button>
  );
}

function FilterView({ active, compact }: { active: Filter; compact: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(false);

  // Flip to shown on the next frame so the CSS transition has a 0→1 to animate.
  // Reduced-motion is handled in the styles below (opacity/transform read
  // `reduced` directly), so no synchronous state work is needed here.
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const groups = active === 'all' ? CATEGORY_ORDER : [active];

  return (
    <div
      style={{
        marginTop: compact ? 40 : 56,
        opacity: shown || reduced ? 1 : 0,
        transform: shown || reduced ? 'none' : 'translateY(16px)',
        transition: reduced ? undefined : `opacity ${motion.durMed} ${motion.ease}, transform ${motion.durMed} ${motion.ease}`
      }}>
      {groups.map((cat, i) => {
        const group = projectsByCategory(cat);
        if (!group.length) return null;
        const isLast = i === groups.length - 1;
        return (
          <div key={cat} style={{ marginBottom: isLast ? 0 : compact ? 72 : 120 }}>
            {active === 'all' && (
              <Eyebrow size="md" style={{ marginBottom: compact ? 24 : 32 }}>
                — {CATEGORY_LABELS[cat]}
              </Eyebrow>
            )}
            <Grid cols="repeat(2, 1fr)" columnGap={32} rowGap={{ d: 96, m: 56 }}>
              {group.map((p, idx) => (
                <ProjectsTile key={p.id} project={p} index={idx} />
              ))}
            </Grid>
          </div>
        );
      })}
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
