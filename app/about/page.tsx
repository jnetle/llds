'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useReveal } from '@/hooks/useReveal';
import { useCompact } from '@/hooks/useCompact';

const PRINCIPLES = [
  {
    h: 'Patience over polish',
    p: 'We prefer the plaster that is trowelled by hand, and the joinery that takes three weeks instead of three days.'
  },
  {
    h: 'Material honesty',
    p: 'Oak left to silver, limewash that chalks gently, linen that creases. Finishes should soften, not wear out.'
  },
  {
    h: 'Rooted in place',
    p: 'Every commission begins with a walk — through the site, the neighbourhood, the garden — before a single sketch is made.'
  }
];

export default function AboutPage() {
  const [ref, seen] = useReveal<HTMLElement>();
  const compact = useCompact();

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          height: compact ? 'auto' : '100vh',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: compact ? '1fr' : '1.1fr 1fr'
        }}>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: compact ? '82vh' : '100%'
          }}>
          {/* Portraits via `next/image fill`: default objectPosition to 'center 25%' to keep faces in frame as aspect ratios narrow. */}
          <Image
            src="/images/profile/maria39.jpg"
            alt="Maria Rhinehart, founder of Laurel Leaf Design Studio"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            style={{ objectFit: 'cover', objectPosition: 'center 25%' }}
          />
          {compact && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '38%',
                background: 'linear-gradient(to bottom, transparent 0%, var(--bg) 92%)',
                pointerEvents: 'none'
              }}
            />
          )}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: compact ? '8px 8vw 80px' : '0 8vw',
            gap: 34
          }}>
          <div className="micro" style={{ opacity: 0.55 }}>
            — The Studio
          </div>
          <h1
            className="serif"
            style={{
              fontSize: 'clamp(44px, 5.2vw, 84px)',
              lineHeight: 1.02,
              fontWeight: 300,
              letterSpacing: '-0.012em',
              textWrap: 'balance'
            }}>
            An unhurried practice <em style={{ fontWeight: 300 }}>rooted</em> in the English countryside.
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: 'var(--ink-soft)',
              maxWidth: '46ch'
            }}>
            Laurel Leaf Design Studio was founded by Maria Rhinehart in XXXX after a decade working across residential architecture and
            antique dealing. The studio operates from a small mews in Bloomsbury, with a second workshop in rural Oxfordshire.
          </p>
        </div>
      </section>

      {/* Portrait + Approach */}
      <section
        ref={ref}
        style={{
          padding: '160px 8vw',
          display: 'grid',
          gridTemplateColumns: compact ? '1fr' : '1fr 1.3fr',
          gap: compact ? 48 : 100,
          alignItems: 'start'
        }}>
        <div
          style={{
            opacity: seen ? 1 : 0,
            transform: seen ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s cubic-bezier(.22,.61,.36,1)',
            position: compact ? 'static' : 'sticky',
            top: compact ? 'auto' : 120
          }}>
          <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
            <Image
              src="/images/profile/maria117.jpg"
              alt="Maria Rhinehart in the studio"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
            />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: compact ? '1fr' : '90px 1fr',
              gap: 22,
              alignItems: 'center',
              marginTop: 32,
              paddingTop: 32,
              borderTop: '1px solid var(--hairline)'
            }}>
            <Image
              src="/images/profile/maria36.jpg"
              alt="Maria Rhinehart"
              width={90}
              height={110}
              sizes="90px"
              style={{
                objectFit: 'cover',
                objectPosition: 'center 20%',
                filter: 'grayscale(0.85)'
              }}
            />
            <div>
              <div
                className="serif"
                style={{
                  fontSize: 26,
                  fontWeight: 300,
                  fontStyle: 'italic',
                  letterSpacing: '0.01em'
                }}>
                Maria Rhinehart
              </div>
              <div className="micro-sm" style={{ marginTop: 8, opacity: 0.6 }}>
                Founder &amp; Interior Designer
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            opacity: seen ? 1 : 0,
            transform: seen ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s cubic-bezier(.22,.61,.36,1) 0.15s'
          }}>
          <div className="micro" style={{ marginBottom: 30, opacity: 0.55 }}>
            — Approach
          </div>
          <h2
            className="serif"
            style={{
              fontSize: 'clamp(30px, 3vw, 44px)',
              fontWeight: 300,
              lineHeight: 1.2,
              letterSpacing: '-0.005em',
              marginBottom: 36,
              textWrap: 'pretty'
            }}>
            A home is more than a collection of finishes — it is shaped by how we live, what we value, and the places that have left an
            impression on us.
          </h2>
          <div
            style={{
              display: 'grid',
              gap: 22,
              fontSize: 17,
              lineHeight: 1.75,
              color: 'var(--ink-soft)',
              maxWidth: '58ch'
            }}>
            <p>Every project begins with understanding not just how a space should look, but how it should feel.</p>
            <p>
              The architecture, the surroundings, the way light moves through a room, the scale of a space in relation to how it&apos;s
              lived in — these are the elements that create a home that feels grounded and intentional.
            </p>
            <p>
              Our work is rooted in a balance of creativity and precision. Inspired by years in both the home furnishings and building
              industries, I approach each project with equal attention to design and execution, ensuring that what is imagined can be
              carried through to completion with clarity.
            </p>
            <p>
              I&apos;m drawn to spaces that feel layered and lived in. There is always a quiet reference to what has come before — through
              materials, proportion, and detail — while still creating something that feels current and distinctly your own.
            </p>
            <p>
              This is not about making a space simply look beautiful. It&apos;s about creating a home that evokes a sense of place, holds
              meaning, and supports the way you live every day.
            </p>
            <p style={{ fontStyle: 'italic' }}>
              And along the way, the process should feel thoughtful, collaborative, and yes — there&apos;s usually a little fun (and likely
              a snack) involved too.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section style={{ padding: '0 8vw 160px' }}>
        <div className="micro" style={{ marginBottom: 60, opacity: 0.55 }}>
          — Principles
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: compact ? '1fr' : 'repeat(3, 1fr)',
            gap: compact ? 32 : 60,
            borderTop: '1px solid var(--hairline)',
            paddingTop: 50
          }}>
          {PRINCIPLES.map(v => (
            <div key={v.h}>
              <h3
                className="serif"
                style={{
                  fontSize: 26,
                  fontWeight: 300,
                  fontStyle: 'italic',
                  marginBottom: 18,
                  lineHeight: 1.2
                }}>
                {v.h}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: 'var(--ink-soft)'
                }}>
                {v.p}
              </p>
            </div>
          ))}
        </div>
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
