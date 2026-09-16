import { ImageResponse } from 'next/og';
import { OG_CONTENT_TYPE, OG_SIZE, OgCard, ogFonts } from '@/lib/og';
import { PIECES, getPiece } from '@/lib/pieces';

export function generateStaticParams() {
  return PIECES.map(p => ({ slug: p.slug }));
}

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateImageMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const piece = getPiece(slug);
  return [{ id: 'card', size, contentType, alt: piece ? `${piece.name}, ${piece.brand}` : 'Laurel Leaf Design Studio' }];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const piece = getPiece(slug);

  return new ImageResponse(<OgCard eyebrow={piece?.category ?? 'Pieces'} title={piece?.name ?? 'Pieces'} footer={piece?.brand} />, {
    ...size,
    fonts: await ogFonts()
  });
}
