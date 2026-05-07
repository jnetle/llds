import type { CSSProperties, ReactNode } from 'react';
import { text } from '@/lib/tokens';

type Level = 'display' | 'section' | 'card';

type HeadingProps = {
  /** Typography scale token. Drives default font-size / line-height / letter-spacing. */
  level: Level;
  /** Override the rendered tag. Defaults: display→h1, section→h2, card→h3. */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Apply Cormorant serif (matches the `.serif` utility). Default true. */
  serif?: boolean;
  italic?: boolean;
  style?: CSSProperties;
  className?: string;
  children: ReactNode;
};

const defaultTag: Record<Level, 'h1' | 'h2' | 'h3'> = {
  display: 'h1',
  section: 'h2',
  card: 'h3'
};

export function Heading({ level, as, serif = true, italic = false, style, className, children }: HeadingProps) {
  const Tag = as ?? defaultTag[level];
  const baseClass = serif ? 'serif' : '';
  const cls = [baseClass, className].filter(Boolean).join(' ') || undefined;

  return (
    <Tag
      className={cls}
      style={{
        ...text[level],
        fontStyle: italic ? 'italic' : undefined,
        textWrap: level === 'display' ? 'balance' : 'pretty',
        margin: 0,
        ...style
      }}>
      {children}
    </Tag>
  );
}
