import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PieceDetail } from '@/components/pieces/PieceDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { PIECES, getPiece } from '@/lib/pieces';
import { framesCreditingPiece } from '@/lib/projects';
import { breadcrumbSchema, pieceSchema } from '@/lib/schema';
import { pageOpenGraph } from '@/lib/seo';

export function generateStaticParams() {
  return PIECES.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const piece = getPiece(slug);
  if (!piece) return {};

  const url = `/pieces/${piece.slug}`;

  return {
    // Bare — the root layout's template appends the studio name, and repeating it here would double it.
    title: `${piece.name}, ${piece.brand}`,
    description: piece.summary,
    alternates: { canonical: url },
    openGraph: pageOpenGraph({
      title: `${piece.name} — Laurel Leaf Design Studio`,
      description: piece.summary,
      path: url,
      type: 'article',
      hasOwnImage: true
    })
  };
}

export default async function PiecePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const piece = getPiece(slug);
  if (!piece) notFound();

  // Resolved here rather than inside `pieceSchema`, which must not import lib/projects.ts — the dependency between
  // the two data modules runs one way.
  const images = framesCreditingPiece(piece.slug).map(({ image }) => image.src);

  return (
    <>
      <JsonLd
        data={[
          pieceSchema(piece, images),
          breadcrumbSchema([
            ['Pieces', '/pieces'],
            [piece.name, `/pieces/${piece.slug}`]
          ])
        ]}
      />
      <PieceDetail piece={piece} />
    </>
  );
}
