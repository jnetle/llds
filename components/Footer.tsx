'use client';

import Link from 'next/link';
import type { IconType } from 'react-icons';
import { PiFacebookLogoFill, PiFacebookLogoThin, PiInstagramLogoFill, PiInstagramLogoThin } from 'react-icons/pi';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Grid } from '@/components/ui/Grid';
import { Section } from '@/components/ui/Section';
import { color } from '@/lib/tokens';
import { SITE, type SocialLabel } from '@/lib/site';
import { Wordmark } from './Wordmark';

const STUDIO_LINKS: { label: string; href: string }[] = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Press', href: '/press' }
];

// Imported from the `react-icons/pi` barrel on purpose — Next's optimizePackageImports rewrites it to direct paths,
// so only these four glyphs ship; a deep path would skip that. Keyed by SocialLabel, so adding a network to
// SITE.social fails `tsc` here until it has a glyph pair, rather than publishing a `sameAs` URL with no footer link.
const SOCIAL_ICONS: Record<SocialLabel, { Icon: IconType; IconFill: IconType }> = {
  Instagram: { Icon: PiInstagramLogoThin, IconFill: PiInstagramLogoFill },
  Facebook: { Icon: PiFacebookLogoThin, IconFill: PiFacebookLogoFill }
};

const SOCIAL_LINKS = SITE.social.map(link => ({ ...link, ...SOCIAL_ICONS[link.label] }));

export function Footer() {
  return (
    <Section as="footer" padY="xs" topBorder>
      {/* Tablet keeps the three link columns and gives the brand block its own full-width row above them. */}
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
            Studio
          </Eyebrow>
          <ul style={{ listStyle: 'none', display: 'grid', gap: 10 }}>
            {STUDIO_LINKS.map(it => (
              <li key={it.label} style={{ fontSize: 14, color: color.inkSoft }}>
                <Link href={it.href} className="nav-link" style={{ display: 'inline-block', position: 'relative' }}>
                  {it.label}
                  <span className="nav-underline" />
                </Link>
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
            className="nav-link"
            style={{
              display: 'inline-block',
              position: 'relative',
              fontSize: 14,
              color: color.inkSoft,
              marginBottom: 20
            }}>
            Tell us about your project
            <span className="nav-underline" />
          </Link>
          <div style={{ fontSize: 13, color: color.inkSoft, lineHeight: 1.7, opacity: 0.75 }}>
            <div>By appointment only</div>
            {/* Not derived from SITE.areaServed — display copy, dropping the repeated state abbreviation for rhythm. */}
            <div>Augusta, GA · North Augusta · Aiken, SC</div>
          </div>
        </div>
        <div>
          <Eyebrow opacity={0.5} style={{ marginBottom: 22 }}>
            Social
          </Eyebrow>
          {/* The 28px box is the tap target; the glyph is smaller. Both weights render at once, stacked into one grid cell
              by `.social-icon`, and cross-fade on hover — so the anchor's `display` lives in globals.css, since an inline
              one would outrank the stylesheet's grid. */}
          <div style={{ display: 'flex', gap: 18 }}>
            {SOCIAL_LINKS.map(({ label, href, Icon, IconFill }) => (
              <a
                key={label}
                className="social-icon"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                style={{
                  width: 28,
                  height: 28,
                  color: color.inkSoft
                }}>
                <Icon className="social-icon__line" size={26} aria-hidden="true" />
                <IconFill className="social-icon__fill" size={26} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
        {/* The section has only 32px of padding below it on mobile, so a flat 60px lead-in read as a gap. */}
        <div
          className="col-span-full mt-[36px] pt-[24px] sm:mt-[60px] sm:pt-[30px]"
          style={{
            borderTop: `1px solid ${color.hairline}`,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16
          }}>
          {/* All three carry `.micro-sm` so their line boxes match — an unclassed child would inherit the 16px body font
              and sit off the shared baseline. */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 10 }}>
            <Eyebrow as="span" size="sm" opacity={0.5}>
              ©{new Date().getFullYear()} {SITE.name} · All rights reserved
            </Eyebrow>
            <span aria-hidden className="micro-sm" style={{ opacity: 0.35 }}>
              ·
            </span>
            <Link
              href="/privacy"
              className="micro-sm nav-link"
              style={{ display: 'inline-block', position: 'relative', opacity: 0.5, color: color.ink }}>
              Privacy
              <span className="nav-underline" />
            </Link>
          </div>
          <Eyebrow size="sm" opacity={0.5}>
            Site built by jnetle
          </Eyebrow>
        </div>
      </Grid>
    </Section>
  );
}
