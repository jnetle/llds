'use client';

import * as React from 'react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { ShowWhen } from './ShowWhen';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Heading';
import { Grid } from '@/components/ui/Grid';
import { Field } from '@/components/ui/Field';
import { Chip } from '@/components/ui/Chip';
import { RadioPills } from '@/components/ui/RadioPills';
import { RadioStack } from '@/components/ui/RadioStack';
import { BandHeader } from './BandHeader';
import { color, text } from '@/lib/tokens';
import {
  inquirySchema,
  type InquiryInput,
  PROJECT_TYPES,
  AREAS,
  BUILDER_OPTIONS,
  PLANS_OPTIONS,
  BEGIN_TIMES,
  COMPLETION_TIMES,
  YES_NO,
  INVESTMENT_RANGES,
  DESIGN_BUDGET_OPTIONS,
  DESIGN_INVESTMENT_OPTIONS,
  BUILDER_APPROACH_OPTIONS,
  DESIGN_SUPPORT_OPTIONS,
  DECISION_MAKER_OPTIONS,
  DECISION_COMFORT_OPTIONS,
  OPEN_TO_RECS_OPTIONS,
  INVOLVEMENT_OPTIONS,
  CHANGES_APPROACH_OPTIONS,
  PRIORITIES,
  PRIORITIES_MAX,
  STRUCTURED_COMM_OPTIONS
} from '@/lib/inquirySchema';
import { QUESTIONS } from '@/lib/inquiryQuestions';
import { submitInquiry } from './actions';

// `width`/`minWidth` are load-bearing: a bare <input> has an intrinsic min-content width of ~177px, which an
// `auto`-floored grid track must honour — so a two-up row can out-measure a phone, and body's `overflow-x: clip`
// swallows the excess instead of scrolling it.
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

// Standalone, not spread from inputStyle: its `borderBottom` longhand would be emitted after our `border`
// shorthand and silently strip the bottom border.
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
  lineHeight: 1.6
};

const honeypotStyle: CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  width: 1,
  height: 1,
  opacity: 0,
  pointerEvents: 'none'
};

// One horizontal rhythm for the whole page, so hero, bands and submit row agree at every width. Below ~1666px the
// gutter term wins and reproduces the site's standard inset; above it the cap engages and the form centres.
const pageColumnStyle: CSSProperties = {
  width: 'min(1400px, calc(100% - 2 * var(--gutter)))',
  marginInline: 'auto'
};

const fieldsetStyle: CSSProperties = {
  display: 'grid',
  gap: 28,
  border: 'none',
  padding: 0,
  margin: 0,
  minWidth: 0
};

/**
 /**
  * One numbered band: sticky numeral rail beside its fieldset, collapsing to one column at ≤1024px via a <Grid> tier
  * rather than a `useCompact` read, so the server-rendered markup is already correct. Padding is bespoke (the
  * <Section> presets have no 64/72 step), hence literal Tailwind classes.
  */
function FormBand({ numeral, label, children }: { numeral: string; label: string; children: ReactNode }) {
  return (
    <Grid
      as="section"
      className="form-band pt-[36px] pb-[40px] sm:pt-[64px] sm:pb-[72px]"
      cols="minmax(220px, 280px) minmax(0, 1fr)"
      gap={{ d: 80, m: 24 }}
      alignItems="start">
      <BandHeader numeral={numeral} label={label} />
      <fieldset style={fieldsetStyle}>{children}</fieldset>
    </Grid>
  );
}

// Mirror of every field in inquirySchema — useForm needs an explicit default per key, or react-hook-form treats the
// missing field as uncontrolled.
const defaultValues: InquiryInput = {
  name: '',
  email: '',
  phone: '',
  address: '',
  projectType: [],
  projectTypeOther: '',
  areas: [],
  size: '',
  description: '',
  builder: '',
  builderName: '',
  plans: '',
  beginTime: '',
  completion: '',
  deadlines: '',
  builtBefore: '',
  builtBeforeNote: '',
  workedDesigner: '',
  workedDesignerNote: '',
  investment: '',
  designBudgetAllocated: '',
  designInvestment: '',
  builderApproach: '',
  designSupport: '',
  decisionMaker: '',
  decisionComfort: '',
  openToRecs: '',
  involvement: '',
  changesApproach: '',
  style: '',
  priorities: [],
  structuredComm: '',
  anythingElse: '',
  howHeard: '',
  website: ''
};

export default function InquirePage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const fieldRefs = useRef<Record<string, HTMLLabelElement | null>>({});
  // One stable ref setter per field, pre-built so React doesn't re-bind on every render. Typed against InquiryInput,
  // so a `refSetters.adress` typo is a compile error.
  const refSetters = useMemo(() => {
    const setters = {} as Record<keyof InquiryInput, (el: HTMLLabelElement | null) => void>;
    (Object.keys(defaultValues) as Array<keyof InquiryInput>).forEach(name => {
      setters[name] = el => {
        fieldRefs.current[name as string] = el;
      };
    });
    return setters;
  }, []);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues
  });

  // Only fields read during render need a top-level watch; conditional gates use ShowWhen, which subscribes locally.
  const priorities = useWatch({ control, name: 'priorities' });

  // Reveal-on-scroll for form bands, re-arming when `submitted` flips back. threshold is a fraction of the *target's*
  // size, so for bands taller than the viewport intersectionRatio caps below any fixed threshold and the band sticks
  // at opacity 0 — hence threshold 0 plus rootMargin.
  useEffect(() => {
    if (submitted) return;
    const bands = document.querySelectorAll('.form-band');
    if (!bands.length) return;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );
    bands.forEach(b => io.observe(b));
    return () => io.disconnect();
  }, [submitted]);

  const scrollToField = useCallback((key: string) => {
    const node = fieldRefs.current[key];
    if (!node) return;
    // Header clearance comes from Field's `scroll-margin-top: var(--scroll-offset)`, which the browser applies here;
    // doing the arithmetic in JS meant one hardcoded desktop offset that overshot on phones.
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      const focusable = node.querySelector<HTMLElement>('input, textarea, select');
      if (focusable) focusable.focus({ preventScroll: true });
    }, 600);
  }, []);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    void handleSubmit(
      async values => {
        setServerError(null);
        const result = await submitInquiry(values);
        if (result.ok) {
          setSubmitted(true);
          setAttempted(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setServerError(result.error);
        }
      },
      errs => {
        setAttempted(true);
        const first = Object.keys(errs)[0];
        if (first) scrollToField(first);
      }
    )(e);
  };

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="inquire-success px-[24px] pt-[96px] pb-[72px] sm:px-[32px] sm:pt-[160px] sm:pb-[120px]"
        style={{
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center'
        }}>
        <div style={{ maxWidth: 640 }}>
          <Eyebrow style={{ marginBottom: 24 }}>— Thank You</Eyebrow>
          <Heading
            level="display"
            style={{ fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 1, letterSpacing: '-0.015em', marginBottom: 32 }}>
            Your inquiry is <span style={{ fontStyle: 'italic' }}>received</span>.
          </Heading>
          <p style={{ ...text.body, fontSize: 18, marginBottom: 48 }}>
            Thank you for taking the time to complete this inquiry. After reviewing your submission, we will follow up with next steps —
            which may include a consultation or placement within our upcoming project schedule. In the meantime, you may wish to revisit our{' '}
            <Link href="/projects" style={{ borderBottom: '1px solid currentColor', paddingBottom: 1 }}>
              recent projects
            </Link>
            .
          </p>
          <Link href="/" className="micro" style={{ borderBottom: '1px solid currentColor', paddingBottom: 4, letterSpacing: '0.28em' }}>
            ↵ Return Home
          </Link>
        </div>
      </div>
    );
  }

  const errInputBorder = (key: keyof InquiryInput): CSSProperties =>
    errors[key] ? { borderBottomColor: color.error, borderBottomWidth: 1.5 } : {};

  const errorEntries = Object.entries(errors)
    .map(([k, v]) => [k, (v as { message?: string } | undefined)?.message] as const)
    .filter(([, msg]) => Boolean(msg)) as Array<readonly [string, string]>;

  return (
    <div style={pageColumnStyle}>
      {/* Hero. A raw <section> rather than <Section>: the gutter is owned by the
          page column above, and <Section> bakes its own in with no opt-out. The
          padding classes are `padTop="md"` / `padBottom="sm"` written out. */}
      <section className="pt-[56px] pb-[48px] sm:pt-[140px] sm:pb-[120px]" style={{ borderBottom: `1px solid ${color.hairline}` }}>
        <Eyebrow style={{ marginBottom: 24 }}>— New Inquiries</Eyebrow>
        <Grid cols="minmax(0, 1.05fr) minmax(0, 1fr)" gap={{ d: 80, m: 28 }} alignItems="end">
          <Heading
            level="display"
            style={{
              fontSize: 'clamp(44px, 5.6vw, 92px)',
              lineHeight: 0.98,
              letterSpacing: '-0.018em',
              maxWidth: '12ch'
            }}>
            Begin a <span style={{ fontStyle: 'italic' }}>conversation</span>.
          </Heading>
          <div style={{ maxWidth: '54ch' }}>
            <p style={{ ...text.body, fontSize: 17, margin: 0 }}>
              Creating a home is a thoughtful and detailed process. This form is designed to help us understand your project, priorities,
              and timeline so we can determine the best way to work together.
            </p>
            <p style={{ ...text.body, fontSize: 17, marginTop: 18, marginBottom: 0 }}>
              Due to the level of detail and involvement required, we take on a limited number of projects at a time and prioritise those
              with clearly defined scope, timeline, and investment.
            </p>
            <p className="micro-sm" style={{ marginTop: 24, marginBottom: 0, opacity: 0.5 }}>
              ∗ Indicates a required field
            </p>
          </div>
        </Grid>
      </section>

      {/* Form — always visible. Previously hidden behind a useReveal IO that
          could fail on refresh/scroll-restoration, leaving the entire form
          at opacity 0 with no recovery path. Per-band entrance fades had the
          same problem and were removed in globals.css. */}
      <form
        onSubmit={onSubmit}
        style={{
          padding: 0,
          display: 'grid',
          gap: 0
        }}>
        {/* Honeypot — bots fill, humans don't */}
        <input {...register('website')} type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" style={honeypotStyle} />

        {/* 01 — CONTACT INFORMATION */}
        <FormBand numeral="01" label="Contact Information">
          <Grid cols="minmax(0, 1fr) minmax(0, 1fr)" gap={36}>
            <Field label={QUESTIONS.name} required name="name" error={errors.name?.message} registerRef={refSetters.name}>
              <input {...register('name')} aria-invalid={!!errors.name} style={{ ...inputStyle, ...errInputBorder('name') }} />
            </Field>
            <Field label={QUESTIONS.email} required name="email" error={errors.email?.message} registerRef={refSetters.email}>
              <input
                {...register('email')}
                type="email"
                aria-invalid={!!errors.email}
                style={{ ...inputStyle, ...errInputBorder('email') }}
              />
            </Field>
            <Field label={QUESTIONS.phone} required name="phone" error={errors.phone?.message} registerRef={refSetters.phone}>
              <input {...register('phone')} aria-invalid={!!errors.phone} style={{ ...inputStyle, ...errInputBorder('phone') }} />
            </Field>
          </Grid>
        </FormBand>

        {/* 02 — PROJECT OVERVIEW */}
        <FormBand numeral="02" label="Project Overview">
          <Field label={QUESTIONS.address} required name="address" error={errors.address?.message} registerRef={refSetters.address}>
            <input
              {...register('address')}
              placeholder="Street, city, state / postcode"
              aria-invalid={!!errors.address}
              style={{ ...inputStyle, ...errInputBorder('address') }}
            />
          </Field>

          <Field
            label={QUESTIONS.projectType}
            required
            name="projectType"
            error={errors.projectType?.message}
            registerRef={refSetters.projectType}>
            <Controller
              control={control}
              name="projectType"
              render={({ field }) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                  {PROJECT_TYPES.map(t => (
                    <Chip
                      key={t}
                      label={t}
                      active={field.value.includes(t)}
                      onClick={() => field.onChange(field.value.includes(t) ? field.value.filter(v => v !== t) : [...field.value, t])}
                    />
                  ))}
                </div>
              )}
            />
            <ShowWhen control={control} name="projectType" when={v => v.length > 0}>
              <input {...register('projectTypeOther')} placeholder="Other (optional)" style={{ ...inputStyle, marginTop: 14 }} />
            </ShowWhen>
          </Field>

          <Field label={QUESTIONS.areas} required name="areas" error={errors.areas?.message} registerRef={refSetters.areas}>
            <Controller
              control={control}
              name="areas"
              render={({ field }) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                  {AREAS.map(a => (
                    <Chip
                      key={a}
                      label={a}
                      active={field.value.includes(a)}
                      onClick={() => field.onChange(field.value.includes(a) ? field.value.filter(v => v !== a) : [...field.value, a])}
                    />
                  ))}
                </div>
              )}
            />
          </Field>

          <Field label={QUESTIONS.size}>
            <input
              {...register('size')}
              placeholder="Total square footage, or an estimate of the areas being renovated"
              style={inputStyle}
            />
          </Field>

          <Field
            label={QUESTIONS.description}
            required
            name="description"
            error={errors.description?.message}
            registerRef={refSetters.description}>
            <textarea
              {...register('description')}
              rows={5}
              aria-invalid={!!errors.description}
              placeholder="The site, the household, what you'd like the home to feel like, what's prompting the project…"
              style={{
                ...textareaBaseStyle,
                border: `1px solid ${errors.description ? color.error : color.hairline}`,
                minHeight: 140
              }}
            />
          </Field>
        </FormBand>

        {/* 03 — PROJECT TEAM + READINESS */}
        <FormBand numeral="03" label="Project Team + Readiness">
          <Field label={QUESTIONS.builder} required name="builder" error={errors.builder?.message} registerRef={refSetters.builder}>
            <Controller
              control={control}
              name="builder"
              render={({ field }) => (
                <RadioPills options={BUILDER_OPTIONS} value={field.value} onChange={field.onChange} hasError={!!errors.builder} />
              )}
            />
          </Field>

          <ShowWhen control={control} name="builder" when={v => v === 'Yes'}>
            <Field label={QUESTIONS.builderName}>
              <input {...register('builderName')} style={inputStyle} />
            </Field>
          </ShowWhen>

          <Field label={QUESTIONS.plans} required name="plans" error={errors.plans?.message} registerRef={refSetters.plans}>
            <Controller
              control={control}
              name="plans"
              render={({ field }) => (
                <RadioPills options={PLANS_OPTIONS} value={field.value} onChange={field.onChange} hasError={!!errors.plans} />
              )}
            />
          </Field>
        </FormBand>

        {/* 04 — TIMELINE */}
        <FormBand numeral="04" label="Timeline">
          <Field label={QUESTIONS.beginTime} required name="beginTime" error={errors.beginTime?.message} registerRef={refSetters.beginTime}>
            <Controller
              control={control}
              name="beginTime"
              render={({ field }) => (
                <RadioPills options={BEGIN_TIMES} value={field.value} onChange={field.onChange} hasError={!!errors.beginTime} />
              )}
            />
          </Field>

          <Field
            label={QUESTIONS.completion}
            required
            name="completion"
            error={errors.completion?.message}
            registerRef={refSetters.completion}>
            <Controller
              control={control}
              name="completion"
              render={({ field }) => (
                <RadioPills options={COMPLETION_TIMES} value={field.value} onChange={field.onChange} hasError={!!errors.completion} />
              )}
            />
          </Field>

          <Field label={QUESTIONS.deadlines} required name="deadlines" error={errors.deadlines?.message} registerRef={refSetters.deadlines}>
            <input
              {...register('deadlines')}
              placeholder='Move-in date, holiday, sale completion — or write "none"'
              aria-invalid={!!errors.deadlines}
              style={{ ...inputStyle, ...errInputBorder('deadlines') }}
            />
          </Field>
        </FormBand>

        {/* 05 — PROJECT EXPERIENCE */}
        <FormBand numeral="05" label="Project Experience">
          <Field
            label={QUESTIONS.builtBefore}
            required
            name="builtBefore"
            error={errors.builtBefore?.message}
            registerRef={refSetters.builtBefore}>
            <Controller
              control={control}
              name="builtBefore"
              render={({ field }) => (
                <RadioPills options={YES_NO} value={field.value} onChange={field.onChange} hasError={!!errors.builtBefore} />
              )}
            />
          </Field>

          <ShowWhen control={control} name="builtBefore" when={v => v === 'Yes'}>
            <Field label={QUESTIONS.builtBeforeNote}>
              <textarea {...register('builtBeforeNote')} rows={3} style={{ ...textareaBaseStyle, minHeight: 96 }} />
            </Field>
          </ShowWhen>

          <Field
            label={QUESTIONS.workedDesigner}
            required
            name="workedDesigner"
            error={errors.workedDesigner?.message}
            registerRef={refSetters.workedDesigner}>
            <Controller
              control={control}
              name="workedDesigner"
              render={({ field }) => (
                <RadioPills options={YES_NO} value={field.value} onChange={field.onChange} hasError={!!errors.workedDesigner} />
              )}
            />
          </Field>

          <ShowWhen control={control} name="workedDesigner" when={v => v === 'Yes'}>
            <Field label={QUESTIONS.workedDesignerNote}>
              <textarea {...register('workedDesignerNote')} rows={3} style={{ ...textareaBaseStyle, minHeight: 96 }} />
            </Field>
          </ShowWhen>
        </FormBand>

        {/* 06 — INVESTMENT */}
        <FormBand numeral="06" label="Investment">
          <p style={{ ...text.bodySm, maxWidth: '60ch', marginTop: -8 }}>
            Thoughtful planning and realistic budgeting are essential to creating a cohesive, well-executed home. Design fees vary based on
            scope, level of detail, and overall project complexity. The following helps us align expectations from the beginning.
          </p>

          <Field
            label={QUESTIONS.investment}
            required
            name="investment"
            error={errors.investment?.message}
            registerRef={refSetters.investment}>
            <select
              {...register('investment')}
              aria-invalid={!!errors.investment}
              style={{ ...inputStyle, ...errInputBorder('investment'), appearance: 'none', cursor: 'pointer' }}>
              <option value="">Please select —</option>
              {INVESTMENT_RANGES.map(r => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>

          <Field
            label={QUESTIONS.designBudgetAllocated}
            required
            name="designBudgetAllocated"
            error={errors.designBudgetAllocated?.message}
            registerRef={refSetters.designBudgetAllocated}>
            <Controller
              control={control}
              name="designBudgetAllocated"
              render={({ field }) => (
                <RadioPills
                  options={DESIGN_BUDGET_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.designBudgetAllocated}
                />
              )}
            />
          </Field>

          <Field
            label={QUESTIONS.designInvestment}
            required
            name="designInvestment"
            error={errors.designInvestment?.message}
            registerRef={refSetters.designInvestment}>
            <Controller
              control={control}
              name="designInvestment"
              render={({ field }) => (
                <RadioStack
                  name="designInvestment"
                  options={DESIGN_INVESTMENT_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.designInvestment}
                />
              )}
            />
          </Field>
        </FormBand>

        {/* 07 — PROJECT APPROACH */}
        <FormBand numeral="07" label="Project Approach">
          <Field
            label={QUESTIONS.builderApproach}
            required
            name="builderApproach"
            error={errors.builderApproach?.message}
            registerRef={refSetters.builderApproach}>
            <Controller
              control={control}
              name="builderApproach"
              render={({ field }) => (
                <RadioStack
                  name="builderApproach"
                  options={BUILDER_APPROACH_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.builderApproach}
                />
              )}
            />
          </Field>

          <Field
            label={QUESTIONS.designSupport}
            required
            name="designSupport"
            error={errors.designSupport?.message}
            registerRef={refSetters.designSupport}>
            <Controller
              control={control}
              name="designSupport"
              render={({ field }) => (
                <RadioStack
                  name="designSupport"
                  options={DESIGN_SUPPORT_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.designSupport}
                />
              )}
            />
          </Field>
        </FormBand>

        {/* 08 — DECISION-MAKING + EXPECTATIONS */}
        <FormBand numeral="08" label="Decision-Making + Expectations">
          <Field
            label={QUESTIONS.decisionMaker}
            required
            name="decisionMaker"
            error={errors.decisionMaker?.message}
            registerRef={refSetters.decisionMaker}>
            <Controller
              control={control}
              name="decisionMaker"
              render={({ field }) => (
                <RadioPills
                  options={DECISION_MAKER_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.decisionMaker}
                />
              )}
            />
          </Field>

          <Field
            label={QUESTIONS.decisionComfort}
            required
            name="decisionComfort"
            error={errors.decisionComfort?.message}
            registerRef={refSetters.decisionComfort}>
            <Controller
              control={control}
              name="decisionComfort"
              render={({ field }) => (
                <RadioPills
                  options={DECISION_COMFORT_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.decisionComfort}
                />
              )}
            />
          </Field>

          <Field
            label={QUESTIONS.openToRecs}
            required
            name="openToRecs"
            error={errors.openToRecs?.message}
            registerRef={refSetters.openToRecs}>
            <Controller
              control={control}
              name="openToRecs"
              render={({ field }) => (
                <RadioPills options={OPEN_TO_RECS_OPTIONS} value={field.value} onChange={field.onChange} hasError={!!errors.openToRecs} />
              )}
            />
          </Field>

          <Field
            label={QUESTIONS.involvement}
            required
            name="involvement"
            error={errors.involvement?.message}
            registerRef={refSetters.involvement}>
            <Controller
              control={control}
              name="involvement"
              render={({ field }) => (
                <RadioPills options={INVOLVEMENT_OPTIONS} value={field.value} onChange={field.onChange} hasError={!!errors.involvement} />
              )}
            />
          </Field>

          <Field label={QUESTIONS.changesApproach}>
            <Controller
              control={control}
              name="changesApproach"
              render={({ field }) => (
                <RadioStack name="changesApproach" options={CHANGES_APPROACH_OPTIONS} value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>
        </FormBand>

        {/* 09 — STYLE + PRIORITIES */}
        <FormBand numeral="09" label="Style + Priorities">
          <Field label={QUESTIONS.style} required name="style" error={errors.style?.message} registerRef={refSetters.style}>
            <textarea
              {...register('style')}
              rows={3}
              aria-invalid={!!errors.style}
              placeholder="A few words, a few references, or what you keep coming back to…"
              style={{
                ...textareaBaseStyle,
                border: `1px solid ${errors.style ? color.error : color.hairline}`,
                minHeight: 100
              }}
            />
          </Field>

          <Field
            label={`${QUESTIONS.priorities} (${priorities.length}/${PRIORITIES_MAX})`}
            required
            name="priorities"
            error={errors.priorities?.message}
            registerRef={refSetters.priorities}>
            <Controller
              control={control}
              name="priorities"
              render={({ field }) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                  {PRIORITIES.map(p => {
                    const active = field.value.includes(p);
                    const atCap = field.value.length >= PRIORITIES_MAX;
                    return (
                      <Chip
                        key={p}
                        label={p}
                        active={active}
                        disabled={!active && atCap}
                        onClick={() => {
                          if (active) field.onChange(field.value.filter(v => v !== p));
                          else if (!atCap) field.onChange([...field.value, p]);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            />
          </Field>
        </FormBand>

        {/* 10 — COMMUNICATION + PROCESS */}
        <FormBand numeral="10" label="Communication + Process">
          <p style={{ ...text.bodySm, maxWidth: '60ch', marginTop: -8 }}>
            To maintain organization and clarity across all projects, communication is handled primarily through email and scheduled
            meetings.
          </p>

          <Field
            label={QUESTIONS.structuredComm}
            required
            name="structuredComm"
            error={errors.structuredComm?.message}
            registerRef={refSetters.structuredComm}>
            <Controller
              control={control}
              name="structuredComm"
              render={({ field }) => (
                <RadioPills
                  options={STRUCTURED_COMM_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!errors.structuredComm}
                />
              )}
            />
          </Field>
        </FormBand>

        {/* 11 — FINAL DETAILS */}
        <FormBand numeral="11" label="Final Details">
          <Field
            label={QUESTIONS.anythingElse}
            required
            name="anythingElse"
            error={errors.anythingElse?.message}
            registerRef={refSetters.anythingElse}>
            <textarea
              {...register('anythingElse')}
              rows={4}
              aria-invalid={!!errors.anythingElse}
              placeholder='Family rhythms, pets, art collections, accessibility needs, anything that feels relevant — or write "nothing else"'
              style={{
                ...textareaBaseStyle,
                border: `1px solid ${errors.anythingElse ? color.error : color.hairline}`,
                minHeight: 110
              }}
            />
          </Field>

          <Field label={QUESTIONS.howHeard} required name="howHeard" error={errors.howHeard?.message} registerRef={refSetters.howHeard}>
            <input
              {...register('howHeard')}
              placeholder="Press, Instagram, a referral, online search…"
              aria-invalid={!!errors.howHeard}
              style={{ ...inputStyle, ...errInputBorder('howHeard') }}
            />
          </Field>
        </FormBand>

        {/* Submit */}
        <div className="mt-[40px] mb-[56px] sm:mt-[64px] sm:mb-[80px]" style={{ display: 'grid', gap: 28 }}>
          {attempted && errorEntries.length > 0 && (
            <div
              role="alert"
              aria-live="polite"
              style={{
                display: 'grid',
                gap: 14,
                padding: '22px 26px',
                border: `1px solid ${color.error}`,
                borderLeft: `3px solid ${color.error}`,
                background: 'rgba(139, 58, 46, 0.04)',
                animation: 'errorIn 0.4s cubic-bezier(.22,.61,.36,1)'
              }}>
              <div className="micro-sm" style={{ color: color.error, opacity: 0.95 }}>
                — A few details still missing
              </div>
              <p
                className="serif"
                style={{ fontSize: 18, fontStyle: 'italic', fontWeight: 300, lineHeight: 1.5, color: color.error, margin: 0 }}>
                Before we can send your inquiry, please share{' '}
                {errorEntries.length === 1 ? 'one more thing' : `${errorEntries.length} more details`}.
              </p>
              <ul style={{ listStyle: 'none', display: 'grid', gap: 6, margin: 0, padding: 0 }}>
                {errorEntries.map(([k, msg]) => (
                  <li key={k}>
                    <button
                      type="button"
                      onClick={() => scrollToField(k)}
                      style={{
                        fontSize: 14,
                        color: color.error,
                        opacity: 0.85,
                        borderBottom: `1px solid ${color.error}`,
                        paddingBottom: 1,
                        cursor: 'pointer'
                      }}>
                      {msg}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'grid', gap: 10, maxWidth: '46ch' }}>
              <p className="micro-sm" style={{ opacity: 0.55, lineHeight: 1.6, margin: 0 }}>
                By submitting, you agree to be contacted regarding your project. Your details remain private and are never shared with third
                parties.
              </p>
              {serverError && (
                <p className="serif" style={{ fontSize: 14, fontStyle: 'italic', fontWeight: 300, color: color.error, margin: 0 }}>
                  {serverError}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full sm:w-auto"
              style={{
                padding: '16px 40px',
                border: 'none',
                borderRadius: 100,
                fontSize: 13,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                fontFamily: 'inherit'
              }}>
              {isSubmitting ? 'Sending…' : 'Send Inquiry'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
