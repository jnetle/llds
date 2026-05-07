import type { CSSProperties, ReactNode } from 'react';

type ContainerProps = {
  /** Max content width. Number → px, string passes through (`'58ch'`, `'100%'`). */
  maxWidth?: number | string;
  /** Horizontal alignment within the parent. Default `left`. */
  align?: 'left' | 'center';
  style?: CSSProperties;
  className?: string;
  children: ReactNode;
};

export function Container({ maxWidth = 1100, align = 'left', style, className, children }: ContainerProps) {
  return (
    <div
      className={className}
      style={{
        maxWidth,
        marginLeft: align === 'center' ? 'auto' : undefined,
        marginRight: align === 'center' ? 'auto' : undefined,
        ...style
      }}>
      {children}
    </div>
  );
}
