const RESEND_API = 'https://api.resend.com/emails';

/** Matches the timeout the ClickUp JSON calls use. */
const REQUEST_TIMEOUT_MS = 10000;

/**
 * Send one transactional email through Resend.
 *
 * Deliberately a plain `fetch` rather than the `resend` SDK — the whole surface
 * area we need is a single POST, and `lib/clickup.ts` already establishes that
 * an integration here is a thin fetch wrapper with its own timeout.
 *
 * Auth is a sending API key (`re_…`) sent as a bearer token. Note the contrast
 * with ClickUp, which wants its personal token bare: Resend *does* want the
 * `Bearer` prefix.
 *
 * `text` is not optional. A multipart message with a plain-text alternative is
 * materially less likely to be filtered than an HTML-only one, which matters
 * most on a sending domain that has no reputation yet.
 *
 * Failures are logged with Resend's own error body and reported as `false` —
 * nothing from Resend reaches the visitor.
 */
export async function sendEmail(args: {
  apiKey: string;
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const { apiKey, from, to, replyTo, subject, html, text } = args;

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
        ...(replyTo ? { reply_to: [replyTo] } : {})
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });

    if (!res.ok) {
      // Resend answers with { statusCode, name, message }; the name distinguishes
      // an unverified domain from a bad key, which the status alone does not.
      console.error('Resend send failed', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    // Network failure or the 10s timeout tripping.
    console.error('Could not reach the Resend API', err);
    return false;
  }
}
