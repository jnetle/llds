import { ImageResponse } from 'next/og';
import { OG_CONTENT_TYPE, OG_SIZE, OgCard, ogFonts } from '@/lib/og';
import { SITE } from '@/lib/site';

// The site-wide share card. Any route without its own opengraph-image inherits this one.
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(<OgCard eyebrow="Interior Design · Augusta · Aiken" title={SITE.tagline} />, {
    ...size,
    fonts: await ogFonts()
  });
}
