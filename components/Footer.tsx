'use client';

import Link from 'next/link';
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
    h: 'Social',
    items: [
      { label: 'Instagram', target: '_blank', href: 'https://www.instagram.com/laurelleafdesignstudio' },
      { label: 'Facebook', target: '_blank', href: 'https://www.facebook.com/laurelleafdesignstudio' }
    ]
  }
];

export function Footer() {
  return (
    <Section as="footer" padY="xs" topBorder>
      {/* Tablet keeps the desktop's three link columns and gives the brand block its
          own full-width row above them, rather than the old 2×2 that paired the
          brand with one link column and pushed the other two below it. */}
      <Grid
        cols={{ d: '1.4fr 1fr 1fr 1fr', t: 'repeat(3, 1fr)', m: '1fr' }}
        gap={{ d: 60, t: 32, m: 28 }}
        rowGap={{ d: 60, t: 44, m: 36 }}
        alignItems="start">
        <div className="col-span-full lg:col-auto">
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
        <div>
          <Eyebrow opacity={0.5} style={{ marginBottom: 22 }}>
            {COLUMNS[0].h}
          </Eyebrow>
          <ul style={{ listStyle: 'none', display: 'grid', gap: 10 }}>
            {COLUMNS[0].items.map(it => (
              <li key={it.label} style={{ fontSize: 14, color: color.inkSoft }}>
                {it.href ? <Link href={it.href}>{it.label}</Link> : it.label}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Eyebrow opacity={0.5} style={{ marginBottom: 22 }}>
            Inquire
          </Eyebrow>
          <Link
            href="/inquire"
            style={{
              display: 'inline-block',
              fontSize: 14,
              color: color.inkSoft,
              marginBottom: 20
            }}>
            Tell us about your project
          </Link>
          <div style={{ fontSize: 13, color: color.inkSoft, lineHeight: 1.7, opacity: 0.75 }}>
            <div>By appointment only</div>
            <div>Augusta, GA · North Augusta · Aiken, SC</div>
          </div>
        </div>
        <div>
          <Eyebrow opacity={0.5} style={{ marginBottom: 22 }}>
            {COLUMNS[1].h}
          </Eyebrow>
          <ul style={{ listStyle: 'none', display: 'grid', gap: 10 }}>
            {COLUMNS[1].items.map(it => (
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
        {/* Was a flat 60/30. The section itself only has 32px of padding below it on
            mobile, so a fixed 60px lead-in read as a gap rather than a rule. */}
        <div
          className="col-span-full mt-[36px] pt-[24px] sm:mt-[60px] sm:pt-[30px]"
          style={{
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
