'use client';

import { type ReactNode } from 'react';
import type { Project } from '@/lib/projects';
import { useCompact } from '@/hooks/useCompact';
import { color } from '@/lib/tokens';
import { GridCell } from './GridCell';

// Home hero. Placeholder pending real photography — migrates to
// shared/home-hero.jpg on R2 under the convention in AGENTS.md.
//
// w=3200 so the full-bleed lead still has pixels to spare on a 1440px viewport
// at DPR 2 (2880 device px). These render as CSS background images, so next/image
// never sees them and there is no srcset — one width has to serve every screen.
const HERO_IMAGE = 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=3200&q=80';

type HeroGridProps = {
  projects: Project[];
  onOpen: (p: Project) => void;
  /** Rendered between the lead and row 2 — the studio statement, in practice. */
  interlude?: ReactNode;
  /**
   * Hold the lead still as a backdrop for the cover panel that sits over it (see
   * HomeShell). The panel is absolutely positioned at document 0 and rides up
   * with the page; pinning the lead underneath is what turns that into a reveal
   * rather than the panel and the hero scrolling away together.
   */
  pinnedLead?: boolean;
  /**
   * Reserve the extra viewport of scroll the cover panel rides up through. Set
   * only while the panel is mounted — once it is dismissed, or on a return visit
   * that never shows it, that scroll room would be a dead viewport above the
   * hero where nothing moves.
   */
  coverStage?: boolean;
};

// A `top: 0` sticky child of height 100svh stays pinned for (stage − 100svh).
// 235svh therefore holds the lead for 135svh: the first 100 are spent under the
// lifting panel, the remaining 35 are a solo beat before it releases. The
// number is the reference mock's container height, kept verbatim.
const COVER_STAGE = '235svh';

// The same stage minus the panel's viewport: the 35svh solo beat on its own.
const SOLO_STAGE = '135svh';

/** The scroll room the lead is pinned against. Renders nothing when unpinned. */
function Stage({ active, height, children }: { active: boolean; height: string; children: ReactNode }) {
  if (!active) return <>{children}</>;
  return <div style={{ position: 'relative', height }}>{children}</div>;
}

/**
 * The lead image. Deliberately not a GridCell — it belongs to no project, so it
 * carries no caption, no click-through and no hover state. Plain `cover` at
 * exactly the frame size, like the reference mock's <img>: nothing moves, and
 * the image renders as sharp as its source allows.
 */
function HeroLead() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("${HERO_IMAGE}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    />
  );
}

export function HeroGrid({ projects, onOpen, pinnedLead = false, coverStage = false, interlude }: HeroGridProps) {
  const isCompact = useCompact();

  // The lead shows HERO_IMAGE, not a project, so the rows start from the top of
  // the list rather than skipping one.
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
            left: 36,
            zIndex: 20,
            color: color.bg,
            mixBlendMode: 'difference'
          }}>
          <div className="micro-sm" style={{ opacity: 0.85 }}>
            Index of Projects · 07
          </div>
        </div>
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
