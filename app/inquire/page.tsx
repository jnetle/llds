'use client';

import * as React from 'react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useReveal } from '@/hooks/useReveal';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Field } from '@/components/ui/Field';
import { Chip } from '@/components/ui/Chip';
import { RadioPills } from '@/components/ui/RadioPills';
import { RadioStack } from '@/components/ui/RadioStack';
import { BandHeader } from './BandHeader';
import { color, motion, text } from '@/lib/tokens';
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
import { submitInquiry } from './actions';

const inputStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${color.hairline}`,
  padding: '12px 0',
  fontSize: 17,
  color: color.ink,
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.3s'
};

// Standalone (not spread from inputStyle): inputStyle's `borderBottom` longhand
// would be emitted after our `border` shorthand and silently strip the bottom border.
const textareaBaseStyle: CSSProperties = {
  background: 'transparent',
  border: `1px solid ${color.hairline}`,
  padding: '14px 16px',
  fontSize: 17,
  color: color.ink,
  fontFamily: 'inherit',
  outline: 'none',
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

const bandSectionStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(220px, 280px) minmax(0, 1fr)',
  gap: 80,
  padding: '88px 8vw 96px',
  alignItems: 'start'
};

const fieldsetStyle: CSSProperties = {
  display: 'grid',
  gap: 28,
  border: 'none',
  padding: 0,
  margin: 0,
  minWidth: 0
};

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
  newsletter: false,
  website: ''
};

export default function InquirePage() {
  const [ref, seen] = useReveal<HTMLFormElement>();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const fieldRefs = useRef<Record<string, HTMLLabelElement | null>>({});

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues
  });

  const builder = useWatch({ control, name: 'builder' });
  const builtBefore = useWatch({ control, name: 'builtBefore' });
  const workedDesigner = useWatch({ control, name: 'workedDesigner' });
  const projectType = useWatch({ control, name: 'projectType' });
  const priorities = useWatch({ control, name: 'priorities' });

  // Reveal-on-scroll for form bands. Re-arms when `submitted` flips back.
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
      { threshold: 0.18, rootMargin: '0px 0px -10% 0px' }
    );
    bands.forEach(b => io.observe(b));
    return () => io.disconnect();
  }, [submitted]);

  const scrollToField = useCallback((key: string) => {
    const node = fieldRefs.current[key];
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top, behavior: 'smooth' });
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
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '160px 32px 120px',
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
    <>
      {/* Hero */}
      <Section padTop="xl" padBottom="xxs" style={{ borderBottom: `1px solid ${color.hairline}` }}>
        <Eyebrow style={{ marginBottom: 28 }}>— New Inquiries</Eyebrow>
        <Heading
          level="display"
          style={{ fontSize: 'clamp(56px, 8vw, 140px)', lineHeight: 0.96, letterSpacing: '-0.018em', maxWidth: '14ch' }}>
          Begin a <span style={{ fontStyle: 'italic' }}>conversation</span>.
        </Heading>
        <p style={{ ...text.body, fontSize: 17, marginTop: 40, maxWidth: '60ch' }}>
          Creating a home is a thoughtful and detailed process. This form is designed to help us understand your project, priorities, and
          timeline so we can determine the best way to work together.
        </p>
        <p style={{ ...text.body, fontSize: 17, marginTop: 18, maxWidth: '60ch' }}>
          Due to the level of detail and involvement required, we take on a limited number of projects at a time and prioritise those with
          clearly defined scope, timeline, and investment. Please complete the following so we can thoughtfully review your project.
        </p>
        <p className="micro-sm" style={{ marginTop: 32, opacity: 0.5 }}>
          ∗ Indicates a required field
        </p>
      </Section>

      {/* Form */}
      <form
        ref={ref}
        onSubmit={onSubmit}
        style={{
          padding: 0,
          display: 'grid',
          gap: 0,
          opacity: seen ? 1 : 0,
          transform: seen ? 'translateY(0)' : 'translateY(24px)',
          transition: `all ${motion.durXSlow} ${motion.ease}`
        }}>
        {/* Honeypot — bots fill, humans don't */}
        <input {...register('website')} type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" style={honeypotStyle} />

        {/* 01 — CONTACT INFORMATION */}
        <section className="form-band" style={bandSectionStyle}>
          <BandHeader numeral="01" label="Contact Information" />
          <fieldset style={fieldsetStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
              <Field
                label="Full name"
                required
                name="name"
                error={errors.name?.message}
                registerRef={el => {
                  fieldRefs.current.name = el;
                }}>
                <input {...register('name')} aria-invalid={!!errors.name} style={{ ...inputStyle, ...errInputBorder('name') }} />
              </Field>
              <Field
                label="Email address"
                required
                name="email"
                error={errors.email?.message}
                registerRef={el => {
                  fieldRefs.current.email = el;
                }}>
                <input
                  {...register('email')}
                  type="email"
                  aria-invalid={!!errors.email}
                  style={{ ...inputStyle, ...errInputBorder('email') }}
                />
              </Field>
              <Field
                label="Phone number"
                required
                name="phone"
                error={errors.phone?.message}
                registerRef={el => {
                  fieldRefs.current.phone = el;
                }}>
                <input {...register('phone')} aria-invalid={!!errors.phone} style={{ ...inputStyle, ...errInputBorder('phone') }} />
              </Field>
            </div>
          </fieldset>
        </section>

        {/* 02 — PROJECT OVERVIEW */}
        <section className="form-band" style={bandSectionStyle}>
          <BandHeader numeral="02" label="Project Overview" />
          <fieldset style={fieldsetStyle}>
            <Field
              label="Project address"
              required
              name="address"
              error={errors.address?.message}
              registerRef={el => {
                fieldRefs.current.address = el;
              }}>
              <input
                {...register('address')}
                placeholder="Street, city, state / postcode"
                aria-invalid={!!errors.address}
                style={{ ...inputStyle, ...errInputBorder('address') }}
              />
            </Field>

            <Field
              label="What type of project are you planning? — select all that apply"
              required
              name="projectType"
              error={errors.projectType?.message}
              registerRef={el => {
                fieldRefs.current.projectType = el;
              }}>
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
              {projectType.length > 0 && (
                <input {...register('projectTypeOther')} placeholder="Other (optional)" style={{ ...inputStyle, marginTop: 14 }} />
              )}
            </Field>

            <Field
              label="What areas are included? — select all that apply"
              required
              name="areas"
              error={errors.areas?.message}
              registerRef={el => {
                fieldRefs.current.areas = el;
              }}>
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

            <Field label="Approximate size of the home or area involved">
              <input
                {...register('size')}
                placeholder="Total square footage, or an estimate of the areas being renovated"
                style={inputStyle}
              />
            </Field>

            <Field
              label="Please briefly describe your project and goals"
              required
              name="description"
              error={errors.description?.message}
              registerRef={el => {
                fieldRefs.current.description = el;
              }}>
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
          </fieldset>
        </section>

        {/* 03 — PROJECT TEAM + READINESS */}
        <section className="form-band" style={bandSectionStyle}>
          <BandHeader numeral="03" label="Project Team + Readiness" />
          <fieldset style={fieldsetStyle}>
            <Field
              label="Do you have a builder or contractor selected?"
              required
              name="builder"
              error={errors.builder?.message}
              registerRef={el => {
                fieldRefs.current.builder = el;
              }}>
              <Controller
                control={control}
                name="builder"
                render={({ field }) => (
                  <RadioPills options={BUILDER_OPTIONS} value={field.value} onChange={field.onChange} hasError={!!errors.builder} />
                )}
              />
            </Field>

            {builder === 'Yes' && (
              <Field label="If yes, who are you working with?">
                <input {...register('builderName')} style={inputStyle} />
              </Field>
            )}

            <Field
              label="Are architectural plans completed?"
              required
              name="plans"
              error={errors.plans?.message}
              registerRef={el => {
                fieldRefs.current.plans = el;
              }}>
              <Controller
                control={control}
                name="plans"
                render={({ field }) => (
                  <RadioPills options={PLANS_OPTIONS} value={field.value} onChange={field.onChange} hasError={!!errors.plans} />
                )}
              />
            </Field>
          </fieldset>
        </section>

        {/* 04 — TIMELINE */}
        <section className="form-band" style={bandSectionStyle}>
          <BandHeader numeral="04" label="Timeline" />
          <fieldset style={fieldsetStyle}>
            <Field
              label="When would you ideally like to begin?"
              required
              name="beginTime"
              error={errors.beginTime?.message}
              registerRef={el => {
                fieldRefs.current.beginTime = el;
              }}>
              <Controller
                control={control}
                name="beginTime"
                render={({ field }) => (
                  <RadioPills options={BEGIN_TIMES} value={field.value} onChange={field.onChange} hasError={!!errors.beginTime} />
                )}
              />
            </Field>

            <Field
              label="What is your ideal project completion timeframe?"
              required
              name="completion"
              error={errors.completion?.message}
              registerRef={el => {
                fieldRefs.current.completion = el;
              }}>
              <Controller
                control={control}
                name="completion"
                render={({ field }) => (
                  <RadioPills options={COMPLETION_TIMES} value={field.value} onChange={field.onChange} hasError={!!errors.completion} />
                )}
              />
            </Field>

            <Field
              label="Are there any specific deadlines we should be aware of?"
              required
              name="deadlines"
              error={errors.deadlines?.message}
              registerRef={el => {
                fieldRefs.current.deadlines = el;
              }}>
              <input
                {...register('deadlines')}
                placeholder='Move-in date, holiday, sale completion — or write "none"'
                aria-invalid={!!errors.deadlines}
                style={{ ...inputStyle, ...errInputBorder('deadlines') }}
              />
            </Field>
          </fieldset>
        </section>

        {/* 05 — PROJECT EXPERIENCE */}
        <section className="form-band" style={bandSectionStyle}>
          <BandHeader numeral="05" label="Project Experience" />
          <fieldset style={fieldsetStyle}>
            <Field
              label="Have you previously built or renovated a home?"
              required
              name="builtBefore"
              error={errors.builtBefore?.message}
              registerRef={el => {
                fieldRefs.current.builtBefore = el;
              }}>
              <Controller
                control={control}
                name="builtBefore"
                render={({ field }) => (
                  <RadioPills options={YES_NO} value={field.value} onChange={field.onChange} hasError={!!errors.builtBefore} />
                )}
              />
            </Field>

            {builtBefore === 'Yes' && (
              <Field label="If yes, how would you describe that experience?">
                <textarea {...register('builtBeforeNote')} rows={3} style={{ ...textareaBaseStyle, minHeight: 96 }} />
              </Field>
            )}

            <Field
              label="Have you worked with a designer before?"
              required
              name="workedDesigner"
              error={errors.workedDesigner?.message}
              registerRef={el => {
                fieldRefs.current.workedDesigner = el;
              }}>
              <Controller
                control={control}
                name="workedDesigner"
                render={({ field }) => (
                  <RadioPills options={YES_NO} value={field.value} onChange={field.onChange} hasError={!!errors.workedDesigner} />
                )}
              />
            </Field>

            {workedDesigner === 'Yes' && (
              <Field label="If yes, how would you describe that experience?">
                <textarea {...register('workedDesignerNote')} rows={3} style={{ ...textareaBaseStyle, minHeight: 96 }} />
              </Field>
            )}
          </fieldset>
        </section>

        {/* 06 — INVESTMENT */}
        <section className="form-band" style={bandSectionStyle}>
          <BandHeader numeral="06" label="Investment" />
          <fieldset style={fieldsetStyle}>
            <p style={{ ...text.bodySm, maxWidth: '60ch', marginTop: -8 }}>
              Thoughtful planning and realistic budgeting are essential to creating a cohesive, well-executed home. Design fees vary based
              on scope, level of detail, and overall project complexity. The following helps us align expectations from the beginning.
            </p>

            <Field
              label="Anticipated overall investment (construction + materials)"
              required
              name="investment"
              error={errors.investment?.message}
              registerRef={el => {
                fieldRefs.current.investment = el;
              }}>
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
              label="Have you allocated a budget for professional design services?"
              required
              name="designBudgetAllocated"
              error={errors.designBudgetAllocated?.message}
              registerRef={el => {
                fieldRefs.current.designBudgetAllocated = el;
              }}>
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
              label="What level of investment are you comfortable allocating toward design services?"
              required
              name="designInvestment"
              error={errors.designInvestment?.message}
              registerRef={el => {
                fieldRefs.current.designInvestment = el;
              }}>
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
          </fieldset>
        </section>

        {/* 07 — PROJECT APPROACH */}
        <section className="form-band" style={bandSectionStyle}>
          <BandHeader numeral="07" label="Project Approach" />
          <fieldset style={fieldsetStyle}>
            <Field
              label="Will your project be:"
              required
              name="builderApproach"
              error={errors.builderApproach?.message}
              registerRef={el => {
                fieldRefs.current.builderApproach = el;
              }}>
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
              label="What level of design support are you looking for?"
              required
              name="designSupport"
              error={errors.designSupport?.message}
              registerRef={el => {
                fieldRefs.current.designSupport = el;
              }}>
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
          </fieldset>
        </section>

        {/* 08 — DECISION-MAKING + EXPECTATIONS */}
        <section className="form-band" style={bandSectionStyle}>
          <BandHeader numeral="08" label="Decision-Making + Expectations" />
          <fieldset style={fieldsetStyle}>
            <Field
              label="Who will be the primary decision-maker for this project?"
              required
              name="decisionMaker"
              error={errors.decisionMaker?.message}
              registerRef={el => {
                fieldRefs.current.decisionMaker = el;
              }}>
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
              label="How comfortable are you making decisions within a defined timeline?"
              required
              name="decisionComfort"
              error={errors.decisionComfort?.message}
              registerRef={el => {
                fieldRefs.current.decisionComfort = el;
              }}>
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
              label="Are you open to professional recommendations, even if they differ from your initial ideas?"
              required
              name="openToRecs"
              error={errors.openToRecs?.message}
              registerRef={el => {
                fieldRefs.current.openToRecs = el;
              }}>
              <Controller
                control={control}
                name="openToRecs"
                render={({ field }) => (
                  <RadioPills options={OPEN_TO_RECS_OPTIONS} value={field.value} onChange={field.onChange} hasError={!!errors.openToRecs} />
                )}
              />
            </Field>

            <Field
              label="How involved would you like to be in the selection process?"
              required
              name="involvement"
              error={errors.involvement?.message}
              registerRef={el => {
                fieldRefs.current.involvement = el;
              }}>
              <Controller
                control={control}
                name="involvement"
                render={({ field }) => (
                  <RadioPills options={INVOLVEMENT_OPTIONS} value={field.value} onChange={field.onChange} hasError={!!errors.involvement} />
                )}
              />
            </Field>

            <Field label="During a project, unexpected decisions and adjustments may arise. How do you typically approach these situations?">
              <Controller
                control={control}
                name="changesApproach"
                render={({ field }) => (
                  <RadioStack name="changesApproach" options={CHANGES_APPROACH_OPTIONS} value={field.value} onChange={field.onChange} />
                )}
              />
            </Field>
          </fieldset>
        </section>

        {/* 09 — STYLE + PRIORITIES */}
        <section className="form-band" style={bandSectionStyle}>
          <BandHeader numeral="09" label="Style + Priorities" />
          <fieldset style={fieldsetStyle}>
            <Field
              label="How would you describe your style?"
              required
              name="style"
              error={errors.style?.message}
              registerRef={el => {
                fieldRefs.current.style = el;
              }}>
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
              label={`Top priorities for this project — select up to three (${priorities.length}/${PRIORITIES_MAX})`}
              required
              name="priorities"
              error={errors.priorities?.message}
              registerRef={el => {
                fieldRefs.current.priorities = el;
              }}>
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
          </fieldset>
        </section>

        {/* 10 — COMMUNICATION + PROCESS */}
        <section className="form-band" style={bandSectionStyle}>
          <BandHeader numeral="10" label="Communication + Process" />
          <fieldset style={fieldsetStyle}>
            <p style={{ ...text.bodySm, maxWidth: '60ch', marginTop: -8 }}>
              To maintain organization and clarity across all projects, communication is handled primarily through email and scheduled
              meetings.
            </p>

            <Field
              label="Are you comfortable with structured communication and scheduled check-ins throughout the project?"
              required
              name="structuredComm"
              error={errors.structuredComm?.message}
              registerRef={el => {
                fieldRefs.current.structuredComm = el;
              }}>
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
          </fieldset>
        </section>

        {/* 11 — FINAL DETAILS */}
        <section className="form-band" style={bandSectionStyle}>
          <BandHeader numeral="11" label="Final Details" />
          <fieldset style={fieldsetStyle}>
            <Field
              label="Is there anything else you'd like us to know about your project?"
              required
              name="anythingElse"
              error={errors.anythingElse?.message}
              registerRef={el => {
                fieldRefs.current.anythingElse = el;
              }}>
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

            <Field
              label="How did you hear about Laurel Leaf Design Studio?"
              required
              name="howHeard"
              error={errors.howHeard?.message}
              registerRef={el => {
                fieldRefs.current.howHeard = el;
              }}>
              <input
                {...register('howHeard')}
                placeholder="Press, Instagram, a referral, online search…"
                aria-invalid={!!errors.howHeard}
                style={{ ...inputStyle, ...errInputBorder('howHeard') }}
              />
            </Field>

            <label style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', fontSize: 15 }}>
              <input {...register('newsletter')} type="checkbox" style={{ width: 18, height: 18, accentColor: color.ink }} />
              <span style={{ color: color.inkSoft }}>
                I&apos;d like to receive the studio&apos;s quarterly journal — new work, references, and recent reading.
              </span>
            </label>
          </fieldset>
        </section>

        {/* Submit */}
        <div style={{ display: 'grid', gap: 28, width: 'min(1100px, calc(100% - 16vw))', margin: '64px auto 80px' }}>
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
              style={{
                padding: '16px 40px',
                background: color.ink,
                color: color.bg,
                border: 'none',
                borderRadius: 100,
                cursor: isSubmitting ? 'wait' : 'pointer',
                fontSize: 13,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                fontFamily: 'inherit',
                opacity: isSubmitting ? 0.6 : 1,
                transition: `opacity ${motion.durMed} ${motion.ease}`
              }}>
              {isSubmitting ? 'Sending…' : 'Send Inquiry'}
            </button>
          </div>
        </div>
      </form>

      {/* Direct contact strip */}
      <section style={{ padding: '60px 8vw 180px', borderTop: `1px solid ${color.hairline}`, marginTop: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
          <div>
            <Eyebrow size="sm" opacity={0.5} style={{ marginBottom: 14 }}>
              By post
            </Eyebrow>
            <p className="serif" style={{ fontSize: 18, fontWeight: 300, lineHeight: 1.5, margin: 0 }}>
              The Studio
              <br />
              24 Hartley Mews
              <br />
              London E2 8AB
            </p>
          </div>
          <div>
            <Eyebrow size="sm" opacity={0.5} style={{ marginBottom: 14 }}>
              By telephone
            </Eyebrow>
            <p className="serif" style={{ fontSize: 18, fontWeight: 300, lineHeight: 1.5, margin: 0 }}>
              +44 (0)20 7946 0214
              <br />
              Mon — Fri · 9 — 5
            </p>
          </div>
          <div>
            <Eyebrow size="sm" opacity={0.5} style={{ marginBottom: 14 }}>
              By email
            </Eyebrow>
            <p className="serif" style={{ fontSize: 18, fontWeight: 300, lineHeight: 1.5, margin: 0 }}>
              studio@laurelleaf.co
              <br />
              press@laurelleaf.co
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
