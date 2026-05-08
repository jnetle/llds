'use client';

import Link from 'next/link';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { useCompact } from '@/hooks/useCompact';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { color, motion, text } from '@/lib/tokens';

type FormState = {
  name: string;
  email: string;
  phone: string;
  location: string;
  projectType: string[];
  scope: string;
  timeline: string;
  budget: string;
  services: string[];
  discovery: string;
  message: string;
};

const PROJECT_TYPES = [
  'New build',
  'Period restoration',
  'Full renovation',
  'Single room',
  'Furnishing only',
  'Holiday home',
  'Commercial / hospitality'
];

const SCOPE_OPTIONS = [
  'Whole property — interior architecture & furnishing',
  'Several rooms — design and procurement',
  'A single room — design and procurement',
  'Furnishing & styling only',
  'Consultation / advice'
];

const TIMELINES = ['Within 3 months', '3 – 6 months', '6 – 12 months', '12+ months', 'Flexible / not yet decided'];

const BUDGETS = ['Under $75k', '$75k – $200k', '$200k – $500k', '$500k – $1m', '$1m+', 'Prefer to discuss'];

const SERVICES = [
  'Concept design',
  'Interior architecture',
  'FF&E procurement',
  'Joinery & bespoke',
  'Art curation',
  'Garden & landscape',
  'Project management',
  'Styling & soft launch'
];

const DISCOVERY = ['Press / magazine', 'Instagram', 'Referral', 'Stellar Awards', 'Searched online', 'Other'];

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

const legendStyle: CSSProperties = {
  fontSize: 28,
  fontStyle: 'italic',
  fontWeight: 300,
  marginBottom: 8
};

const fieldsetStyle: CSSProperties = {
  display: 'grid',
  gap: 36,
  border: 'none',
  padding: 0,
  margin: 0
};

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 10 }}>
      <Eyebrow as="span" size="sm" opacity={0.6}>
        {label}
        {required && <span style={{ marginLeft: 6, opacity: 0.5 }}>*</span>}
      </Eyebrow>
      {children}
    </label>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="micro-sm"
      style={{
        padding: '10px 18px',
        borderRadius: 100,
        border: '1px solid ' + (active ? color.ink : color.hairline),
        background: active ? color.ink : 'transparent',
        color: active ? color.bg : color.ink,
        cursor: 'pointer',
        transition: 'all 0.25s'
      }}>
      {label}
    </button>
  );
}

export default function InquirePage() {
  const [ref, seen] = useReveal<HTMLFormElement>();
  const compact = useCompact();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    location: '',
    projectType: [],
    scope: '',
    timeline: '',
    budget: '',
    services: [],
    discovery: '',
    message: ''
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleMulti = (key: 'projectType' | 'services', value: string) =>
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value]
    }));

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
            Maria will be in touch within three working days. In the meantime, you may wish to read our{' '}
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

  const twoCol: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: compact ? '1fr' : '1fr 1fr',
    gap: 36
  };

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
        <p style={{ ...text.body, fontSize: 18, marginTop: 40, maxWidth: '54ch' }}>
          Tell us a little about your home and the life you&apos;d like it to hold. The more you share, the more thoughtfully we can
          respond. We review each inquiry personally.
        </p>
      </Section>

      {/* Form */}
      <Section
        as="form"
        ref={ref}
        padTop="xs"
        padBottom="xxs"
        onSubmit={e => {
          e.preventDefault();
          setSubmitted(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        style={{
          display: 'grid',
          gap: 80,
          maxWidth: 1100,
          margin: '0 auto',
          opacity: seen ? 1 : 0,
          transform: seen ? 'translateY(0)' : 'translateY(24px)',
          transition: `all ${motion.durXSlow} ${motion.ease}`
        }}>
        {/* About you */}
        <fieldset style={fieldsetStyle}>
          <legend className="serif" style={legendStyle}>
            About you
          </legend>
          <div style={twoCol}>
            <Field label="Full name" required>
              <input required value={form.name} onChange={e => update('name', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Email address" required>
              <input required type="email" value={form.email} onChange={e => update('email', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Telephone">
              <input value={form.phone} onChange={e => update('phone', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Property location" required>
              <input
                required
                placeholder="City, region, or postcode"
                value={form.location}
                onChange={e => update('location', e.target.value)}
                style={inputStyle}
              />
            </Field>
          </div>
        </fieldset>

        {/* About the project */}
        <fieldset style={fieldsetStyle}>
          <legend className="serif" style={legendStyle}>
            About the project
          </legend>

          <Field label="Project type — select all that apply">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              {PROJECT_TYPES.map(t => (
                <Chip key={t} label={t} active={form.projectType.includes(t)} onClick={() => toggleMulti('projectType', t)} />
              ))}
            </div>
          </Field>

          <Field label="Scope of works" required>
            <div style={{ display: 'grid', gap: 14, marginTop: 8 }}>
              {SCOPE_OPTIONS.map(opt => (
                <label
                  key={opt}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    cursor: 'pointer',
                    fontSize: 16,
                    lineHeight: 1.5
                  }}>
                  <input
                    type="radio"
                    name="scope"
                    required
                    value={opt}
                    checked={form.scope === opt}
                    onChange={() => update('scope', opt)}
                    style={{ marginTop: 5, accentColor: color.ink }}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </Field>

          <div style={twoCol}>
            <Field label="Anticipated timeline" required>
              <select
                required
                value={form.timeline}
                onChange={e => update('timeline', e.target.value)}
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                <option value="">Please select —</option>
                {TIMELINES.map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Indicative budget" required>
              <select
                required
                value={form.budget}
                onChange={e => update('budget', e.target.value)}
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                <option value="">Please select —</option>
                {BUDGETS.map(b => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Services of interest — select all that apply">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              {SERVICES.map(s => (
                <Chip key={s} label={s} active={form.services.includes(s)} onClick={() => toggleMulti('services', s)} />
              ))}
            </div>
          </Field>
        </fieldset>

        {/* A little more */}
        <fieldset style={fieldsetStyle}>
          <legend className="serif" style={legendStyle}>
            A little more
          </legend>

          <Field label="How did you hear about us?">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              {DISCOVERY.map(r => (
                <Chip key={r} label={r} active={form.discovery === r} onClick={() => update('discovery', r)} />
              ))}
            </div>
          </Field>

          <Field label="Tell us about the home and the life you'd like it to hold">
            <textarea
              rows={5}
              value={form.message}
              onChange={e => update('message', e.target.value)}
              placeholder="The site, the people who'll live there, what's drawing you to the studio, anything that feels relevant…"
              style={{
                ...inputStyle,
                border: `1px solid ${color.hairline}`,
                padding: '14px 16px',
                resize: 'vertical',
                minHeight: 140,
                lineHeight: 1.6
              }}
            />
          </Field>
        </fieldset>

        {/* Submit */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `1px solid ${color.hairline}`,
            paddingTop: 40,
            gap: 24,
            flexWrap: 'wrap'
          }}>
          <Eyebrow size="sm" opacity={0.55} style={{ maxWidth: '46ch', lineHeight: 1.6 }} as="p">
            By submitting, you agree to be contacted regarding your project. Your details remain private and are never shared with third
            parties.
          </Eyebrow>
          <button
            type="submit"
            style={{
              padding: '16px 40px',
              background: color.ink,
              color: color.bg,
              border: 'none',
              borderRadius: 100,
              cursor: 'pointer',
              fontSize: 13,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              fontFamily: 'inherit'
            }}>
            Send Inquiry
          </button>
        </div>
      </Section>
    </>
  );
}
