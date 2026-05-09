import type { ReactNode } from 'react';
import { color } from '@/lib/tokens';

export type FieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  name?: string;
  children: ReactNode;
  registerRef?: (el: HTMLLabelElement | null) => void;
};

export function Field({ label, required, error, children, registerRef }: FieldProps) {
  return (
    <label ref={registerRef} style={{ display: 'grid', gap: 10, scrollMarginTop: 140 }}>
      <span
        className="micro-sm"
        style={{
          opacity: 0.6,
          color: error ? color.error : undefined,
          transition: 'color 0.3s'
        }}>
        {label}
        {required && <span style={{ marginLeft: 6, opacity: error ? 0.9 : 0.5 }}>*</span>}
      </span>
      {children}
      {error && (
        <span
          className="serif"
          style={{
            fontSize: 14,
            fontStyle: 'italic',
            fontWeight: 300,
            color: color.error,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'errorIn 0.35s cubic-bezier(.22,.61,.36,1)'
          }}>
          <span aria-hidden="true" style={{ display: 'inline-block', width: 14, height: 1, background: color.error }} />
          {error}
        </span>
      )}
    </label>
  );
}
