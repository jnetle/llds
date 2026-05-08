'use client';

import { Fragment } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Grid } from '@/components/ui/Grid';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { motion, text } from '@/lib/tokens';

const HEADING_PARTS: (string | { italic: string })[] = [
  'We design',
  ' interiors that age',
  ' with grace —',
  ' rooted, quiet,',
  { italic: ' and lived in' },
  '.'
];

const DISCIPLINES = ['Residential Architecture', 'Furniture Commissioning', 'Material & Colour Direction', 'Garden & Threshold Design'];

export function StatementSection() {
  const [ref, seen] = useReveal<HTMLElement>();

  return (
    <Section ref={ref} padTop="xl" padBottom="2xl" topBorder>
      <Eyebrow
        opacity={seen ? 0.5 : 0}
        style={{
          marginBottom: 80,
          transform: seen ? 'translateY(0)' : 'translateY(20px)',
          transition: `all ${motion.durSlow} ease`
        }}>
        — Studio Statement
      </Eyebrow>
      <Heading level="display" style={{ maxWidth: '20ch' }}>
        {HEADING_PARTS.map((part, i) => (
          <Fragment key={i}>
            <span
              style={{
                display: 'inline',
                opacity: seen ? 1 : 0,
                transform: seen ? 'translateY(0)' : 'translateY(30px)',
                transition: `all ${motion.durSlow} ${motion.ease} ${i * 0.08}s`
              }}>
              {typeof part === 'string' ? part : <em style={{ fontWeight: 300 }}>{part.italic}</em>}
            </span>
          </Fragment>
        ))}
      </Heading>
      <Container maxWidth={1100} style={{ marginTop: 100 }}>
        <Grid
          cols="1fr 1fr"
          gap={80}
          style={{
            opacity: seen ? 1 : 0,
            transform: seen ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 1s ease 0.5s'
          }}>
          <p style={{ ...text.body, maxWidth: '40ch' }}>
            Founded in 2016 by Iris Wren, Laurel Leaf Design Studio is a London-based practice working across residential and small
            commercial commissions. Our approach is unhurried: we begin with the architecture, the light, and the way a household actually
            moves through a day.
          </p>
          <div>
            <Eyebrow opacity={0.5} style={{ marginBottom: 24 }}>
              Disciplines
            </Eyebrow>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 14 }}>
              {DISCIPLINES.map(s => (
                <li key={s} className="serif" style={{ fontSize: 22, fontWeight: 300, fontStyle: 'italic' }}>
                  — {s}
                </li>
              ))}
            </ul>
          </div>
        </Grid>
      </Container>
    </Section>
  );
}
