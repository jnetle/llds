import type { CSSProperties } from 'react';

const bandLabelColStyle: CSSProperties = {
  position: 'sticky',
  top: 110,
  alignSelf: 'start'
};

const bandNumeralStyle: CSSProperties = { fontSize: 'clamp(80px, 9vw, 140px)' };

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
    <div style={bandLabelColStyle}>
      <div className="form-band-numeral" style={bandNumeralStyle}>
        {numeral}
      </div>
      <div className="form-band-label" style={bandLabelTextStyle}>
        {label}
      </div>
    </div>
  );
}
