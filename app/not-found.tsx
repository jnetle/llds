import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { color, space, text } from '@/lib/tokens';

export const metadata: Metadata = {
  // `absolute` opts out of the root title template — a 404 should not read as a page
  // the site offers, and appending the studio name would make it look like one.
  title: { absolute: 'Page not found — Laurel Leaf Design Studio' },
  // Explicitly null, not omitted: the root sets `canonical: '/'`, and metadata inherits —
  // so without this a 404 declares itself a duplicate of the home page, which is how soft
  // 404s get folded into `/` in the index. Next already emits its own noindex here, so
  // there is no `robots` key: a second one would just duplicate the tag.
  alternates: { canonical: null }
};

export default function NotFound() {
  return (
    <Section padY="xl" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth={900} align="left">
        <Eyebrow size="md">404 — Not Found</Eyebrow>

        <h1
          className="serif"
          style={{
            fontSize: 'clamp(48px, 7vw, 112px)',
            fontWeight: 300,
            lineHeight: 0.95,
            letterSpacing: '-0.018em',
            textTransform: 'uppercase',
            textWrap: 'balance',
            margin: `${space[5]}px 0 0 0`
          }}>
          This page is no longer in the plan.
        </h1>

        <p style={{ ...text.body, color: color.inkSoft, marginTop: space[5], maxWidth: '46ch' }}>
          The page you were looking for has moved or never existed.
        </p>

        <div style={{ marginTop: space[7], display: 'inline-flex', alignItems: 'center', gap: 14 }}>
          <span aria-hidden style={{ width: 36, height: 1, background: 'currentColor', display: 'inline-block' }} />
          <Link href="/" className="micro nav-link" style={{ color: color.ink, position: 'relative', textDecoration: 'none' }}>
            Return home
            <span className="nav-underline" />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
