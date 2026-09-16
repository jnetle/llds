'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { requestPiece } from '@/app/pieces/actions';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Field } from '@/components/ui/Field';
import { Grid } from '@/components/ui/Grid';
import { Heading } from '@/components/ui/Heading';
import { pieceRequestSchema, type PieceRequestInput } from '@/lib/pieceRequestSchema';
import { color, space, text } from '@/lib/tokens';

/** Labels in one place, so the form and any future copy pass cannot disagree about what was asked. */
const LABELS: Record<Exclude<keyof PieceRequestInput, 'pieceSlug' | 'website'>, string> = {
  name: 'Your name',
  email: 'Email',
  phone: 'Phone (optional)',
  quantity: 'How many (optional)',
  deliverTo: 'Delivering to (optional)',
  notes: 'Anything else (optional)'
};

// Copied verbatim from app/inquire/page.tsx, comments included — `width`/`minWidth` are load-bearing: a bare <input>
// has an intrinsic min-content width of ~177px, which an `auto`-floored grid track must honour, so a two-up row can
// out-measure a phone and body's `overflow-x: clip` swallows the excess instead of scrolling it.
const inputStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${color.hairline}`,
  padding: '12px 0',
  fontSize: 17,
  color: color.ink,
  fontFamily: 'inherit',
  width: '100%',
  minWidth: 0,
  transition: 'border-color 0.3s'
};

// Standalone, not spread from inputStyle: its `borderBottom` longhand would be emitted after our `border` shorthand
// and silently strip the bottom border.
const textareaBaseStyle: CSSProperties = {
  background: 'transparent',
  border: `1px solid ${color.hairline}`,
  padding: '14px 16px',
  fontSize: 17,
  color: color.ink,
  fontFamily: 'inherit',
  width: '100%',
  minWidth: 0,
  transition: 'border-color 0.3s',
  resize: 'vertical',
  lineHeight: 1.6,
  minHeight: 110
};

const honeypotStyle: CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  width: 1,
  height: 1,
  opacity: 0,
  pointerEvents: 'none'
};

/**
 * The request form on a piece page. Six fields, two of them required — a visitor who has just seen a sconce in a
 * photograph is answering a question, not commissioning a house. The 34-question form at `/inquire` is the other
 * conversation, and asking it here would lose every one of these.
 *
 * Nothing about pricing is collected or shown. The studio replies with a quote; see app/pieces/actions.ts.
 */
export function PieceRequest({ slug, pieceName }: { slug: string; pieceName: string }) {
  // The address the request was filed under, held so the success panel can read it back. Load-bearing now that no
  // confirmation email goes out: a mistyped address used to bounce or simply not arrive, which told the visitor
  // something was wrong. With nothing sent, this panel is their only chance to notice the studio cannot reach them.
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<PieceRequestInput>({
    resolver: zodResolver(pieceRequestSchema),
    // One default per key, or react-hook-form treats the missing field as uncontrolled.
    defaultValues: { pieceSlug: slug, name: '', email: '', phone: '', quantity: '', deliverTo: '', notes: '', website: '' }
  });

  if (submittedEmail) {
    return (
      <div role="status" aria-live="polite" style={{ maxWidth: 560 }}>
        <Eyebrow style={{ marginBottom: space[4] }}>— Thank You</Eyebrow>
        <Heading level="section" style={{ marginBottom: space[4] }}>
          Your request is <span style={{ fontStyle: 'italic' }}>received</span>.
        </Heading>
        <p style={{ ...text.body, margin: 0 }}>
          We will follow up shortly about the {pieceName} — availability, lead time and pricing. Our reply will come to{' '}
          <span style={{ color: color.ink }}>{submittedEmail}</span>.
        </p>
      </div>
    );
  }

  const errBorder = (key: keyof PieceRequestInput): CSSProperties =>
    errors[key] ? { borderBottomColor: color.error, borderBottomWidth: 1.5 } : {};

  return (
    <form
      onSubmit={e => {
        void handleSubmit(async values => {
          setServerError(null);
          const result = await requestPiece(values);
          if (result.ok) {
            setSubmittedEmail(values.email);
          } else {
            setServerError(result.error);
          }
        })(e);
      }}
      style={{ display: 'grid', gap: space[5], maxWidth: 720 }}>
      {/* Which piece. Hidden rather than absent so it travels with the submission; the server re-resolves it and
          never trusts anything the client says *about* it. */}
      <input {...register('pieceSlug')} type="hidden" />
      <input {...register('website')} type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" style={honeypotStyle} />

      <Grid cols="1fr 1fr" gap={{ d: 32, m: 24 }}>
        <Field label={LABELS.name} required error={errors.name?.message}>
          <input {...register('name')} aria-invalid={!!errors.name} style={{ ...inputStyle, ...errBorder('name') }} />
        </Field>
        <Field label={LABELS.email} required error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            inputMode="email"
            aria-invalid={!!errors.email}
            style={{ ...inputStyle, ...errBorder('email') }}
          />
        </Field>
      </Grid>

      <Grid cols="1fr 1fr" gap={{ d: 32, m: 24 }}>
        <Field label={LABELS.phone} error={errors.phone?.message}>
          <input {...register('phone')} type="tel" inputMode="tel" style={{ ...inputStyle, ...errBorder('phone') }} />
        </Field>
        <Field label={LABELS.quantity} error={errors.quantity?.message}>
          <input {...register('quantity')} style={{ ...inputStyle, ...errBorder('quantity') }} />
        </Field>
      </Grid>

      <Field label={LABELS.deliverTo} error={errors.deliverTo?.message}>
        <input {...register('deliverTo')} placeholder="City and state is plenty" style={{ ...inputStyle, ...errBorder('deliverTo') }} />
      </Field>

      <Field label={LABELS.notes} error={errors.notes?.message}>
        <textarea {...register('notes')} rows={4} style={textareaBaseStyle} />
      </Field>

      <div style={{ display: 'grid', gap: space[3], justifyItems: 'start' }}>
        {serverError && (
          <p role="alert" className="serif" style={{ fontSize: 15, fontStyle: 'italic', color: color.error, margin: 0 }}>
            {serverError}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary micro w-full sm:w-auto"
          style={{ padding: '16px 40px', cursor: 'pointer' }}>
          {isSubmitting ? 'Sending…' : 'Request this piece'}
        </button>
        <p style={{ ...text.bodySm, fontSize: 13, margin: 0, opacity: 0.75 }}>
          No payment is taken here. We will reply with availability, lead time and a quote.
        </p>
      </div>
    </form>
  );
}
