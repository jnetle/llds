'use client';

import Link from 'next/link';
import { useReveal } from '@/hooks/useReveal';

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

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Hero — broadsheet masthead */}
      <section
        style={{
          position: 'relative',
          padding: '180px 8vw 90px',
          background: 'var(--bg)',
          borderBottom: '2px solid var(--ink)',
          overflow: 'hidden'
        }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 24,
            alignItems: 'baseline',
            paddingBottom: 22,
            borderBottom: '1px solid var(--ink)',
            marginBottom: 60
          }}>
          <div className="micro-sm" style={{ opacity: 0.7, letterSpacing: '0.26em' }}>
            Vol. I · No. 04
          </div>
          <div
            className="micro-sm"
            style={{
              opacity: 0.7,
              letterSpacing: '0.32em',
              textAlign: 'center'
            }}>
            The Laurel Leaf Bulletin
          </div>
          <div
            className="micro-sm"
            style={{
              opacity: 0.7,
              letterSpacing: '0.26em',
              textAlign: 'right'
            }}>
            Spring 2026 · Free
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <h1
            className="serif"
            style={{
              fontSize: 'clamp(96px, 16vw, 280px)',
              fontWeight: 300,
              lineHeight: 0.82,
              letterSpacing: '-0.035em',
              textTransform: 'uppercase',
              textWrap: 'balance'
            }}>
            Press
          </h1>
          <div
            className="serif"
            style={{
              position: 'absolute',
              right: '6%',
              top: '8%',
              fontSize: 'clamp(160px, 22vw, 380px)',
              fontWeight: 300,
              fontStyle: 'italic',
              lineHeight: 1,
              color: 'var(--ink)',
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
              marginLeft: '0.4em'
            }}>
            recognition
          </h1>
        </div>

        <div
          style={{
            marginTop: 80,
            display: 'grid',
            gridTemplateColumns: '1fr 1.6fr 1fr',
            gap: 60,
            alignItems: 'start',
            paddingTop: 30,
            borderTop: '1px solid var(--ink)'
          }}>
          <div
            className="micro-sm"
            style={{
              opacity: 0.65,
              letterSpacing: '0.26em',
              lineHeight: 1.7
            }}>
            Awards · Editorial
            <br />
            Interviews · Features
          </div>
          <p
            className="serif"
            style={{
              fontSize: 'clamp(20px, 1.7vw, 26px)',
              fontWeight: 300,
              lineHeight: 1.45,
              letterSpacing: '0.005em',
              textWrap: 'pretty',
              maxWidth: '52ch',
              justifySelf: 'center',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
            A small studio, quietly recognised — a record of the awards, articles, and conversations the work has been part of.
          </p>
          <div style={{ justifySelf: 'end', textAlign: 'right' }}>
            <div
              className="serif"
              style={{
                fontSize: 56,
                fontWeight: 300,
                lineHeight: 1,
                fontStyle: 'italic'
              }}>
              02
            </div>
            <div
              className="micro-sm"
              style={{
                marginTop: 8,
                opacity: 0.6,
                letterSpacing: '0.24em'
              }}>
              awards · this issue
            </div>
          </div>
        </div>
      </section>

      {/* Stellar Awards intro */}
      <section
        style={{
          padding: '140px 8vw 100px',
          borderBottom: '1px solid var(--hairline)'
        }}>
        <div
          ref={ref}
          style={{
            display: 'grid',
            gridTemplateColumns: '0.9fr 1.6fr',
            gap: 80,
            alignItems: 'baseline',
            opacity: seen ? 1 : 0,
            transform: seen ? 'translateY(0)' : 'translateY(28px)',
            transition: 'all 1s cubic-bezier(.22,.61,.36,1)'
          }}>
          <div>
            <div
              className="micro"
              style={{
                opacity: 0.55,
                marginBottom: 22,
                letterSpacing: '0.26em'
              }}>
              — Lead Story
            </div>
            <div
              className="micro-sm"
              style={{
                opacity: 0.65,
                letterSpacing: '0.26em',
                marginBottom: 14
              }}>
              2026 · Stellar Awards
            </div>
            <div className="micro-sm" style={{ opacity: 0.55, letterSpacing: '0.22em' }}>
              Custom Built Spec Home
            </div>
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
                marginBottom: 32
              }}>
              Laurel Leaf Design Studio was honoured at the <em style={{ fontWeight: 300 }}>Stellar Awards</em> with two recognitions in the
              Custom Built Spec Home category — <em style={{ fontWeight: 300 }}>Best Curb Appeal</em> and{' '}
              <em style={{ fontWeight: 300 }}>Best Kitchen</em>.
            </h2>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.7,
                color: 'var(--ink-soft)',
                maxWidth: '58ch'
              }}>
              The awards recognise homes built on speculation that nonetheless arrive with the considered detail of a bespoke commission.
              Both honours were given for a single project — a four-bedroom new build completed late last year, photographed below.
            </p>
          </div>
        </div>
      </section>

      {/* Award cards */}
      <section
        style={{
          padding: '120px 8vw',
          borderBottom: '1px solid var(--hairline)'
        }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 60
          }}>
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 18
                }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>★</span>
                <div className="micro-sm" style={{ opacity: 0.6, letterSpacing: '0.24em' }}>
                  Stellar Awards · {a.year}
                </div>
              </div>
              <h3
                className="serif"
                style={{
                  fontSize: 'clamp(36px, 3.6vw, 56px)',
                  fontWeight: 300,
                  lineHeight: 1.0,
                  letterSpacing: '-0.012em',
                  textTransform: 'uppercase',
                  marginBottom: 20
                }}>
                {a.category}
              </h3>
              <div
                className="micro"
                style={{
                  opacity: 0.65,
                  marginBottom: 22,
                  letterSpacing: '0.18em'
                }}>
                {a.subcategory}
              </div>
              <p
                style={{
                  fontSize: 15.5,
                  lineHeight: 1.65,
                  color: 'var(--ink-soft)',
                  maxWidth: '42ch'
                }}>
                {a.caption}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Project gallery */}
      <section
        style={{
          padding: '160px 8vw',
          background: 'rgba(42,46,37,0.04)',
          borderBottom: '1px solid var(--hairline)'
        }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: 80,
            alignItems: 'end',
            marginBottom: 70
          }}>
          <div>
            <div className="micro" style={{ opacity: 0.55, marginBottom: 22 }}>
              — Project · The award-winning home
            </div>
            <h2
              className="serif"
              style={{
                fontSize: 'clamp(48px, 6vw, 92px)',
                fontWeight: 300,
                lineHeight: 0.98,
                letterSpacing: '-0.018em',
                textTransform: 'uppercase'
              }}>
              From the shoot
            </h2>
          </div>
          <p
            style={{
              fontSize: 16.5,
              lineHeight: 1.7,
              color: 'var(--ink-soft)',
              maxWidth: '46ch'
            }}>
            A small selection from the project&apos;s editorial photography. Full case study coming to the journal this autumn.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 16,
            gridAutoRows: '180px'
          }}>
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
        <div
          className="micro-sm"
          style={{
            marginTop: 32,
            opacity: 0.55,
            letterSpacing: '0.22em'
          }}>
          Photography: Studio archive · published on @laurelleaf.studio
        </div>
      </section>

      {/* Magazine feature */}
      <section
        style={{
          padding: '160px 8vw',
          borderBottom: '1px solid var(--hairline)'
        }}>
        <div className="micro" style={{ opacity: 0.55, marginBottom: 60 }}>
          — Editorial · Forthcoming
        </div>
        <div
          ref={refFeature}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            gap: 90,
            alignItems: 'center',
            opacity: seenFeature ? 1 : 0,
            transform: seenFeature ? 'translateY(0)' : 'translateY(28px)',
            transition: 'all 1s cubic-bezier(.22,.61,.36,1)'
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
                  color: '#2A2E25'
                }}>
                <div
                  className="serif"
                  style={{
                    fontSize: 36,
                    fontWeight: 400,
                    letterSpacing: '-0.01em',
                    fontStyle: 'italic'
                  }}>
                  Magazine
                </div>
                <div className="micro-sm" style={{ opacity: 0.7, letterSpacing: '0.22em' }}>
                  ISSUE TBC
                </div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 36,
                  right: 36,
                  bottom: 44,
                  color: '#2A2E25'
                }}>
                <div
                  className="micro-sm"
                  style={{
                    opacity: 0.65,
                    letterSpacing: '0.26em',
                    marginBottom: 14
                  }}>
                  COVER STORY · TBA
                </div>
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
                <div
                  className="micro-sm"
                  style={{
                    opacity: 0.55,
                    letterSpacing: '0.28em',
                    textAlign: 'center',
                    color: '#2A2E25'
                  }}>
                  Image
                  <br />
                  placeholder
                </div>
              </div>
            </div>
            <div
              className="micro-sm"
              style={{
                marginTop: 18,
                opacity: 0.55,
                letterSpacing: '0.24em',
                textAlign: 'center'
              }}>
              [ Awaiting publication artwork ]
            </div>
          </div>

          <div>
            <div
              className="micro"
              style={{
                opacity: 0.55,
                marginBottom: 24,
                letterSpacing: '0.26em'
              }}>
              Magazine feature · placeholder
            </div>
            <h2
              className="serif"
              style={{
                fontSize: 'clamp(40px, 4.6vw, 72px)',
                fontWeight: 300,
                lineHeight: 1.05,
                letterSpacing: '-0.012em',
                textWrap: 'balance',
                marginBottom: 32
              }}>
              An <em style={{ fontWeight: 300 }}>upcoming feature</em> with a national interiors title.
            </h2>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.7,
                color: 'var(--ink-soft)',
                maxWidth: '52ch',
                marginBottom: 28
              }}>
              Details, cover artwork, and the full editorial spread will be added here once embargo lifts. The piece focuses on the
              studio&apos;s approach to spec homes that read as bespoke — and how restraint, rather than flourish, carried both
              award-winning rooms.
            </p>
            <ul
              style={{
                listStyle: 'none',
                display: 'grid',
                gap: 14,
                borderTop: '1px solid var(--hairline)',
                paddingTop: 22
              }}>
              {FEATURE_META.map(([k, v]) => (
                <li
                  key={k}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '180px 1fr',
                    gap: 24,
                    paddingBottom: 14,
                    borderBottom: '1px solid var(--hairline)',
                    alignItems: 'baseline'
                  }}>
                  <span className="micro-sm" style={{ opacity: 0.6, letterSpacing: '0.22em' }}>
                    {k}
                  </span>
                  <span className="serif" style={{ fontSize: 19, fontWeight: 300 }}>
                    {v}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Press contact */}
      <section style={{ padding: '160px 8vw', textAlign: 'center' }}>
        <div className="micro" style={{ opacity: 0.55, marginBottom: 30 }}>
          — Press enquiries
        </div>
        <h2
          className="serif"
          style={{
            fontSize: 'clamp(40px, 4.4vw, 68px)',
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: '-0.012em',
            textWrap: 'balance',
            marginBottom: 32,
            maxWidth: '22ch',
            marginInline: 'auto'
          }}>
          For interviews, image requests, or feature consideration —
        </h2>
        <a
          href="mailto:press@laurelleaf.studio"
          className="serif"
          style={{
            fontSize: 'clamp(28px, 2.8vw, 40px)',
            fontWeight: 300,
            fontStyle: 'italic',
            borderBottom: '1px solid currentColor',
            paddingBottom: 6
          }}>
          press@laurelleaf.studio
        </a>
      </section>

      {/* CTA back */}
      <section style={{ padding: '0 8vw 180px', textAlign: 'center' }}>
        <Link
          href="/"
          className="micro"
          style={{
            borderBottom: '1px solid currentColor',
            paddingBottom: 6,
            letterSpacing: '0.28em'
          }}>
          ↵ Return to Projects
        </Link>
      </section>
    </div>
  );
}
