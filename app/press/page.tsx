'use client';

import Link from 'next/link';
import { useReveal } from '@/hooks/useReveal';
import { useCols } from '@/hooks/useCompact';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Section } from '@/components/ui/Section';
import { color, motion, text } from '@/lib/tokens';

const AWARDS = [
  {
    category: 'Best Curb Appeal',
    subcategory: 'Custom Built Spec Home',
    year: '2026',
    img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80',
    caption: 'Front elevation, evening — limewash, standing-seam metal, mature hornbeam.'
  },
  {
    category: 'Best Kitchen',
    subcategory: 'Custom Built Spec Home',
    year: '2026',
    img: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1600&q=80',
    caption: 'Plaster range hood, hand-glazed zellige, reclaimed Douglas fir island.'
  }
];

const GALLERY = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1400&q=80'
];

const GALLERY_LAYOUTS = [
  { col: 'span 3', row: 'span 2' },
  { col: 'span 3', row: 'span 1' },
  { col: 'span 2', row: 'span 1' },
  { col: 'span 4', row: 'span 2' },
  { col: 'span 3', row: 'span 1' },
  { col: 'span 3', row: 'span 1' }
];

const FEATURE_META: [string, string][] = [
  ['Publication', 'To be announced'],
  ['Issue', 'Forthcoming'],
  ['Format', 'Print & digital · 8 pages'],
  ['Photography', 'Studio archive']
];

export default function PressPage() {
  const [ref, seen] = useReveal<HTMLDivElement>();
  const [refFeature, seenFeature] = useReveal<HTMLDivElement>();
  const cols = useCols();

  return (
    <>
      {/* Hero — broadsheet masthead */}
      <Section
        padTop="xl"
        padBottom="xs"
        style={{
          position: 'relative',
          borderBottom: `2px solid ${color.hairline}`,
          overflow: 'hidden'
        }}>
        <div style={{ position: 'relative' }}>
          <h1
            className="serif"
            style={{
              fontSize: 'clamp(96px, 16vw, 280px)',
              fontWeight: 300,
              lineHeight: 0.82,
              letterSpacing: '-0.035em',
              textTransform: 'uppercase',
              textWrap: 'balance',
              margin: 0
            }}>
            Press
          </h1>
          <div
            className="serif"
            aria-hidden
            style={{
              position: 'absolute',
              right: '6%',
              top: '8%',
              fontSize: 'clamp(160px, 22vw, 380px)',
              fontWeight: 300,
              fontStyle: 'italic',
              lineHeight: 1,
              color: color.ink,
              opacity: 0.12,
              pointerEvents: 'none'
            }}>
            &amp;
          </div>
          <h1
            className="serif"
            style={{
              fontSize: 'clamp(80px, 13vw, 230px)',
              fontWeight: 300,
              lineHeight: 0.82,
              fontStyle: 'italic',
              letterSpacing: '-0.025em',
              marginTop: 4,
              marginBottom: 0,
              marginLeft: '0.4em'
            }}>
            recognition
          </h1>
        </div>
      </Section>

      {/* Stellar Awards intro */}
      <Section padTop="md" padBottom="xs" style={{ borderBottom: `1px solid ${color.hairline}` }}>
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
            <Eyebrow size="sm" opacity={0.55} style={{ letterSpacing: '0.22em' }}>
              Custom Built Spec Home
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
              Laurel Leaf Design Studio was honoured at the <em style={{ fontWeight: 300 }}>Stellar Awards</em> with two recognitions in the
              Custom Built Spec Home category — <em style={{ fontWeight: 300 }}>Best Curb Appeal</em> and{' '}
              <em style={{ fontWeight: 300 }}>Best Kitchen</em>.
            </h2>
            <p style={{ ...text.body, maxWidth: '58ch' }}>
              The awards recognise homes built on speculation that nonetheless arrive with the considered detail of a bespoke commission.
              Both honours were given for a single project — a four-bedroom new build completed late last year, photographed below.
            </p>
          </div>
        </div>
      </Section>

      {/* Award cards */}
      <Section padY="sm" style={{ borderBottom: `1px solid ${color.hairline}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: cols('repeat(2, 1fr)'), gap: 60 }}>
          {AWARDS.map(a => (
            <article key={a.category} style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  aspectRatio: '4/5',
                  marginBottom: 32,
                  backgroundImage: `url("${a.img}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
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
              <p style={{ ...text.bodySm, fontSize: 15.5, lineHeight: 1.65, maxWidth: '42ch' }}>{a.caption}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* Project gallery */}
      <Section
        padY="lg"
        style={{
          background: 'rgba(42,46,37,0.04)',
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
              From the shoot
            </h2>
          </div>
          <p style={{ ...text.body, fontSize: 16.5, maxWidth: '46ch' }}>
            A small selection from the project&apos;s editorial photography. Full case study coming to the journal this autumn.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: cols('repeat(6, 1fr)'), gap: 16, gridAutoRows: '180px' }}>
          {GALLERY.map((src, i) => {
            const l = GALLERY_LAYOUTS[i] ?? { col: 'span 2', row: 'span 1' };
            return (
              <div
                key={src + i}
                style={{
                  gridColumn: l.col,
                  gridRow: l.row,
                  backgroundImage: `url("${src}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            );
          })}
        </div>
        <Eyebrow size="sm" style={{ marginTop: 32, letterSpacing: '0.22em' }}>
          Photography: Studio archive · published on @laurelleaf.studio
        </Eyebrow>
      </Section>

      {/* Magazine feature */}
      <Section padY="lg">
        <Eyebrow style={{ marginBottom: 60 }}>— Editorial · Forthcoming</Eyebrow>
        <div
          ref={refFeature}
          style={{
            display: 'grid',
            gridTemplateColumns: cols('1fr 1.2fr'),
            gap: 90,
            alignItems: 'center',
            opacity: seenFeature ? 1 : 0,
            transform: seenFeature ? 'translateY(0)' : 'translateY(28px)',
            transition: `all ${motion.durXSlow} ${motion.ease}`
          }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                aspectRatio: '3/4',
                background: 'linear-gradient(165deg, #d8cfbf 0%, #b8ad97 60%, #968a72 100%)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 30px 60px -20px rgba(42,46,37,0.35), 0 8px 20px -8px rgba(42,46,37,0.25)'
              }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'repeating-linear-gradient(90deg, transparent 0 60px, rgba(42,46,37,0.025) 60px 61px)'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 36,
                  left: 36,
                  right: 36,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  color: color.ink
                }}>
                <div className="serif" style={{ fontSize: 36, fontWeight: 400, letterSpacing: '-0.01em', fontStyle: 'italic' }}>
                  Magazine
                </div>
                <Eyebrow size="sm" opacity={0.7} style={{ letterSpacing: '0.22em' }}>
                  ISSUE TBC
                </Eyebrow>
              </div>
              <div style={{ position: 'absolute', left: 36, right: 36, bottom: 44, color: color.ink }}>
                <Eyebrow size="sm" opacity={0.65} style={{ letterSpacing: '0.26em', marginBottom: 14 }}>
                  COVER STORY · TBA
                </Eyebrow>
                <div
                  className="serif"
                  style={{
                    fontSize: 'clamp(22px, 2.4vw, 34px)',
                    fontWeight: 300,
                    lineHeight: 1.1,
                    letterSpacing: '-0.005em',
                    textTransform: 'uppercase'
                  }}>
                  Title to be confirmed
                </div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  inset: '38% 28% 38% 28%',
                  border: '1px dashed rgba(42,46,37,0.4)',
                  display: 'grid',
                  placeItems: 'center'
                }}>
                <Eyebrow size="sm" style={{ letterSpacing: '0.28em', textAlign: 'center', color: color.ink }}>
                  Image
                  <br />
                  placeholder
                </Eyebrow>
              </div>
            </div>
            <Eyebrow size="sm" style={{ marginTop: 18, letterSpacing: '0.24em', textAlign: 'center' }}>
              [ Awaiting publication artwork ]
            </Eyebrow>
          </div>

          <div>
            <Eyebrow style={{ marginBottom: 24, letterSpacing: '0.26em' }}>Magazine feature · placeholder</Eyebrow>
            <h2
              className="serif"
              style={{
                fontSize: 'clamp(40px, 4.6vw, 72px)',
                fontWeight: 300,
                lineHeight: 1.05,
                letterSpacing: '-0.012em',
                textWrap: 'balance',
                marginBottom: 32,
                marginTop: 0
              }}>
              An <em style={{ fontWeight: 300 }}>upcoming feature</em> with a national interiors title.
            </h2>
            <p style={{ ...text.body, maxWidth: '52ch', marginBottom: 28 }}>
              Details, cover artwork, and the full editorial spread will be added here once embargo lifts. The piece focuses on the
              studio&apos;s approach to spec homes that read as bespoke — and how restraint, rather than flourish, carried both
              award-winning rooms.
            </p>
            <ul
              style={{
                listStyle: 'none',
                display: 'grid',
                gap: 14,
                borderTop: `1px solid ${color.hairline}`,
                paddingTop: 22
              }}>
              {FEATURE_META.map(([k, v]) => (
                <li
                  key={k}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: cols('180px 1fr'),
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
          </div>
        </div>
      </Section>

      {/* CTA back */}
      <Section padTop="none" padBottom="xl" style={{ textAlign: 'center' }}>
        <Link href="/" className="micro" style={{ borderBottom: '1px solid currentColor', paddingBottom: 6, letterSpacing: '0.28em' }}>
          ↵ Return to Projects
        </Link>
      </Section>
    </>
  );
}
