import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { piecesByMaker } from '@/lib/pieces';
import { breadcrumbSchema } from '@/lib/schema';
import { pageOpenGraph } from '@/lib/seo';
import { color, space, text } from '@/lib/tokens';

export const metadata: Metadata = {
  title: 'Pieces',
  description:
    'Fixtures, lighting and furniture specified by Laurel Leaf Design Studio, and the makers behind them. Available to order through the studio.',
  alternates: { canonical: '/pieces' },
  openGraph: pageOpenGraph({
    title: 'Pieces — Laurel Leaf Design Studio',
    description: 'Fixtures, lighting and furniture specified by the studio, and the makers behind them.',
    path: '/pieces'
  })
};

/**
 * The index behind the credit lines. Deliberately modest — a list grouped by maker, not a designed grid.
 *
 * Almost nobody arrives here: a reader meets a piece as a caption under a photograph and follows the brand name
 * straight to its page. This exists so those pages have a parent for breadcrumbs and the sitemap, and as the surface
 * that can rank for a maker's name alongside the studio's. It is not a shop, and there is no nav entry pointing at
 * it — see the note in AGENTS.md.
 */
export default function PiecesPage() {
  const makers = piecesByMaker();

  return (
    <>
      <JsonLd data={breadcrumbSchema([['Pieces', '/pieces']])} />

      {/* Clearance for the fixed header, as on /projects. */}
      <div className="h-[96px] lg:h-[120px]" aria-hidden />

      <Section padTop="none" padBottom="sm">
        <Container maxWidth={1100}>
          <Eyebrow style={{ marginBottom: space[4] }}>— Sourced</Eyebrow>
          <Heading level="display" style={{ fontSize: 'clamp(40px, 5vw, 76px)', marginBottom: space[5] }}>
            Pieces and their <span style={{ fontStyle: 'italic' }}>makers</span>.
          </Heading>
          <p style={{ ...text.body, maxWidth: '58ch', margin: 0 }}>
            Objects the studio has specified and installed — credited where they appear in a project, and available to order through us.
            Nothing here is sold from this page; tell us what you are after and we will come back with availability, lead time and a quote.
          </p>
        </Container>
      </Section>

      <Section padTop="none" padBottom="lg">
        <Container maxWidth={1100}>
          {makers.length === 0 ? (
            <p style={{ ...text.body, margin: 0, fontStyle: 'italic' }}>Nothing credited yet — the first pieces are being written up.</p>
          ) : (
            <div style={{ display: 'grid', gap: space[7] }}>
              {makers.map(maker => (
                <section key={maker.brand} style={{ borderTop: `1px solid ${color.hairline}`, paddingTop: space[4] }}>
                  <Eyebrow style={{ marginBottom: space[4] }}>{maker.brand}</Eyebrow>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: space[3] }}>
                    {maker.pieces.map(piece => (
                      <li key={piece.slug}>
                        <Link href={`/pieces/${piece.slug}`} className="serif" style={{ fontSize: 22 }}>
                          {piece.name}
                        </Link>
                        <span style={{ ...text.bodySm, marginLeft: space[3] }}>{piece.category}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
