'use client';

import Image from 'next/image';
import { type ReactNode } from 'react';
import type { Project } from '@/lib/projects';
import { useCompact } from '@/hooks/useCompact';
import { color } from '@/lib/tokens';
import { GridCell } from './GridCell';

// Placeholder pending real photography — migrates to shared/home-hero.jpg on R2.
// w=2400 matches the compression ceiling in AGENTS.md; oversizing only doubles what the optimizer fetches.
const HERO_IMAGE = 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=80';

type HeroGridProps = {
  projects: Project[];
  onOpen: (p: Project) => void;
  /** Rendered between the lead and row 2 — the studio statement, in practice. */
  interlude?: ReactNode;
  /** Hold the lead still under the cover panel, which turns the panel's rise into a reveal rather than a scroll-away. */
  pinnedLead?: boolean;
  /** Reserve the scroll the panel rides up through. Only while it is mounted, or it becomes a dead viewport. */
  coverStage?: boolean;
};

// A `top: 0` sticky child of 100svh stays pinned for (stage − 100svh), so 235svh holds the lead for 135svh: 100
// under the lifting panel, then a 35svh solo beat before it releases.
const COVER_STAGE = '235svh';

// The same stage minus the panel's viewport: the 35svh solo beat on its own.
const SOLO_STAGE = '135svh';

/** The scroll room the lead is pinned against. Renders nothing when unpinned. */
function Stage({ active, height, children }: { active: boolean; height: string; children: ReactNode }) {
  if (!active) return <>{children}</>;
  return <div style={{ position: 'relative', height }}>{children}</div>;
}

/** The lead image. Not a GridCell — it belongs to no project, so no caption, click-through or hover state. */
function HeroLead() {
  return (
    // `loading="eager"` + `fetchPriority="high"` rather than Next 16's `preload`. React 19 still emits a preload
    // link for any eager high-priority image; what this avoids is Next emitting a second, competing one.
    <Image
      src={HERO_IMAGE}
      alt="A Laurel Leaf Design Studio interior"
      fill
      loading="eager"
      fetchPriority="high"
      sizes="100vw"
      style={{ objectFit: 'cover' }}
      draggable={false}
    />
  );
}

export function HeroGrid({ projects, onOpen, pinnedLead = false, coverStage = false, interlude }: HeroGridProps) {
  const isCompact = useCompact();

  // The lead shows HERO_IMAGE rather than a project, so the rows start from the top of the list.
  const row2 = projects.slice(0, 2);
  const row3 = projects.slice(2, 4);

  const dividerColor = 'var(--divider-color)';
  const dividerThickness = 1;

  const vDiv = (
    <div
      className="hero-divider"
      style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: dividerThickness,
        background: dividerColor,
        zIndex: 5,
        transform: 'translateX(-50%)'
      }}
    />
  );

  return (
    <section style={{ position: 'relative', width: '100%' }}>
      {/* The lead — full width, and the cover panel's backdrop when `pinnedLead`
          is set. One image rather than two tiles so the arch window frames a
          single picture instead of straddling a centre divider. svh when pinned
          so it matches the cover panel exactly on mobile, where vh ignores the
          browser chrome. zIndex is declared rather than left to paint order —
          the lead is sticky (so it paints in the positioned layer) and comes
          after <CoverPanel /> in the DOM, so without it the stacking would rest
          on the panel's z-45 happening to beat `auto`. */}
      <Stage active={pinnedLead} height={coverStage ? COVER_STAGE : SOLO_STAGE}>
        <div
          style={{
            position: pinnedLead ? 'sticky' : 'relative',
            top: pinnedLead ? 0 : undefined,
            zIndex: pinnedLead ? 0 : undefined,
            height: pinnedLead ? '100svh' : isCompact ? '60vh' : '100vh',
            width: '100%',
            overflow: 'hidden',
            background: '#1a1a1a'
          }}>
          <HeroLead />
        </div>
      </Stage>

      {interlude}

      {/* Row 2 */}
      <div
        style={{
          position: 'relative',
          height: isCompact ? 'auto' : '100vh',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr',
          gridAutoRows: isCompact ? '60vh' : undefined,
          overflow: 'hidden'
        }}>
        {row2.map(p => (
          <GridCell key={p.id} project={p} onOpen={onOpen} />
        ))}
        {!isCompact && vDiv}
      </div>

      {/* Row 3 */}
      <div
        style={{
          position: 'relative',
          height: isCompact ? 'auto' : '100vh',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr',
          gridAutoRows: isCompact ? '60vh' : undefined,
          overflow: 'hidden'
        }}>
        {row3.map(p => (
          <GridCell key={p.id} project={p} onOpen={onOpen} />
        ))}
        {!isCompact && vDiv}

        <div
          style={{
            position: 'absolute',
            bottom: 24,
            right: 36,
            zIndex: 20,
            color: color.bg,
            mixBlendMode: 'difference',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
          <span className="micro-sm">Continue</span>
          <div
            style={{
              width: 28,
              height: 1,
              background: color.bg,
              position: 'relative',
              overflow: 'hidden'
            }}>
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '40%',
                background: color.bg,
                animation: 'scroll-indic 2.4s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
