'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useCallback, useRef, type CSSProperties } from 'react';
import type { Project } from '@/lib/projects';
import { useTrackProgress } from '@/hooks/useTrackProgress';

type Props = {
  projects: Project[];
  onOpen: (p: Project) => void;
};

// Beats at either end of the pinned range that hold the row still: the first tile reads as a first tile before it
// moves off, and — the point of the section — the last one lands and rests before the stage releases.
const LEAD_IN = 0.06;
const LEAD_OUT = 0.12;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export function ProjectStrip({ projects, onOpen }: Props) {
  const trackRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // One unitless number per frame, written straight to the node: the rail's translate is a calc against
  // --strip-travel, which CSS derives from the tile count and the viewport. Nothing here re-renders, so the row
  // scrubs without dragging eleven <Image> subtrees through React once a frame.
  useTrackProgress(
    trackRef,
    useCallback(p => {
      railRef.current?.style.setProperty('--strip-p', String(clamp01((p - LEAD_IN) / (1 - LEAD_IN - LEAD_OUT))));
    }, [])
  );

  return (
    <section ref={trackRef} className="strip-track" style={{ '--strip-count': projects.length } as CSSProperties}>
      <div className="strip-stage">
        <div className="strip-head">
          <h3
            className="serif"
            style={{
              fontSize: 36,
              fontWeight: 300,
              letterSpacing: '-0.005em'
            }}>
            More from the studio
          </h3>
          {/* The strip deliberately shows only what the hero did not, so this is the way to the rest of them. A real
              <Link> rather than a button and a router push: it is a navigation, and only a link prefetches, opens in a
              new tab on cmd-click, and reads as a route to /projects rather than as a control. */}
          <Link
            href="/projects"
            className="micro"
            style={{
              borderBottom: '1px solid currentColor',
              paddingBottom: 4
            }}>
            Index of Works · ↗
          </Link>
        </div>

        {/* Once through, not the doubled pass this used to render. The strip is fed the projects the hero did not
            show, and the pinned pass now carries the row its full length — a second copy would be reached rather
            than theoretical, and a repeated cover under "More from the studio" is what the section promises not to
            be. */}
        <div ref={railRef} className="strip-rail">
          {projects.map(p => (
            <button key={p.slug} onClick={() => onOpen(p)} className="strip-tile">
              {/* Stays a <div>: it owns the media box and the brightness hover, and a
                  filter on the wrapper applies to the image inside it. */}
              <div className="strip-tile__media">
                <Image
                  src={p.cover.src}
                  alt={p.cover.alt}
                  fill
                  // Mirrors --strip-tile in globals.css: min(460px, 74vw), which crosses over at 621px.
                  sizes="(max-width: 620px) 74vw, 460px"
                  style={{ objectFit: 'cover' }}
                  draggable={false}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginTop: 18
                }}>
                <div
                  className="serif"
                  style={{
                    fontSize: 22,
                    fontStyle: 'italic',
                    fontWeight: 300
                  }}>
                  {p.title}
                </div>
                <div className="micro-sm" style={{ opacity: 0.5 }}>
                  {p.year}
                </div>
              </div>
              <div className="micro-sm" style={{ marginTop: 6, opacity: 0.5 }}>
                {p.location}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
