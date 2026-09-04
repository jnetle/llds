// Design tokens. CSS-side mirrors live in app/globals.css (`:root`); reach for var(--…)
// directly only in plain CSS or className contexts.

import type { CSSProperties } from 'react';

// ── Brand palette ─────────────────────────────────────────────────────────────
// The 2026 brand book verbatim. Prefer the semantic `color` tokens below; reach in here
// only for a deliberate accent no semantic token covers.
export const brand = {
  saddleLeather: 'var(--saddle-leather)', // #8a5a32
  navyInk: 'var(--navy-ink)', // #0f1a2b
  heritageGreen: 'var(--heritage-green)', // #1f3a32
  charlestonSage: 'var(--charleston-sage)', // #7c8e76
  modernTan: 'var(--modern-tan)', // #e6dcc7
  boneWhite: 'var(--bone-white)', // #f4f1ea
  warmStone: 'var(--warm-stone)', // #a89f96
  titaniumWhite: 'var(--titanium-white)', // #ffffff
  midnightBlack: 'var(--midnight-black)' // #000000
} as const;

// ── Color ─────────────────────────────────────────────────────────────────────
// Semantic roles, resolving through CSS vars to `brand` above, so a palette change is one file.
export const color = {
  bg: 'var(--bg)', // bone white
  ink: 'var(--ink)', // heritage green
  inkSoft: 'var(--ink-soft)',
  error: 'var(--ink-error)', // functional, outside the brand palette
  hairline: 'var(--hairline)',
  divider: 'var(--divider-color)',
  navy: 'var(--navy)', // navy ink
  headerFill: 'var(--header-fill)' // warm stone
} as const;

// ── Spacing (px) ──────────────────────────────────────────────────────────────
export const space = {
  1: 4,
  2: 8,
  3: 14,
  4: 22,
  5: 32,
  6: 48,
  7: 60,
  8: 80,
  9: 100,
  10: 140,
  11: 180
} as const;

// ── Section vertical padding (px) ─────────────────────────────────────────────
// `d` = desktop/tablet (>600px), `m` = mobile (≤600px). <Section> restates this table as
// literal Tailwind class strings because Tailwind scans source text; scripts/check-css.mjs
// fails the build if the two drift. Edit them together.
export const sectionPadY = {
  none: { d: 0, m: 0 },
  xxs: { d: 60, m: 24 },
  xs: { d: 80, m: 32 },
  sm: { d: 120, m: 48 },
  md: { d: 140, m: 56 },
  lg: { d: 160, m: 64 },
  xl: { d: 180, m: 72 },
  '2xl': { d: 200, m: 80 }
} as const;

export type SectionPad = keyof typeof sectionPadY;

// Horizontal page rhythm.
export const gutter = { d: '8vw', m: '24px' } as const;

// ── Typography scale ──────────────────────────────────────────────────────────
// display → hero h1, section → h2, card → h3, body/bodySm → copy. Eyebrows go through
// <Eyebrow> and the `.micro` classes instead.
export const text: Record<'display' | 'section' | 'card' | 'body' | 'bodySm', CSSProperties> = {
  display: {
    fontSize: 'clamp(44px, 5.2vw, 84px)',
    lineHeight: 1.02,
    letterSpacing: '-0.012em',
    fontWeight: 300
  },
  section: {
    fontSize: 'clamp(30px, 3vw, 44px)',
    lineHeight: 1.2,
    letterSpacing: '-0.005em',
    fontWeight: 300
  },
  card: {
    fontSize: 26,
    lineHeight: 1.2,
    fontWeight: 300
  },
  body: {
    fontSize: 17,
    lineHeight: 1.7,
    color: color.inkSoft
  },
  bodySm: {
    fontSize: 15,
    lineHeight: 1.7,
    color: color.inkSoft
  }
};

// ── Motion ────────────────────────────────────────────────────────────────────
export const motion = {
  ease: 'var(--ease-elegant)',
  durFast: 'var(--dur-fast)',
  durMed: 'var(--dur-med)',
  durSlow: 'var(--dur-slow)',
  durXSlow: 'var(--dur-xslow)'
} as const;
