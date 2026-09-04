const RESEND_API = 'https://api.resend.com/emails';

/** Matches the timeout the ClickUp JSON calls use. */
const REQUEST_TIMEOUT_MS = 10000;

/**
 * Send one transactional email through Resend. A plain `fetch` rather than the SDK, matching `lib/clickup.ts`.
 *
 * Resend wants the `Bearer` prefix on its key; ClickUp wants its token bare. `text` is required — a plain-text
 * alternative is materially less likely to be filtered, which matters most on a domain with no reputation yet.
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
      // Resend's `name` field distinguishes an unverified domain from a bad key; the status alone does not.
      console.error('Resend send failed', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('Could not reach the Resend API', err);
    return false;
  }
}
