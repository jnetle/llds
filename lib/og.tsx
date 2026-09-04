import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ReactElement } from 'react';

/**
 * Shared pieces for the `opengraph-image` routes. Satori has no CSSOM, so brand hexes are literal — it cannot
 * dereference `var(--bone-white)` — and it supports only a CSS subset: flexbox but not grid, and every element with
 * more than one child needs an explicit `display: flex`.
 *
 * Fonts are read from disk, never fetched. Nothing imports the files, so `next.config.ts` must list them under
 * `outputFileTracingIncludes` for both OG routes; getting that wrong fails only on Vercel, where the route 500s.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const BONE_WHITE = '#f4f1ea';
const HERITAGE_GREEN = '#1f3a32';
const SADDLE_LEATHER = '#8a5a32';

const fontDir = join(process.cwd(), 'lib', 'pdf', 'fonts');

export const ogFonts = async () => {
  const [cormorant, inter] = await Promise.all([
    readFile(join(fontDir, 'CormorantGaramond-Light.ttf')),
    readFile(join(fontDir, 'Inter-Regular.ttf'))
  ]);

  return [
    { name: 'Cormorant', data: cormorant, style: 'normal' as const, weight: 300 as const },
    { name: 'Inter', data: inter, style: 'normal' as const, weight: 400 as const }
  ];
};

/** The shared card: eyebrow, serif headline, rule — the pages' own vocabulary at poster scale. */
export function OgCard({ eyebrow, title, footer }: { eyebrow: string; title: string; footer?: string }): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: BONE_WHITE,
        color: HERITAGE_GREEN,
        padding: '80px 90px',
        fontFamily: 'Inter'
      }}>
      <div style={{ display: 'flex', fontSize: 22, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.55 }}>{eyebrow}</div>

      <div
        style={{
          display: 'flex',
          fontFamily: 'Cormorant',
          fontSize: title.length > 34 ? 84 : 108,
          lineHeight: 1.04,
          letterSpacing: '-0.015em'
        }}>
        {title}
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', width: 84, height: 2, background: SADDLE_LEATHER, marginRight: 28 }} />
        <div style={{ display: 'flex', fontSize: 24, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.7 }}>
          {footer ?? 'Laurel Leaf Design Studio'}
        </div>
      </div>
    </div>
  );
}
