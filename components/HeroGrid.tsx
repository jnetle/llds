'use client';

import { useEffect, useRef, useState } from 'react';
import type { Project } from '@/lib/projects';
import { useScrollY } from '@/hooks/useScrollY';
import { useCompact } from '@/hooks/useCompact';
import { GridCell } from './GridCell';

type HeroGridProps = {
  projects: Project[];
  onOpen: (p: Project) => void;
};

export function HeroGrid({ projects, onOpen }: HeroGridProps) {
  const scrollY = useScrollY();
  const isCompact = useCompact();

  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);
  const [offsets, setOffsets] = useState({ row1: 0, row2: 0, row3: 0 });

  useEffect(() => {
    const measure = () => {
      setOffsets({
        row1: row1Ref.current?.offsetTop ?? 0,
        row2: row2Ref.current?.offsetTop ?? 0,
        row3: row3Ref.current?.offsetTop ?? 0
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isCompact]);

  const row1 = projects.slice(0, 2);
  const row2 = projects[2];
  const row3 = projects.slice(3, 5);

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
      {/* Row 1 */}
      <div
        ref={row1Ref}
        style={{
          position: 'relative',
          height: isCompact ? 'auto' : '100vh',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr',
          gridAutoRows: isCompact ? '60vh' : undefined,
          overflow: 'hidden'
        }}>
        {row1.map((p, i) => (
          <GridCell key={p.id} project={p} index={i} scrollY={scrollY} rowOffsetTop={offsets.row1} onOpen={onOpen} />
        ))}
        {!isCompact && vDiv}
      </div>

      {/* Row 2 — full width */}
      <div
        ref={row2Ref}
        style={{
          position: 'relative',
          height: isCompact ? '60vh' : '100vh',
          width: '100%',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr'
        }}>
        {row2 && <GridCell project={row2} index={2} scrollY={scrollY} rowOffsetTop={offsets.row2} onOpen={onOpen} />}
      </div>

      {/* Row 3 */}
      <div
        ref={row3Ref}
        style={{
          position: 'relative',
          height: isCompact ? 'auto' : '100vh',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr',
          gridAutoRows: isCompact ? '60vh' : undefined,
          overflow: 'hidden'
        }}>
        {row3.map((p, i) => (
          <GridCell key={p.id} project={p} index={3 + i} scrollY={scrollY} rowOffsetTop={offsets.row3} onOpen={onOpen} />
        ))}
        {!isCompact && vDiv}

        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 36,
            zIndex: 20,
            color: '#F4F0E8',
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
            color: '#F4F0E8',
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
              background: '#F4F0E8',
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
                background: '#F4F0E8',
                animation: 'scroll-indic 2.4s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
