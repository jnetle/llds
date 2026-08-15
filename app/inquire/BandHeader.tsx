import type { CSSProperties } from 'react';

// The 52px floor is a mobile concern: once the rail stacks (≤1024px) every band
// prints its numeral above the fields, so a large floor is ~300px of dead scroll
// across the 11 bands. Desktop is untouched — 9vw clears 80px above 890px anyway.
const bandNumeralStyle: CSSProperties = { fontSize: 'clamp(52px, 9vw, 140px)' };

const bandLabelTextStyle: CSSProperties = {
  fontFamily: 'var(--font-cormorant), Georgia, serif',
  fontWeight: 500,
  fontSize: 13,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  marginTop: 22
};

export function BandHeader({ numeral, label }: { numeral: string; label: string }) {
  return (
    <div className="form-band-header">
      <div className="form-band-numeral" style={bandNumeralStyle}>
        {numeral}
      </div>
      <div className="form-band-label" style={bandLabelTextStyle}>
        {label}
      </div>
    </div>
  );
}
