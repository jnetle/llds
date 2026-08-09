'use client';

import { useState } from 'react';
import type { Project } from '@/lib/projects';
import { color, motion } from '@/lib/tokens';

type GridCellProps = {
  project: Project;
  onOpen: (p: Project) => void;
};

export function GridCell({ project, onOpen }: GridCellProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(project)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        background: '#1a1a1a'
      }}>
      {/* inset 0, and scale(1) at rest: the layer sits at exactly `cover`, the
          sharpest it can be. It used to be inset -20% to give a scroll parallax
          somewhere to travel, but that oversize made every image render 1.4x
          larger than it needed to and visibly soft. Hover still scales up —
          growing past the frame crops outward and can't expose an edge. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("${project.cover}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
          transition: `transform ${motion.durSlow} ${motion.ease}, filter ${motion.durMed} ease`
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 32,
          right: 32,
          bottom: 64,
          color: color.bg,
          transform: hovered ? 'translateY(0)' : 'translateY(20px)',
          opacity: hovered ? 1 : 0.85,
          transition: `transform ${motion.durMed} ${motion.ease}, opacity ${motion.durMed} ease`,
          pointerEvents: 'none'
        }}>
        <div className="micro-sm" style={{ opacity: 0.75, marginBottom: 10 }}>
          {project.location} · {project.year}
        </div>
        <h2
          className="serif"
          style={{
            fontSize: 'clamp(28px, 3.6vw, 56px)',
            fontWeight: 300,
            fontStyle: 'italic',
            lineHeight: 1.0,
            letterSpacing: '-0.005em',
            textWrap: 'pretty'
          }}>
          {project.title}
        </h2>
        <div
          style={{
            marginTop: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(8px)',
            transition: `transform ${motion.durMed} ease 0.1s, opacity ${motion.durMed} ease 0.1s`
          }}>
          <span className="micro" style={{ fontSize: 10 }}>
            View Project
          </span>
          <svg width="32" height="8" viewBox="0 0 32 8" fill="none">
            <path d="M0 4 H30 M26 1 L30 4 L26 7" style={{ stroke: color.bg }} strokeWidth="0.8" />
          </svg>
        </div>
      </div>
    </div>
  );
}
