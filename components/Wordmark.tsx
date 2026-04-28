type WordmarkProps = {
  color?: string;
  className?: string;
};

export function Wordmark({ color = 'currentColor', className }: WordmarkProps) {
  return (
    <div
      className={`serif ${className ?? ''}`}
      style={{
        color,
        fontSize: 18,
        letterSpacing: '0.22em',
        fontWeight: 300,
        textTransform: 'uppercase',
        lineHeight: 1,
        whiteSpace: 'nowrap'
      }}>
      Laurel Leaf <span style={{ letterSpacing: '0.22em' }}>Design Studio</span>
    </div>
  );
}
