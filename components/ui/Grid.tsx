'use client';

import type { CSSProperties, ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import { useCompact } from '@/hooks/useCompact';

/**
 * Responsive value: either a single value (with `cols` strings auto-collapsing
 * to `'1fr'` at ≤1024px), or an object `{ d, t?, m }` for explicit per-tier
 * control. When `t` is omitted it falls back to `m`, matching the existing
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

function pickCols(value: Tiered<string>, isMobile: boolean, isTablet: boolean): string {
  if (typeof value === 'string') return isTablet ? '1fr' : value;
  return isMobile ? value.m : isTablet ? (value.t ?? value.m) : value.d;
}

function pickSize<T extends number | string>(value: Tiered<T> | undefined, isMobile: boolean, isTablet: boolean): T | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'object') return value;
  return isMobile ? value.m : isTablet ? (value.t ?? value.m) : value.d;
}

export function Grid({ cols, gap, rowGap, columnGap, alignItems, as = 'div', ref, style, className, children, ...rest }: GridProps) {
  const isMobile = useCompact(600);
  const isTablet = useCompact(1024);
  const Tag = as as ElementType;

  const gapValue = pickSize(gap, isMobile, isTablet);
  const rowGapValue = pickSize(rowGap, isMobile, isTablet);
  const columnGapValue = pickSize(columnGap, isMobile, isTablet);

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: pickCols(cols, isMobile, isTablet),
    alignItems
  };
  if (gapValue !== undefined) gridStyle.gap = gapValue;
  if (rowGapValue !== undefined) gridStyle.rowGap = rowGapValue;
  if (columnGapValue !== undefined) gridStyle.columnGap = columnGapValue;

  return (
    <Tag ref={ref} className={className} style={{ ...gridStyle, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
