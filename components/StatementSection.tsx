'use client';

import { Fragment } from 'react';
import { useReveal } from '@/hooks/useReveal';

const HEADING_PARTS: (string | { italic: string })[] = [
  'We design',
  ' interiors that age',
  ' with grace —',
  ' rooted, quiet,',
  { italic: ' and lived in' },
  '.'
];

const DISCIPLINES = ['Residential Architecture', 'Furniture Commissioning', 'Material & Colour Direction', 'Garden & Threshold Design'];

export function StatementSection() {
  const [ref, seen] = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      style={{
        padding: '180px 8vw 200px',
        borderTop: '1px solid var(--hairline)'
      }}>
      <div
        className="micro"
        style={{
          marginBottom: 80,
          opacity: seen ? 0.5 : 0,
          transform: seen ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.9s ease'
        }}>
        — Studio Statement
      </div>
      <h1
        className="serif"
        style={{
          fontSize: 'clamp(38px, 5.5vw, 88px)',
          lineHeight: 1.05,
          fontWeight: 300,
          maxWidth: '20ch',
          letterSpacing: '-0.012em',
          textWrap: 'balance'
        }}>
        {HEADING_PARTS.map((part, i) => (
          <Fragment key={i}>
            <span
              style={{
                display: 'inline',
                opacity: seen ? 1 : 0,
                transform: seen ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.9s cubic-bezier(.22,.61,.36,1) ${i * 0.08}s`
              }}>
              {typeof part === 'string' ? part : <em style={{ fontWeight: 300 }}>{part.italic}</em>}
            </span>
          </Fragment>
        ))}
      </h1>

      <div
        style={{
          marginTop: 100,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80,
          maxWidth: 1100,
          opacity: seen ? 1 : 0,
          transform: seen ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s ease 0.5s'
        }}>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.7,
            color: 'var(--ink-soft)',
            maxWidth: '40ch'
          }}>
          Founded in 2016 by Iris Wren, Laurel Leaf Design Studio is a London-based practice working across residential and small commercial
          commissions. Our approach is unhurried: we begin with the architecture, the light, and the way a household actually moves through
          a day.
        </p>
        <div>
          <div className="micro" style={{ marginBottom: 24, opacity: 0.5 }}>
            Disciplines
          </div>
          <ul style={{ listStyle: 'none', display: 'grid', gap: 14 }}>
            {DISCIPLINES.map(s => (
              <li key={s} className="serif" style={{ fontSize: 22, fontWeight: 300, fontStyle: 'italic' }}>
                — {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
