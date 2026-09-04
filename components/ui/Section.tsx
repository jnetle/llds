import type { ElementType, HTMLAttributes, Ref } from 'react';
import type { SectionPad } from '@/lib/tokens';

// Mirrors `sectionPadY` in lib/tokens.ts, mobile as the base and desktop behind `sm:`. These MUST stay complete
// literal strings — Tailwind scans source text, so an interpolated `pt-[${n}px]` is never emitted and silently
// renders as no padding. scripts/check-css.mjs asserts they stay in step with the token table.
const PAD_TOP: Record<SectionPad, string> = {
  none: 'pt-0',
  xxs: 'pt-[24px] sm:pt-[60px]',
  xs: 'pt-[32px] sm:pt-[80px]',
  sm: 'pt-[48px] sm:pt-[120px]',
  md: 'pt-[56px] sm:pt-[140px]',
  lg: 'pt-[64px] sm:pt-[160px]',
  xl: 'pt-[72px] sm:pt-[180px]',
  '2xl': 'pt-[80px] sm:pt-[200px]'
};

const PAD_BOTTOM: Record<SectionPad, string> = {
  none: 'pb-0',
  xxs: 'pb-[24px] sm:pb-[60px]',
  xs: 'pb-[32px] sm:pb-[80px]',
  sm: 'pb-[48px] sm:pb-[120px]',
  md: 'pb-[56px] sm:pb-[140px]',
  lg: 'pb-[64px] sm:pb-[160px]',
  xl: 'pb-[72px] sm:pb-[180px]',
  '2xl': 'pb-[80px] sm:pb-[200px]'
};

// Horizontal page rhythm — mirrors `gutter` in lib/tokens.ts.
const GUTTER = 'px-[24px] sm:px-[8vw]';

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
  className,
  children,
  ...rest
}: SectionProps) {
  // With a polymorphic `as` union, JSX wants ref's type to satisfy the intersection of every ref shape — which is
  // empty. Casting to ElementType lets the ref through; ref is always HTMLElement at runtime.
  const Tag = as as ElementType;

  const classes = [GUTTER, PAD_TOP[padTop ?? padY], PAD_BOTTOM[padBottom ?? padY], topBorder ? 'border-t border-hairline' : null, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref} className={classes} {...rest}>
      {children}
    </Tag>
  );
}
