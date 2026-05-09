import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { color } from '@/lib/tokens';

export type FieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  /** Caller-facing field name. Not consumed inside Field today; kept so callers can
   *  pair `name` with their own ref/error lookup without prop-name drift. */
  name?: string;
  /** Forward the rendered <label> to the consumer (for scroll-to-field, focus management). */
  registerRef?: (el: HTMLLabelElement | null) => void;
  children: ReactNode;
};

export function Field({ label, required, error, registerRef, children }: FieldProps) {
  return (
    <label ref={registerRef} style={{ display: 'grid', gap: 10, scrollMarginTop: 140 }}>
      <Eyebrow as="span" size="sm" opacity={0.6} style={{ color: error ? color.error : undefined, transition: 'color 0.3s' }}>
        {label}
        {required && <span style={{ marginLeft: 6, opacity: error ? 0.9 : 0.5 }}>*</span>}
      </Eyebrow>
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
