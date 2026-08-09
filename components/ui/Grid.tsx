import type { CSSProperties, ElementType, HTMLAttributes, ReactNode, Ref } from 'react';

/**
 * Responsive value: either a single value (with `cols` strings auto-collapsing
 * to `'1fr'` at ≤1024px), or an object `{ d, t?, m }` for explicit per-tier
 * control. When `t` is omitted it falls back to `m`, matching the historical
 * `useCols`/`useCompact(1024)` pattern where tablet is treated as compact.
 */
type Tiered<T> = T | { d: T; t?: T; m: T };

type GridProps = HTMLAttributes<HTMLElement> & {
  cols: Tiered<string>;
  gap?: Tiered<number | string>;
  rowGap?: Tiered<number | string>;
  columnGap?: Tiered<number | string>;
  alignItems?: CSSProperties['alignItems'];
  as?: 'div' | 'section' | 'article' | 'ul' | 'ol';
  ref?: Ref<HTMLElement>;
  children: ReactNode;
};

type Tiers<T> = { d: T; t: T; m: T };

function spreadCols(value: Tiered<string>): Tiers<string> {
  // Bare string: desktop gets the tracks, everything narrower collapses to one
  // column — the old `useCols` behaviour.
  if (typeof value === 'string') return { d: value, t: '1fr', m: '1fr' };
  return { d: value.d, t: value.t ?? value.m, m: value.m };
}

function spreadSize(value: Tiered<number | string> | undefined): Tiers<string | undefined> {
  if (value === undefined) return { d: undefined, t: undefined, m: undefined };
  // Bare value applies at every tier. Numbers are px, matching how React would
  // have serialised them when this was an inline style.
  const px = (v: number | string) => (typeof v === 'number' ? `${v}px` : v);
  if (typeof value !== 'object') return { d: px(value), t: px(value), m: px(value) };
  return { d: px(value.d), t: px(value.t ?? value.m), m: px(value.m) };
}

/**
 * Grid tracks and gaps are emitted as per-tier custom properties and selected
 * by the `.grid-tiers` media queries in app/globals.css, rather than picked in
 * JS. Keeping the breakpoint in CSS is what makes the server-rendered markup
 * correct at every width — reading it in JS meant first paint was always the
 * desktop tier, then reflowed on hydrate.
 */
export function Grid({ cols, gap, rowGap, columnGap, alignItems, as = 'div', ref, style, className, children, ...rest }: GridProps) {
  const Tag = as as ElementType;

  const c = spreadCols(cols);
  const g = spreadSize(gap);
  const row = spreadSize(rowGap);
  const col = spreadSize(columnGap);

  const vars: Record<string, string | undefined> = {
    '--cols-d': c.d,
    '--cols-t': c.t,
    '--cols-m': c.m,
    // rowGap/columnGap override gap on their own axis, as the inline-style
    // version did by declaring `gap` first and the axis-specific props after.
    '--row-d': row.d ?? g.d,
    '--row-t': row.t ?? g.t,
    '--row-m': row.m ?? g.m,
    '--col-d': col.d ?? g.d,
    '--col-t': col.t ?? g.t,
    '--col-m': col.m ?? g.m
  };

  return (
    <Tag
      ref={ref}
      className={['grid-tiers', className].filter(Boolean).join(' ')}
      style={{ alignItems, ...vars, ...style } as CSSProperties}
      {...rest}>
      {children}
    </Tag>
  );
}
