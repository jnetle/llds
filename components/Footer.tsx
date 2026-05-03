'use client';

import { useCompact } from '@/hooks/useCompact';
import { Wordmark } from './Wordmark';

const COLUMNS: { h: string; items: { label: string; href?: string }[] }[] = [
  {
    h: 'Studio',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Press', href: '/press' }
    ]
  },
  {
    h: 'Visit',
    items: [{ label: 'XXXX Street' }, { label: 'Augusta, Georgia 12345' }, { label: 'Serving Aiken/Augusta area' }]
  },
  {
    h: 'Contact',
    items: [
      {
        label: 'hello@laurelleaf.studio',
        href: 'mailto:hello@laurelleaf.studio'
      },
      { label: '111-111-1111', href: 'tel:+1111111111' },
      {
        label: 'Instagram',
        href: 'https://www.instagram.com/laurelleafdesignstudio'
      },
      {
        label: 'Facebook',
        href: 'https://www.facebook.com/laurelleafdesignstudio'
      }
    ]
  }
];

export function Footer() {
  const isMobile = useCompact(600);
  const isTablet = useCompact(1024);
  const gridTemplateColumns = isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1.4fr 1fr 1fr 1fr';
  const gap = isMobile ? 28 : isTablet ? 32 : 60;

  return (
    <footer
      style={{
        borderTop: '1px solid var(--hairline)',
        padding: '80px 8vw 50px',
        display: 'grid',
        gridTemplateColumns,
        gap,
        alignItems: 'start'
      }}>
      <div>
        <Wordmark />
        <p
          className="serif"
          style={{
            marginTop: 30,
            fontSize: 22,
            fontStyle: 'italic',
            lineHeight: 1.4,
            fontWeight: 300,
            maxWidth: '24ch'
          }}>
          Considered interiors for the long view.
        </p>
      </div>
      {COLUMNS.map(col => (
        <div key={col.h}>
          <div className="micro" style={{ marginBottom: 22, opacity: 0.5 }}>
            {col.h}
          </div>
          <ul style={{ listStyle: 'none', display: 'grid', gap: 10 }}>
            {col.items.map(it => (
              <li key={it.label} style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
                {it.href ? <a href={it.href}>{it.label}</a> : it.label}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div
        style={{
          gridColumn: '1 / -1',
          marginTop: 60,
          paddingTop: 30,
          borderTop: '1px solid var(--hairline)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
        <div className="micro-sm" style={{ opacity: 0.5 }}>
          ©{new Date().getFullYear()} Laurel Leaf Design Studio · All rights reserved
        </div>
        <div className="micro-sm" style={{ opacity: 0.5 }}>
          Site built by jnetle
        </div>
      </div>
    </footer>
  );
}
