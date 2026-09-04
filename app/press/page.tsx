'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { useCols, useCompact } from '@/hooks/useCompact';
import { MagazineReader, type MagazinePage } from '@/components/press/MagazineReader';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Section } from '@/components/ui/Section';
import { color, motion, text } from '@/lib/tokens';

// TEMPORARY: Instagram-resolution stills served from public/ until the photographer's originals exist. The keys
// below are exactly the R2 keys, so finalising is a one-line swap back to `img('press/' + key)` — but the files
// must move to the bucket first. See AGENTS.md § Images.
const pressImg = (key: string) => `/images/press/${key}`;

const AWARDS = [
  {
    category: 'Best Curb Appeal',
    subcategory: 'Custom Built Spec Home',
    year: '2026',
    img: pressImg('awards/best-curb-appeal.jpg'),
    // TODO: describe the exterior in your own words.
    caption: ''
  },
  {
    category: 'Best Kitchen',
    subcategory: 'Custom Built Spec Home',
    year: '2026',
    img: pressImg('awards/best-kitchen.jpg'),
    // TODO: describe the kitchen in your own words.
    caption: ''
  }
];

const GALLERY = [1, 2, 3, 4, 5].map(n => pressImg(`gallery/${n}.jpg`));

// Every source frame is 4:5 portrait, so tiles are sized near that ratio to keep `cover` from cropping them into
// landscape bands. Column spans must sum to 6 per row — two large tiles, then three smaller ones.
const GALLERY_LAYOUTS = [
  { col: 'span 3', row: 'span 4' },
  { col: 'span 3', row: 'span 4' },
  { col: 'span 2', row: 'span 3' },
  { col: 'span 2', row: 'span 3' },
  { col: 'span 2', row: 'span 3' }
];

// The Winter 2024 Aiken Hound & Home feature in reading order. Printed folios read 8, 9, — , 10 (the full-bleed
// shower page carries none), so the labels count the spread rather than claim a page range.
const MAGAZINE_PAGES: MagazinePage[] = [
  {
    src: pressImg('magazine/cover.jpg'),
    label: 'Cover',
    alt: 'Cover of Aiken Hound & Home Magazine, Winter Issue 2024'
  },
  {
    src: pressImg('magazine/page-1.jpg'),
    label: 'Page one',
    alt: 'Opening page of the feature — the home’s exterior under a live oak, titled “Understated Luxury: A Bathroom Transformed”',
    quote: 'I love to weave together modern needs with timeless elegance.'
  },
  {
    src: pressImg('magazine/page-2.jpg'),
    label: 'Page two',
    alt: 'The article text alongside a wide photograph of the finished bathroom',
    quote: 'The first challenge? Bringing in more light.'
  },
  {
    src: pressImg('magazine/page-3.jpg'),
    label: 'Page three',
    alt: 'Full-page photograph of the marble shower with brass fittings and a hexagonal tile inset',
    quote: 'The centerpiece was the freestanding tub — a true focal point of relaxation.'
  },
  {
    src: pressImg('magazine/page-4.jpg'),
    label: 'Page four',
    alt: 'Closing page — a grid of photographs of the tub, vanity, and dressing area',
    quote: 'For the clients, it became a sanctuary of light, warmth, and elegance.'
  }
];

const FEATURE_META: [string, string][] = [
  ['Publication', 'Aiken Hound & Home Magazine'],
  ['Issue', 'Winter 2024'],
  ['Words', 'Maria Rhinehart'],
  ['Photography', 'River Magnolia Photography'],
  ['Builder', 'Southern State Builders']
];

// The same entrance the project tiles get in ProjectsGrid. Only `.is-in` is decided here — see `.press-reveal` in
// globals.css for the hidden state and the reduced-motion / no-JS fallbacks. `index` staggers tiles within a row.
function RevealImage({ src, index = 0, style }: { src: string; index?: number; style?: CSSProperties }) {
  const [ref, seen] = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={seen ? 'press-reveal is-in' : 'press-reveal'}
      style={
        {
          backgroundImage: `url("${src}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '--reveal-delay': `${index * 0.08}s`,
          ...style
        } as CSSProperties
      }
    />
  );
}

export default function PressPage() {
  const [ref, seen] = useReveal<HTMLDivElement>();
  const [refFeature, seenFeature] = useReveal<HTMLDivElement>();
  const cols = useCols();
  // The row spans only mean anything in the 6-column track; once collapsed to '1fr' the tiles carry their own ratio.
  const compact = useCompact();

  return (
    <>
      {/* Hero — title stack + lead-story preview */}
      <Section
        padTop="sm"
        padBottom="none"
        style={{
          position: 'relative',
          overflow: 'hidden'
        }}>
        <div style={{ position: 'relative' }}>
          {/* One <h1> holding both display lines. */}
          <h1 className="serif" style={{ fontWeight: 300, margin: 0 }}>
            <span
              style={{
                display: 'block',
                fontSize: 'clamp(72px, 11vw, 184px)',
                lineHeight: 0.84,
                letterSpacing: '-0.035em',
                textTransform: 'uppercase',
                textWrap: 'balance'
              }}>
              Press
            </span>
            <span
              style={{
                display: 'block',
                fontSize: 'clamp(58px, 9vw, 148px)',
                lineHeight: 0.84,
                fontStyle: 'italic',
                letterSpacing: '-0.025em',
                marginTop: 4,
                marginLeft: '0.4em'
              }}>
              recognition
            </span>
          </h1>
          {/* Sits over the pair, so it stays a sibling of the heading. */}
          <div
            className="serif"
            aria-hidden
            style={{
              position: 'absolute',
              right: '4%',
              top: '-2%',
              fontSize: 'clamp(120px, 16vw, 240px)',
              fontWeight: 300,
              fontStyle: 'italic',
              lineHeight: 1,
              color: color.ink,
              opacity: 0.12,
              pointerEvents: 'none'
            }}>
            &amp;
          </div>
        </div>

        {/* Lower deck: standfirst + clickable lead-story preview card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: cols('1fr 1fr'),
            gap: 56,
            paddingTop: 28,
            paddingBottom: 36,
            borderTop: `1px solid ${color.ink}`,
            marginTop: 96
          }}>
          <div>
            <Eyebrow size="sm" opacity={0.65} style={{ letterSpacing: '0.26em', marginBottom: 18 }}>
              Awards · Editorial · Interviews · Features
            </Eyebrow>
            <p
              className="serif"
              style={{
                fontSize: 'clamp(20px, 1.7vw, 26px)',
                fontWeight: 300,
                fontStyle: 'italic',
                lineHeight: 1.45,
                letterSpacing: '0.005em',
                textWrap: 'pretty',
                maxWidth: '38ch',
                margin: 0
              }}>
              A small studio, quietly recognized — a record of the awards, articles, and conversations the work has been part of.
            </p>
          </div>

          <a
            href="#sec-stellar"
            onClick={e => {
              e.preventDefault();
              const el = document.getElementById('sec-stellar');
              if (el) {
                const top = el.getBoundingClientRect().top + window.scrollY - 24;
                window.scrollTo({ top, behavior: 'smooth' });
              }
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: cols('1fr 1.2fr'),
              gap: 24,
              borderTop: `1px solid ${color.hairline}`,
              borderBottom: `1px solid ${color.hairline}`,
              padding: '20px 0',
              color: color.ink,
              textDecoration: 'none'
            }}>
            <RevealImage src={pressImg('awards/stellar-2026-card.jpg')} style={{ aspectRatio: '4/5', minHeight: 180 }} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div
                  className="serif"
                  style={{
                    fontSize: 'clamp(22px, 2vw, 32px)',
                    fontWeight: 300,
                    lineHeight: 1.05,
                    letterSpacing: '-0.005em',
                    textTransform: 'uppercase',
                    textWrap: 'balance'
                  }}>
                  Two Stellar Awards <em style={{ fontWeight: 300, textTransform: 'none' }}>for a single project</em>
                </div>
                <Eyebrow size="sm" opacity={0.55} style={{ letterSpacing: '0.22em', marginTop: 14 }}>
                  Best Curb Appeal · Best Kitchen
                </Eyebrow>
              </div>
              <Eyebrow size="sm" opacity={0.7} style={{ letterSpacing: '0.26em', marginTop: 12 }}>
                Continue reading →
              </Eyebrow>
            </div>
          </a>
        </div>
      </Section>

      {/* Stellar Awards intro */}
      <Section id="sec-stellar" padTop="sm" padBottom="xxs" style={{ borderBottom: `1px solid ${color.hairline}`, scrollMarginTop: 24 }}>
        <div
          ref={ref}
          style={{
            display: 'grid',
            gridTemplateColumns: cols('0.9fr 1.6fr'),
            gap: 80,
            alignItems: 'baseline',
            opacity: seen ? 1 : 0,
            transform: seen ? 'translateY(0)' : 'translateY(28px)',
            transition: `all ${motion.durXSlow} ${motion.ease}`
          }}>
          <div>
            <Eyebrow style={{ marginBottom: 22, letterSpacing: '0.26em' }}>— Lead Story</Eyebrow>
            <Eyebrow size="sm" opacity={0.65} style={{ letterSpacing: '0.26em', marginBottom: 14 }}>
              2026 · Stellar Awards
            </Eyebrow>
            <Eyebrow size="sm" opacity={0.55} style={{ letterSpacing: '0.22em', marginBottom: 14 }}>
              Aiken-Augusta Region
            </Eyebrow>
            <Eyebrow size="sm" opacity={0.55} style={{ letterSpacing: '0.22em', marginBottom: 14 }}>
              Custom Built Spec Home
            </Eyebrow>
            <Eyebrow size="sm" opacity={0.55} style={{ letterSpacing: '0.22em' }}>
              Design by Laurel Leaf Design Studio
            </Eyebrow>
          </div>
          <div>
            <h2
              className="serif"
              style={{
                fontSize: 'clamp(34px, 3.4vw, 52px)',
                fontWeight: 300,
                lineHeight: 1.18,
                letterSpacing: '-0.005em',
                textWrap: 'pretty',
                marginBottom: 32,
                marginTop: 0
              }}>
              One house designed by Laurel Leaf Design Studio, two <em style={{ fontWeight: 300 }}>Stellar Awards</em> from the Home
              Builders Association — <em style={{ fontWeight: 300 }}>Best Curb Appeal</em> and{' '}
              <em style={{ fontWeight: 300 }}>Best Kitchen</em>.
            </h2>
            <p style={{ ...text.body, maxWidth: '58ch' }}>
              Presented by the Home Builders Association of the Aiken-Augusta Region, the awards recognize homes built before there is a
              buyer, finished with the same care as a custom home. Both honors were given for a single project, built with Southern State
              Builders — a close collaboration on the exterior vision, with the studio leading the kitchen design and interior detailing.
            </p>
          </div>
        </div>
      </Section>

      {/* Award cards */}
      <Section padY="xs" style={{ borderBottom: `1px solid ${color.hairline}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: cols('repeat(2, 1fr)'), gap: 60 }}>
          {AWARDS.map((a, i) => (
            <article key={a.category} style={{ display: 'flex', flexDirection: 'column' }}>
              <RevealImage src={a.img} index={i} style={{ aspectRatio: '4/5', marginBottom: 32 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>★</span>
                <Eyebrow size="sm" opacity={0.6} style={{ letterSpacing: '0.24em' }}>
                  Stellar Awards · {a.year}
                </Eyebrow>
              </div>
              <h3
                className="serif"
                style={{
                  fontSize: 'clamp(36px, 3.6vw, 56px)',
                  fontWeight: 300,
                  lineHeight: 1.0,
                  letterSpacing: '-0.012em',
                  textTransform: 'uppercase',
                  marginBottom: 20,
                  marginTop: 0
                }}>
                {a.category}
              </h3>
              <Eyebrow opacity={0.65} style={{ marginBottom: 22, letterSpacing: '0.18em' }}>
                {a.subcategory}
              </Eyebrow>
              {a.caption && <p style={{ ...text.bodySm, fontSize: 15.5, lineHeight: 1.65, maxWidth: '42ch' }}>{a.caption}</p>}
            </article>
          ))}
        </div>
        <Eyebrow size="sm" style={{ marginTop: 32, letterSpacing: '0.22em' }}>
          Design by Laurel Leaf Design Studio · Built with Southern State Builders
        </Eyebrow>
      </Section>

      {/* Project gallery */}
      <Section
        padY="sm"
        style={{
          background: 'rgba(31,58,50,0.04)',
          borderBottom: `1px solid ${color.hairline}`
        }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: cols('1.2fr 1fr'),
            gap: 80,
            alignItems: 'end',
            marginBottom: 70
          }}>
          <div>
            <Eyebrow style={{ marginBottom: 22 }}>— Project · The award-winning home</Eyebrow>
            <h2
              className="serif"
              style={{
                fontSize: 'clamp(48px, 6vw, 92px)',
                fontWeight: 300,
                lineHeight: 0.98,
                letterSpacing: '-0.018em',
                textTransform: 'uppercase',
                margin: 0
              }}>
              On site
            </h2>
          </div>
          <p style={{ ...text.body, fontSize: 16.5, maxWidth: '46ch' }}>
            A small selection from the project — the elevation that took Best Curb Appeal, the kitchen that took Best Kitchen, and the
            interior detailing around them.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: cols('repeat(6, 1fr)'), gap: 16, gridAutoRows: compact ? 'auto' : '160px' }}>
          {GALLERY.map((src, i) => {
            const l = GALLERY_LAYOUTS[i] ?? { col: 'span 2', row: 'span 3' };
            return (
              <RevealImage
                key={src + i}
                src={src}
                // The first two tiles are their own row; the stagger restarts on the row of three below.
                index={i < 2 ? i : i - 2}
                style={{
                  gridColumn: compact ? 'auto' : l.col,
                  gridRow: compact ? 'auto' : l.row,
                  aspectRatio: compact ? '4/5' : undefined
                }}
              />
            );
          })}
        </div>
        <Eyebrow size="sm" style={{ marginTop: 32, letterSpacing: '0.22em' }}>
          Design: Laurel Leaf Design Studio · Builder: Southern State Builders · @laurelleafdesignstudio
        </Eyebrow>
      </Section>

      {/* Magazine feature — Aiken Hound & Home, Winter 2024 */}
      <Section id="sec-magazine" padTop="xxs" padBottom="none" style={{ scrollMarginTop: 'var(--scroll-offset)' }}>
        <Eyebrow style={{ marginBottom: 60 }}>— Editorial · Winter 2024</Eyebrow>
        <div
          ref={refFeature}
          style={{
            display: 'grid',
            gridTemplateColumns: cols('0.9fr 1.6fr'),
            gap: 80,
            alignItems: 'start',
            opacity: seenFeature ? 1 : 0,
            transform: seenFeature ? 'translateY(0)' : 'translateY(28px)',
            transition: `all ${motion.durXSlow} ${motion.ease}`
          }}>
          <div>
            {/* The masthead is black on white, so multiply over Bone White knocks the box out for free and leaves the
                publication's mark in its own color. */}
            <Image
              src={pressImg('magazine/hh-masthead.png')}
              alt="Aiken Hound &amp; Home Magazine"
              width={622}
              height={186}
              style={{ width: 'min(240px, 70%)', height: 'auto', mixBlendMode: 'multiply', display: 'block', marginBottom: 26 }}
            />
            <Eyebrow size="sm" opacity={0.65} style={{ letterSpacing: '0.26em', marginBottom: 14 }}>
              Winter Issue 2024
            </Eyebrow>
            <Eyebrow size="sm" opacity={0.55} style={{ letterSpacing: '0.22em' }}>
              Aiken, South Carolina
            </Eyebrow>
          </div>
          <div>
            <h2
              className="serif"
              style={{
                fontSize: 'clamp(40px, 4.6vw, 72px)',
                fontWeight: 300,
                lineHeight: 1.05,
                letterSpacing: '-0.012em',
                textWrap: 'balance',
                marginTop: 0,
                marginBottom: 32
              }}>
              Understated Luxury: <em style={{ fontWeight: 300 }}>a bathroom transformed</em>
            </h2>
            <p style={{ ...text.body, maxWidth: '54ch', margin: 0 }}>
              Four pages in the winter issue of Aiken Hound &amp; Home, written by the studio&apos;s founder. A dark, hard-working master
              bath was opened back up to the light — the shower wall lowered, marble laid in a custom-cut pattern over heated floors, and a
              freestanding tub set where it could become the room&apos;s centre of gravity.
            </p>
          </div>
        </div>
      </Section>

      {/* The reader sits outside <Section> — a full-bleed pinned stage, not a padded block. */}
      <MagazineReader pages={MAGAZINE_PAGES} />

      <Section padTop="xs" padBottom="sm">
        <div style={{ display: 'grid', gridTemplateColumns: cols('0.85fr 1.15fr'), gap: 80, alignItems: 'center' }}>
          <RevealImage src={pressImg('magazine/portrait.jpg')} style={{ aspectRatio: '2/3' }} />
          <div>
            <Eyebrow style={{ marginBottom: 26, letterSpacing: '0.26em' }}>— The feature</Eyebrow>
            <ul
              style={{
                listStyle: 'none',
                display: 'grid',
                gap: 14,
                margin: 0,
                padding: 0,
                borderTop: `1px solid ${color.hairline}`,
                paddingTop: 22
              }}>
              {FEATURE_META.map(([k, v]) => (
                <li
                  key={k}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: cols('160px 1fr'),
                    gap: 24,
                    paddingBottom: 14,
                    borderBottom: `1px solid ${color.hairline}`,
                    alignItems: 'baseline'
                  }}>
                  <Eyebrow as="span" size="sm" opacity={0.6} style={{ letterSpacing: '0.22em' }}>
                    {k}
                  </Eyebrow>
                  <span className="serif" style={{ fontSize: 19, fontWeight: 300 }}>
                    {v}
                  </span>
                </li>
              ))}
            </ul>
            <Eyebrow size="sm" style={{ marginTop: 30, letterSpacing: '0.22em' }}>
              Photography by River Magnolia Photography
            </Eyebrow>
          </div>
        </div>
      </Section>
    </>
  );
}
