'use client';

import Image from 'next/image';
import { useReveal } from '@/hooks/useReveal';
import { useCompact } from '@/hooks/useCompact';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Heading';
import { color, motion, text } from '@/lib/tokens';

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
  const [ref, seen] = useReveal<HTMLDivElement>();
  const compact = useCompact();

  return (
    <>
      {/* Hero — full-bleed, no Section wrapper (atypical layout) */}
      <section
        style={{
          position: 'relative',
          height: compact ? 'auto' : '100vh',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: compact ? '1fr' : '1.1fr 1fr'
        }}>
        <div style={{ position: 'relative', overflow: 'hidden', height: compact ? '82vh' : '100%' }}>
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
                background: `linear-gradient(to bottom, transparent 0%, ${color.bg} 92%)`,
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
            padding: compact ? '0 var(--gutter) 40px' : '0 var(--gutter)',
            marginTop: compact ? -32 : 0,
            gap: 34
          }}>
          <Eyebrow>— The Studio</Eyebrow>
          <Heading level="display">
            A measured, <em style={{ fontWeight: 300 }}>intentional</em> approach to the spaces we call home.
          </Heading>
          <p style={{ ...text.body, maxWidth: '46ch' }}>
            Laurel Leaf Design Studio was founded by Maria Rhinehart in 2020. The studio is based in the Augusta, Georgia and Aiken, South
            Carolina area, bringing a carefully considered approach to each home.
          </p>
        </div>
      </section>

      {/* Portrait + Approach */}
      <Section
        as="section"
        padTop="xs"
        padBottom="lg"
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? '1fr' : '1fr 1.3fr',
          gap: compact ? 48 : 100,
          alignItems: 'start'
        }}>
        <div
          style={{
            opacity: seen ? 1 : 0,
            transform: seen ? 'translateY(0)' : 'translateY(30px)',
            transition: `all ${motion.durXSlow} ${motion.ease}`,
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
              borderTop: `1px solid ${color.hairline}`
            }}>
            <Image
              src="/images/profile/maria36.jpg"
              alt="Maria Rhinehart"
              width={90}
              height={110}
              sizes="90px"
              style={{ objectFit: 'cover', objectPosition: 'center 20%', filter: 'grayscale(0.85)' }}
            />
            <div>
              <div className="serif" style={{ fontSize: 26, fontWeight: 300, fontStyle: 'italic', letterSpacing: '0.01em' }}>
                Maria Rhinehart
              </div>
              <Eyebrow size="sm" opacity={0.6} style={{ marginTop: 8 }}>
                Founder &amp; Interior Designer
              </Eyebrow>
            </div>
          </div>
        </div>
        <div
          ref={ref}
          style={{
            opacity: seen ? 1 : 0,
            transform: seen ? 'translateY(0)' : 'translateY(30px)',
            transition: `all ${motion.durXSlow} ${motion.ease} 0.15s`
          }}>
          <Eyebrow style={{ marginBottom: 30 }}>— Approach</Eyebrow>
          <Heading level="section" style={{ marginBottom: 36 }}>
            A home is more than a collection of finishes — it is shaped by how we live, what we value, and the places that have left an
            impression on us.
          </Heading>
          <div style={{ display: 'grid', gap: 22, maxWidth: '58ch', ...text.body, lineHeight: 1.75 }}>
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
      </Section>

      {/* Principles */}
      <Section padTop="none" padBottom="lg">
        <Eyebrow style={{ marginBottom: 60 }}>— Principles</Eyebrow>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: compact ? '1fr' : 'repeat(3, 1fr)',
            gap: compact ? 32 : 60,
            borderTop: `1px solid ${color.hairline}`,
            paddingTop: 50
          }}>
          {PRINCIPLES.map(v => (
            <div key={v.h}>
              <Heading level="card" italic style={{ marginBottom: 18 }}>
                {v.h}
              </Heading>
              <p style={text.bodySm}>{v.p}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
