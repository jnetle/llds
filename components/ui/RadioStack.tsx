import { color } from '@/lib/tokens';

export type RadioStackProps = {
  name: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
};

export function RadioStack({ name, options, value, onChange, hasError }: RadioStackProps) {
  return (
    <div style={{ display: 'grid', gap: 14, marginTop: 8 }}>
      {options.map(opt => (
        <label key={opt} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer', fontSize: 16, lineHeight: 1.5 }}>
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            style={{ marginTop: 5, accentColor: hasError ? color.error : color.ink }}
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}
