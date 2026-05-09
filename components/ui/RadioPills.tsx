import { color } from '@/lib/tokens';

export type RadioPillsProps = {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
};

export function RadioPills({ options, value, onChange, hasError }: RadioPillsProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
      {options.map(opt => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={active}
            className="micro-sm"
            style={{
              padding: '10px 18px',
              borderRadius: 100,
              border: '1px solid ' + (active ? color.ink : hasError ? color.error : color.hairline),
              background: active ? color.ink : 'transparent',
              color: active ? color.bg : hasError ? color.error : color.ink,
              cursor: 'pointer',
              transition: 'all 0.25s'
            }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}
