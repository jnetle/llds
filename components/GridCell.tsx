'use client';

import type { Project } from '@/lib/projects';
import { color } from '@/lib/tokens';

type GridCellProps = {
  project: Project;
  onOpen: (p: Project) => void;
};

export function GridCell({ project, onOpen }: GridCellProps) {
  return (
    <div className="grid-cell" onClick={() => onOpen(project)}>
      {/* inset 0: the layer sits at exactly `cover`, the sharpest it can be. It
          used to be inset -20% to give a scroll parallax somewhere to travel,
          but that oversize made every image render 1.4x larger than it needed
          to and visibly soft. Hover no longer scales, so nothing needs the
          extra bleed. */}
      <div className="grid-cell__media" style={{ backgroundImage: `url("${project.cover}")` }} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)',
          pointerEvents: 'none'
        }}
      />

      <div className="grid-cell__caption" style={{ color: color.bg }}>
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
        <div className="grid-cell__cta">
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
