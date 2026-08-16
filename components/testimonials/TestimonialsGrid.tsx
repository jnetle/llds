'use client';

import { useReveal } from '@/hooks/useReveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Grid } from '@/components/ui/Grid';
import { Section } from '@/components/ui/Section';
import { motion } from '@/lib/tokens';
import { TESTIMONIALS } from '@/lib/testimonials';

const SHOWN = TESTIMONIALS.slice(0, 3);

export function TestimonialsGrid() {
  const [ref, seen] = useReveal<HTMLElement>();

  return (
    <Section ref={ref} padY="xxs" topBorder>
      <Eyebrow
        opacity={seen ? 0.5 : 0}
        style={{
          marginBottom: 24,
          transform: seen ? 'translateY(0)' : 'translateY(20px)',
          transition: `all ${motion.durSlow} ease`
        }}>
        — In Their Words
      </Eyebrow>

      <Grid cols={{ d: '1fr 1fr 1fr', t: '1fr', m: '1fr' }} gap={{ d: 64, m: 48 }}>
        {SHOWN.map((t, i) => (
          <figure
            key={t.id}
            style={{
              margin: 0,
              opacity: seen ? 1 : 0,
              transform: seen ? 'translateY(0)' : 'translateY(24px)',
              transition: `all ${motion.durSlow} ${motion.ease} ${i * 0.12}s`
            }}>
            <blockquote
              className="serif"
              style={{
                margin: 0,
                fontSize: 'clamp(22px, 2vw, 28px)',
                fontStyle: 'italic',
                fontWeight: 300,
                lineHeight: 1.45
              }}>
              “{t.quote}”
            </blockquote>
            <figcaption style={{ marginTop: 28 }}>
              <Eyebrow size="sm" opacity={0.5}>
                {t.attribution}
              </Eyebrow>
              <Eyebrow size="sm" opacity={0.35} style={{ marginTop: 6 }}>
                {t.project} · {t.year}
              </Eyebrow>
            </figcaption>
          </figure>
        ))}
      </Grid>
    </Section>
  );
}
