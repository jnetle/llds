'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useEffect, useRef, useState } from 'react';
import type { Project } from '@/lib/projects';
import { useScrollY } from '@/hooks/useScrollY';

type Props = {
  projects: Project[];
  onOpen: (p: Project) => void;
};

export function ProjectStrip({ projects, onOpen }: Props) {
  const stripRef = useRef<HTMLElement>(null);
  const scrollY = useScrollY();
  const [stripTop, setStripTop] = useState(0);
  const [vh, setVh] = useState(0);

  useEffect(() => {
    const measure = () => {
      setVh(window.innerHeight);
      if (stripRef.current) {
        setStripTop(stripRef.current.getBoundingClientRect().top + window.scrollY);
      }
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const offset = Math.max(0, (scrollY - stripTop + vh) * 0.15);

  return (
    <section ref={stripRef} style={{ padding: '60px 0 140px', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          padding: '0 8vw 60px',
          gap: 20,
          flexWrap: 'wrap'
        }}>
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

      <div
        style={{
          display: 'flex',
          gap: 32,
          padding: '0 8vw',
          transform: `translateX(${-offset * 0.6}px)`,
          transition: 'transform 0.05s linear'
        }}>
        {/* Once through, not the doubled pass this used to render. The strip is fed the projects the hero did not
            show, so it is now short enough that a second copy is reachable rather than theoretical — and a repeated
            cover under "More from the studio" is exactly what the section promises not to be. The row still overruns
            the viewport on any display up to ~2100px wide; past that it ends early, which reads as the list ending. */}
        {projects.map((p, i) => (
          <button
            key={`${p.slug}-${i}`}
            onClick={() => onOpen(p)}
            className="strip-tile"
            style={{
              flex: '0 0 460px',
              textAlign: 'left',
              cursor: 'pointer'
            }}>
            {/* Stays a <div>: it owns the 580px box and the brightness hover, and a
                filter on the wrapper applies to the image inside it. */}
            <div className="strip-tile__media">
              <Image
                src={p.cover.src}
                alt={p.cover.alt}
                fill
                // Fixed `flex: 0 0 460px` at every viewport, so there is nothing responsive
                // to express — but `sizes` is still required for `fill`.
                sizes="460px"
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
    </section>
  );
}
