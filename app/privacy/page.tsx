import type { ReactNode } from 'react';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Heading';
import { color, space, text } from '@/lib/tokens';
import { SITE } from '@/lib/site';

/** Bump when the substance below changes, not for a typo. */
const UPDATED = 'September 3, 2026';

/** Prose measure, narrower than the site's usual 1100 — this page is read, not scanned. */
const MEASURE = 720;

function Clause({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: space[8] }}>
      <Heading level="card" as="h2" style={{ marginBottom: space[4] }}>
        {title}
      </Heading>
      <div style={{ display: 'grid', gap: space[4] }}>{children}</div>
    </section>
  );
}

function Prose({ children }: { children: ReactNode }) {
  return <p style={{ ...text.body, margin: 0 }}>{children}</p>;
}

function DefinitionList({ items }: { items: { term?: string; body: ReactNode }[] }) {
  return (
    <ul style={{ listStyle: 'none', display: 'grid', gap: space[3], margin: 0, padding: 0 }}>
      {items.map((it, i) => (
        <li key={i} style={{ ...text.body, margin: 0, display: 'flex', gap: 14, alignItems: 'baseline' }}>
          <span aria-hidden style={{ width: 18, height: 1, background: color.hairline, flex: 'none', transform: 'translateY(-5px)' }} />
          <span>
            {it.term && <span style={{ color: color.ink }}>{it.term} — </span>}
            {it.body}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** `a` is reset to `color: inherit; text-decoration: none` globally, so an inline link restates both. */
function TextLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith('http');
  const style = { color: color.ink, borderBottom: `1px solid ${color.hairline}` };
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
      {children}
    </a>
  ) : (
    <Link href={href} style={style}>
      {children}
    </Link>
  );
}

export default function PrivacyPage() {
  // The same gate app/layout.tsx uses for the gtag script, so the policy only claims analytics when the site runs it.
  // Both routes prerender, so the script tag and the paragraph describing it come out of one build and cannot disagree.
  const analyticsEnabled = Boolean(process.env.GA_MEASUREMENT_ID);

  // padTop `md` matches --scroll-offset, the clearance the rest of the site assumes for the fixed header.
  return (
    <Section padTop="md" padBottom="xl">
      <Container maxWidth={MEASURE} align="left">
        <Eyebrow size="md">— Legal</Eyebrow>

        <Heading level="display" style={{ marginTop: space[5] }}>
          Privacy Policy
        </Heading>

        <Eyebrow size="sm" opacity={0.5} style={{ marginTop: space[5] }}>
          Last updated {UPDATED}
        </Eyebrow>

        <div style={{ marginTop: space[6] }}>
          <Prose>
            {SITE.name} is a small interior design practice. This page describes what this website collects, why, and which services see it.
            There is no mailing list behind it and nothing collected here is sold.
          </Prose>
        </div>

        <Clause title="What you give us">
          <Prose>
            The <TextLink href="/inquire">inquiry form</TextLink> is the only place this site asks you for anything. It collects your name
            and email address, your phone number if you choose to give one, and your answers about the project — the property, the scope,
            the budget range, the timeline, and your preferences.
          </Prose>
          <Prose>
            A submission is filed to the studio&rsquo;s project management system so we can read and reply to it, and a copy of your answers
            is emailed back to the address you gave as confirmation. We use it to answer your inquiry and, if we go on to work together, to
            run the project. Nothing about it is automated beyond that — a person reads every one.
          </Prose>
        </Clause>

        <Clause title="What is collected automatically">
          <Prose>
            Our host keeps standard server logs — IP address, browser, and the page requested — for security and troubleshooting. The
            inquiry form also holds your IP address in memory for about an hour after a submission, purely to limit how many confirmation
            emails a single sender can trigger. Neither is used to identify you.
          </Prose>
          {analyticsEnabled && (
            <Prose>
              We also use Google Analytics to understand which pages people read and how they arrived. It records page views, device type,
              referring site, and an approximate city derived from your IP address. It is configured for measurement only: no advertising
              features, no linked ad account, and nothing that follows you to other sites.
            </Prose>
          )}
        </Clause>

        <Clause title="Cookies">
          {analyticsEnabled ? (
            <>
              <Prose>
                Cookies are small files a website stores in your browser. This site sets one kind: the first-party cookies Google Analytics
                uses to tell a returning visit from a new one (<code>_ga</code> and <code>_ga_*</code>, which last up to two years). It sets
                no advertising cookies, and it does not use cookies to identify you.
              </Prose>
              <Prose>
                None of them are necessary for the site to work. Block or clear cookies in your browser settings and every page still
                renders exactly as it should. To opt out of Google Analytics everywhere, Google publishes a{' '}
                <TextLink href="https://tools.google.com/dlpage/gaoptout">browser opt-out add-on</TextLink>.
              </Prose>
            </>
          ) : (
            <Prose>
              This site sets no cookies. It has no accounts, no advertising, and no analytics — nothing that needs to remember your browser
              between visits.
            </Prose>
          )}
        </Clause>

        <Clause title="Who else handles it">
          <Prose>
            Running the site and answering an inquiry involves a few outside services, each seeing only what its job requires: the host that
            serves these pages, the network that delivers the photography, the system where an inquiry is filed as a project record, and the
            service that sends your confirmation email.
          </Prose>
          {analyticsEnabled && <Prose>Site measurement is Google Analytics, as described above.</Prose>}
          <Prose>
            None of them are given your information for their own marketing. We do not sell personal information, and we do not share it for
            cross-context behavioural advertising. We would disclose it only if the law required it.
          </Prose>
        </Clause>

        <Clause title="How long it is kept">
          <DefinitionList
            items={[
              {
                term: 'Inquiries',
                body: 'are kept as project records for as long as we might reasonably need them, or until you ask us to delete them.'
              },
              ...(analyticsEnabled
                ? [{ term: 'Analytics', body: 'is retained by Google for no more than 14 months, then deleted automatically.' }]
                : []),
              { term: 'Server logs and rate-limit records', body: 'are short-lived — hours, not months.' }
            ]}
          />
        </Clause>

        <Clause title="Your choices">
          <Prose>
            You can ask us what we hold about you, ask us to correct it, or ask us to delete it — get in touch and we will, whatever state
            you live in. Several states, California, Colorado, Connecticut and Virginia among them, give residents those rights formally; we
            would rather not make the distinction.
          </Prose>
          <Prose>
            {analyticsEnabled
              ? 'To stop analytics from counting your visits, use your browser’s cookie controls or Google’s opt-out add-on linked above.'
              : 'There is nothing to opt out of here — the site does not track visitors.'}
          </Prose>
        </Clause>

        <Clause title="Links elsewhere">
          <Prose>
            We link out to the studio&rsquo;s social profiles and, occasionally, to published work. Once you follow one of those links you
            are on someone else&rsquo;s site, under their privacy policy rather than this one.
          </Prose>
        </Clause>

        <Clause title="Changes">
          <Prose>
            If this policy changes in substance we will revise the date at the top of the page. Material changes will be described here
            rather than made quietly.
          </Prose>
        </Clause>

        <Clause title="Contact">
          <Prose>
            Questions about any of this, or a request about your own information, can go through the{' '}
            <TextLink href="/inquire">inquiry form</TextLink>
            {/* SITE.email is empty on purpose; fill it in and this sentence picks it up, as studioSchema() does. */}
            {SITE.email ? (
              <>
                {' '}
                or straight to <TextLink href={`mailto:${SITE.email}`}>{SITE.email}</TextLink>.
              </>
            ) : (
              <> — mark it for the studio and it will reach the right person.</>
            )}
          </Prose>
        </Clause>
      </Container>
    </Section>
  );
}
