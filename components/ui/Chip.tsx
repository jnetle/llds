import { color } from '@/lib/tokens';

export type ChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export function Chip({ label, active, onClick, disabled }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className="micro-sm"
      style={{
        padding: '10px 18px',
        borderRadius: 100,
        border: '1px solid ' + (active ? color.ink : color.hairline),
        background: active ? color.ink : 'transparent',
        color: active ? color.bg : color.ink,
        opacity: disabled && !active ? 0.35 : 1,
        cursor: disabled && !active ? 'not-allowed' : 'pointer',
        transition: 'all 0.25s'
      }}>
      {label}
    </button>
  );
}
