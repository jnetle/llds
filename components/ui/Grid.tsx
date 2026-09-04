import type { CSSProperties, ElementType, HTMLAttributes, ReactNode, Ref } from 'react';

/** A single value (with `cols` strings collapsing to `'1fr'` at ≤1024px), or `{ d, t?, m }`; `t` falls back to `m`. */
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
  // Bare string: desktop gets the tracks, everything narrower collapses to one column.
  if (typeof value === 'string') return { d: value, t: '1fr', m: '1fr' };
  return { d: value.d, t: value.t ?? value.m, m: value.m };
}

function spreadSize(value: Tiered<number | string> | undefined): Tiers<string | undefined> {
  if (value === undefined) return { d: undefined, t: undefined, m: undefined };
  // Bare value applies at every tier; numbers are px.
  const px = (v: number | string) => (typeof v === 'number' ? `${v}px` : v);
  if (typeof value !== 'object') return { d: px(value), t: px(value), m: px(value) };
  return { d: px(value.d), t: px(value.t ?? value.m), m: px(value.m) };
}

/**
 * Tracks and gaps go out as per-tier custom properties, selected by the `.grid-tiers` media queries in globals.css.
 * Keeping the breakpoint in CSS is what makes the server-rendered markup correct at every width — picking it in JS
 * meant first paint was always the desktop tier, then reflowed on hydrate.
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
    // rowGap/columnGap override gap on their own axis.
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
