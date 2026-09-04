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
        // 400 deliberately: layout.tsx loads Cormorant at 300/400/500 only, so 600 silently fell back to 500.
        fontWeight: 400,
        textTransform: 'uppercase',
        lineHeight: 1.35
      }}>
      {/* Each half is unbreakable, the space between them is not. The whole lockup
          is ~380px at this size and tracking, so a blanket `nowrap` overflowed
          every container narrower than that — clipped outright on mobile, and on
          desktop it pinned the footer's first grid track to a 380px min-content
          floor and starved the other columns. "Laurel Leaf / Design Studio" is the
          lockup's own break; breaking inside either half is not. */}
      <span style={{ whiteSpace: 'nowrap' }}>Laurel Leaf</span> <span style={{ whiteSpace: 'nowrap' }}>Design Studio</span>
    </div>
  );
}
