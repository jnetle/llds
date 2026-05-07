'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PROJECTS, type Project } from '@/lib/projects';

type Props = {
  project: Project;
};

export function ProjectDetail({ project }: Props) {
  const [imgIndex, setImgIndex] = useState(0);
  const [opening, setOpening] = useState(true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpening(false));
    return () => cancelAnimationFrame(raf);
  }, []);

  const idx = PROJECTS.findIndex(p => p.id === project.id);
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  return (
    <div
      style={{
        background: 'var(--bg)',
        color: 'var(--ink)',
        opacity: opening ? 0 : 1,
        transition: 'opacity 0.5s ease'
      }}>
      {/* Top bar — sits below the fixed global header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '110px 36px 24px',
          borderBottom: '1px solid var(--hairline)',
          gap: 16
        }}>
        <Link href="/projects" className="micro" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit' }}>
          <span style={{ fontSize: 14, lineHeight: 1 }}>←</span> All Projects
        </Link>
        <div className="micro" style={{ opacity: 0.6 }}>
          {project.discipline}
        </div>
        <Link href={`/projects/${next.id}`} className="micro" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit' }}>
          Next:{' '}
          <span style={{ fontStyle: 'italic' }} className="serif">
            {next.title}
          </span>{' '}
          <span style={{ fontSize: 14, lineHeight: 1 }}>→</span>
        </Link>
      </div>

      {/* Hero image */}
      <div
        style={{
          height: '85vh',
          backgroundImage: `url("${project.gallery[imgIndex]}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: opening ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 1.2s cubic-bezier(.22,.61,.36,1), background-image 0.6s ease'
        }}
      />

      {/* Title block */}
      <div style={{ padding: '100px 8vw', maxWidth: 1400, margin: '0 auto' }}>
        <div className="micro" style={{ opacity: 0.55, marginBottom: 28 }}>
          {project.location} · {project.year}
        </div>
        <h1
          className="serif"
          style={{
            fontSize: 'clamp(48px, 7vw, 110px)',
            fontWeight: 300,
            fontStyle: 'italic',
            lineHeight: 0.98,
            letterSpacing: '-0.012em',
            maxWidth: '14ch',
            margin: 0
          }}>
          {project.title}
        </h1>
        <p
          style={{
            marginTop: 60,
            fontSize: 19,
            lineHeight: 1.7,
            color: 'var(--ink-soft)',
            maxWidth: '52ch'
          }}>
          {project.intro}
        </p>
      </div>

      {/* Material palette */}
      <div
        style={{
          padding: '0 8vw 80px',
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          flexWrap: 'wrap'
        }}>
        <div className="micro" style={{ opacity: 0.5 }}>
          Material Palette
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {project.palette.map(c => (
            <div
              key={c}
              style={{
                width: 64,
                height: 64,
                background: c,
                borderRadius: '50%'
              }}
            />
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div style={{ padding: '0 8vw 120px', display: 'grid', gap: 24 }}>
        {project.gallery.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setImgIndex(i)}
            style={{
              cursor: 'pointer',
              textAlign: 'left',
              padding: 0,
              background: 'none',
              border: 'none'
            }}>
            <div
              style={{
                height: i === 1 ? '60vh' : '80vh',
                backgroundImage: `url("${src}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="micro-sm" style={{ marginTop: 12, opacity: 0.5 }}>
              Plate 0{i + 1} · {project.title}
            </div>
          </button>
        ))}
      </div>

      {/* Footer nav between projects */}
      <div
        style={{
          borderTop: '1px solid var(--hairline)',
          padding: '60px 36px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 32,
          alignItems: 'center'
        }}>
        <Link
          href={`/projects/${prev.id}`}
          className="micro"
          style={{ display: 'flex', alignItems: 'center', gap: 12, justifySelf: 'start', color: 'inherit' }}>
          <span style={{ fontSize: 14 }}>←</span>
          <span style={{ display: 'grid', gap: 4, textAlign: 'left' }}>
            <span style={{ opacity: 0.5 }}>Previous</span>
            <span className="serif" style={{ fontStyle: 'italic', fontSize: 18, opacity: 0.95, textTransform: 'none', letterSpacing: 0 }}>
              {prev.title}
            </span>
          </span>
        </Link>
        <Link
          href="/projects"
          className="micro"
          style={{ justifySelf: 'center', borderBottom: '1px solid var(--ink)', paddingBottom: 4, color: 'inherit' }}>
          All Projects
        </Link>
        <Link
          href={`/projects/${next.id}`}
          className="micro"
          style={{ display: 'flex', alignItems: 'center', gap: 12, justifySelf: 'end', color: 'inherit' }}>
          <span style={{ display: 'grid', gap: 4, textAlign: 'right' }}>
            <span style={{ opacity: 0.5 }}>Next</span>
            <span className="serif" style={{ fontStyle: 'italic', fontSize: 18, opacity: 0.95, textTransform: 'none', letterSpacing: 0 }}>
              {next.title}
            </span>
          </span>
          <span style={{ fontSize: 14 }}>→</span>
        </Link>
      </div>
    </div>
  );
}
