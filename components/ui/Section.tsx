'use client';

import type { ElementType, HTMLAttributes, Ref } from 'react';
import { useCompact } from '@/hooks/useCompact';
import { gutter, sectionPadY, type SectionPad } from '@/lib/tokens';

type SectionProps = HTMLAttributes<HTMLElement> & {
  /** Vertical padding preset applied to top + bottom. Default `lg`. */
  padY?: SectionPad;
  /** Override top vertical padding. Falls back to `padY`. */
  padTop?: SectionPad;
  /** Override bottom vertical padding. Falls back to `padY`. */
  padBottom?: SectionPad;
  /** Render a 1px hairline divider above the section. */
  topBorder?: boolean;
  as?: 'section' | 'div' | 'article' | 'header' | 'footer' | 'form';
  /** Forwarded to the underlying element. Use for IntersectionObserver / scroll-reveal hooks. */
  ref?: Ref<HTMLElement>;
};

export function Section({
  padY = 'lg',
  padTop,
  padBottom,
  topBorder = false,
  as = 'section',
  ref,
  style,
  className,
  children,
  ...rest
}: SectionProps) {
  const isMobile = useCompact(600);
  const key = isMobile ? 'm' : 'd';
  const top = sectionPadY[padTop ?? padY][key];
  const bottom = sectionPadY[padBottom ?? padY][key];
  const gut = gutter[key];
  const padding = top === bottom ? `${top}px ${gut}` : `${top}px ${gut} ${bottom}px`;

  // ElementType escape hatch: with a polymorphic `as` union spanning multiple
  // HTML element types, JSX wants ref's type to satisfy the intersection of
  // every ref shape — which is empty. Casting Tag to ElementType lets the
  // ref pass through; runtime safety is fine since ref is always HTMLElement.
  const Tag = as as ElementType;

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        padding,
        borderTop: topBorder ? '1px solid var(--hairline)' : undefined,
        ...style
      }}
      {...rest}>
      {children}
    </Tag>
  );
}
