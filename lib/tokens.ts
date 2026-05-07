// Design tokens — single source of truth for color, spacing, typography, motion.
// CSS-side mirrors live in app/globals.css (`:root`). Prefer importing from here
// in components; reach for var(--…) directly only in plain CSS or className contexts.

import type { CSSProperties } from 'react';

// ── Color ─────────────────────────────────────────────────────────────────────
// All values resolve through CSS vars so theme changes are one-file.
export const color = {
  bg: 'var(--bg)',
  ink: 'var(--ink)',
  inkSoft: 'var(--ink-soft)',
  hairline: 'var(--hairline)',
  divider: 'var(--divider-color)'
} as const;

// ── Spacing (px) ──────────────────────────────────────────────────────────────
// Use as raw numbers in inline styles: `padding: space[5]` etc.
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
// `d` = desktop / tablet (>600px), `m` = mobile (≤600px). <Section> reads both
// directly via useCompact(600) and emits them inline, so the mobile-collapse
// CSS rules in app/globals.css are no longer needed for Section-driven pages.
// (They remain as a fallback for sections that haven't been migrated yet.)
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

// Horizontal page rhythm. Mobile tightens to 24px to match the previous
// behavior of the `section[style*='8vw']` rule.
export const gutter = { d: '8vw', m: '24px' } as const;

// ── Typography scale ──────────────────────────────────────────────────────────
// `display`  — page hero h1
// `section`  — section h2
// `card`     — block / list-item h3
// `body`     — long-form copy (17/1.7)
// `bodySm`   — caption / dense copy (15/1.7)
// Eyebrows use the existing `.micro` / `.micro-sm` classes via <Eyebrow>.
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
// String values resolve to CSS vars; safe to compose into transition declarations.
export const motion = {
  ease: 'var(--ease-elegant)',
  durFast: 'var(--dur-fast)',
  durMed: 'var(--dur-med)',
  durSlow: 'var(--dur-slow)',
  durXSlow: 'var(--dur-xslow)'
} as const;
