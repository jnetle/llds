'use client';

import { Eyebrow } from '@/components/ui/Eyebrow';
import { Grid } from '@/components/ui/Grid';
import { Section } from '@/components/ui/Section';
import { color } from '@/lib/tokens';
import { Wordmark } from './Wordmark';

const COLUMNS: { h: string; items: { label: string; href?: string; target?: string }[] }[] = [
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
      { label: 'hello@laurelleaf.studio', href: 'mailto:hello@laurelleaf.studio' },
      { label: 'Instagram', target: '_blank', href: 'https://www.instagram.com/laurelleafdesignstudio' },
      { label: 'Facebook', target: '_blank', href: 'https://www.facebook.com/laurelleafdesignstudio' }
    ]
  }
];

export function Footer() {
  return (
    <Section as="footer" padY="xs" topBorder>
      <Grid cols={{ d: '1.4fr 1fr 1fr 1fr', t: '1fr 1fr', m: '1fr' }} gap={{ d: 60, t: 32, m: 28 }} alignItems="start">
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
            <Eyebrow opacity={0.5} style={{ marginBottom: 22 }}>
              {col.h}
            </Eyebrow>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 10 }}>
              {col.items.map(it => (
                <li key={it.label} style={{ fontSize: 14, color: color.inkSoft }}>
                  {it.href ? (
                    <a target={it.target || '_self'} rel={it.target === '_blank' ? 'noopener noreferrer' : undefined} href={it.href}>
                      {it.label}
                    </a>
                  ) : (
                    it.label
                  )}
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
            borderTop: `1px solid ${color.hairline}`,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16
          }}>
          <Eyebrow size="sm" opacity={0.5}>
            ©{new Date().getFullYear()} Laurel Leaf Design Studio · All rights reserved
          </Eyebrow>
          <Eyebrow size="sm" opacity={0.5}>
            Site built by jnetle
          </Eyebrow>
        </div>
      </Grid>
    </Section>
  );
}
