import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { color, space, text } from '@/lib/tokens';

export const metadata = {
  title: 'Page not found · Laurel Leaf Design Studio'
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
