import Link from 'next/link';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Grid } from '@/components/ui/Grid';
import { Section } from '@/components/ui/Section';
import { color, text } from '@/lib/tokens';

const WORKING: { h: string; p: string; note?: string }[] = [
  {
    h: 'Communication',
    p: 'Project communication is coordinated through email and scheduled meetings. We work closely with your builder to streamline communication and reduce unnecessary back-and-forth.'
  },
  {
    h: 'Meetings',
    p: 'Design discussions take place during scheduled meetings, where selections are presented in a clear and organized format to support efficient decision-making.'
  },
  {
    h: 'Response Time',
    p: 'Responses are typically provided within 1–2 business days. Time-sensitive construction items are prioritized as needed.'
  },
  {
    h: 'Site Visits',
    p: 'Site visits are scheduled at key project milestones.',
    note: 'Additional site visits requested outside of these milestones are billed separately.'
  },
  {
    h: 'Revisions',
    p: 'One round of revisions is included per phase and consists of refinements within the established design direction.',
    note: 'Additional revisions, redesigns, or expanded scope will be billed separately.'
  },
  {
    h: 'Project Flow',
    p: 'Timely decisions and approvals are essential to maintaining the construction schedule. Delays in selections or changes after approval may impact overall project timelines.'
  }
];

export default function WorkingTogetherPage() {
  return (
    <>
      {/* Clears the fixed global header — this page has no full-bleed hero to sit under it. */}
      <Section padTop="lg" padBottom="sm" style={{ borderBottom: `1px solid ${color.hairline}` }}>
        <div style={{ marginBottom: 80 }}>
          <Eyebrow style={{ marginBottom: 22 }}>— Working Together</Eyebrow>
          <h1
            className="serif"
            style={{
              fontSize: 'clamp(56px, 7vw, 130px)',
              fontWeight: 300,
              lineHeight: 0.95,
              letterSpacing: '-0.018em',
              textTransform: 'uppercase',
              marginBottom: 38,
              marginTop: 0,
              maxWidth: '14ch',
              textWrap: 'balance'
            }}>
            Working Together
          </h1>
          <p style={{ ...text.body, maxWidth: '58ch' }}>
            A clear and structured approach allows the project to move forward efficiently while maintaining alignment between client,
            builder, and design.
          </p>
        </div>

        <Grid cols="1.4fr 1fr" gap={90} alignItems="start">
          <Grid cols="repeat(2, 1fr)" columnGap={60} rowGap={0}>
            {WORKING.map((w, i) => (
              <div
                key={w.h}
                style={{
                  borderTop: `1px solid ${color.hairline}`,
                  borderBottom: i >= WORKING.length - 2 ? `1px solid ${color.hairline}` : 'none',
                  padding: '28px 0 32px'
                }}>
                <h2 className="micro" style={{ marginBottom: 16, marginTop: 0, letterSpacing: '0.22em' }}>
                  {w.h}
                </h2>
                <p style={{ ...text.bodySm, lineHeight: 1.65 }}>{w.p}</p>
                {w.note && (
                  <p
                    style={{
                      marginTop: 12,
                      fontSize: 14,
                      fontWeight: 500,
                      color: color.ink,
                      lineHeight: 1.6
                    }}>
                    — {w.note}
                  </p>
                )}
              </div>
            ))}
          </Grid>

          <div style={{ display: 'grid', gap: 22, position: 'sticky', top: 120 }}>
            <div
              style={{
                aspectRatio: '4/5',
                backgroundImage: 'url("https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div
              style={{
                aspectRatio: '4/3',
                backgroundImage: 'url("https://images.unsplash.com/photo-1620228885847-9eab2a1adddc?auto=format&fit=crop&w=1200&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          </div>
        </Grid>
      </Section>

      {/* CTA — same shape as the Services page close. */}
      <Section padTop="md" padBottom="xl" style={{ textAlign: 'center' }}>
        <div
          className="serif"
          style={{
            fontSize: 'clamp(20px, 2vw, 28px)',
            fontStyle: 'italic',
            fontWeight: 300,
            opacity: 0.7,
            marginBottom: 24
          }}>
          Begin your project
        </div>
        <div style={{ display: 'inline-flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/inquire" className="micro" style={{ padding: '14px 26px', border: `1px solid ${color.ink}`, borderRadius: 100 }}>
            Schedule an initial meeting
          </Link>
          <Link
            href="/services"
            className="micro"
            style={{ padding: '14px 26px', border: `1px solid ${color.hairline}`, borderRadius: 100 }}>
            View services
          </Link>
        </div>
      </Section>
    </>
  );
}
