import type { CSSProperties, ReactNode } from 'react';

type EyebrowProps = {
  /** Tracking variant. `md` = `.micro` (11px / 0.22em), `sm` = `.micro-sm` (10px / 0.28em). */
  size?: 'sm' | 'md';
  /** Text opacity. The studio uses 0.5–0.55 for muted eyebrows; 1 for full ink. */
  opacity?: number;
  as?: 'div' | 'span' | 'p';
  style?: CSSProperties;
  className?: string;
  children: ReactNode;
};

export function Eyebrow({ size = 'md', opacity = 0.55, as: Tag = 'div', style, className, children }: EyebrowProps) {
  const baseClass = size === 'sm' ? 'micro-sm' : 'micro';
  const cls = className ? `${baseClass} ${className}` : baseClass;
  return (
    <Tag className={cls} style={{ opacity, ...style }}>
      {children}
    </Tag>
  );
}
