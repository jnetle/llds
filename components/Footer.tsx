'use client';

import Link from 'next/link';
import type { IconType } from 'react-icons';
import { PiFacebookLogoFill, PiFacebookLogoThin, PiInstagramLogoFill, PiInstagramLogoThin } from 'react-icons/pi';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Grid } from '@/components/ui/Grid';
import { Section } from '@/components/ui/Section';
import { color } from '@/lib/tokens';
import { Wordmark } from './Wordmark';

const STUDIO_LINKS: { label: string; href: string }[] = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Press', href: '/press' }
];

// Imported from the `react-icons/pi` barrel on purpose: Next lists every react-icons
// subset in its default optimizePackageImports, so this is rewritten to direct paths
// and only these four glyphs ship. A deep `react-icons/pi/index.mjs` path would skip that.
// Each entry carries both weights: the Thin mark at rest, the solid Fill on hover/focus.
const SOCIAL_LINKS: { label: string; href: string; Icon: IconType; IconFill: IconType }[] = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/laurelleafdesignstudio',
    Icon: PiInstagramLogoThin,
    IconFill: PiInstagramLogoFill
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/laurelleafdesignstudio',
    Icon: PiFacebookLogoThin,
    IconFill: PiFacebookLogoFill
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
            <div>Augusta, GA · North Augusta · Aiken, SC</div>
          </div>
        </div>
        <div>
          <Eyebrow opacity={0.5} style={{ marginBottom: 22 }}>
            Social
          </Eyebrow>
          {/* The 28px box is the tap target; the glyph inside is smaller. Phosphor
              already carries ~11% padding inside its 256 viewBox, so the drawn mark is
              smaller again than the 26 below. react-icons emits no aria-hidden of its
              own, so both svgs are muted explicitly and the accessible name comes from
              the anchor's aria-label.

              Both weights render at once, stacked into one grid cell by `.social-icon`,
              and cross-fade on hover — so the swap costs no layout and no JS. The
              anchor's `display` therefore lives in globals.css, not here: an inline
              `display: inline-flex` would outrank the stylesheet's grid. */}
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
