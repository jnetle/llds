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
        // 400 deliberately. This was 600, but layout.tsx loads Cormorant at
        // 300/400/500 only, so 600 never rendered — the browser fell back to the
        // nearest cut, 500. 400 states the intent instead of relying on that.
        fontWeight: 400,
        textTransform: 'uppercase',
        lineHeight: 1,
        whiteSpace: 'nowrap'
      }}>
      Laurel Leaf <span style={{ letterSpacing: '0.22em' }}>Design Studio</span>
    </div>
  );
}
