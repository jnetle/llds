import { confirmationHtml, confirmationSubject, confirmationText } from '@/lib/inquiryEmail';

/**
 * Local preview for the inquiry confirmation email. **Development only.**
 *
 * Iterating on `COPY` in lib/inquiryEmail.ts through the real form is miserable:
 * every pass means answering 34 questions, and it writes a live ClickUp task.
 * This renders the same builders the server action uses, straight to the browser,
 * with hot reload — edit the copy, refresh, see it.
 *
 * It 404s whenever `NODE_ENV` is `production`, which on Vercel covers Preview
 * deployments as well as Production, so the route never exists anywhere public.
 * Nothing here can send an email; it only renders.
 *
 *   /dev/email-preview                    → the HTML version
 *   /dev/email-preview?format=text        → the plain-text version
 *   /dev/email-preview?name=D%27Angelo    → try a different greeting
 */
export async function GET(request: Request): Promise<Response> {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not found', { status: 404 });
  }

  const params = new URL(request.url).searchParams;
  const name = params.get('name') ?? 'Jane Doe';
  // Fixed by default so a refresh diffs cleanly against the last render.
  const submittedAt = params.get('now') ?? '2026-09-01T14:22:00.000Z';

  if (params.get('format') === 'text') {
    return new Response(`Subject: ${confirmationSubject()}\n\n${confirmationText({ name }, submittedAt)}`, {
      headers: { 'content-type': 'text/plain; charset=utf-8' }
    });
  }

  return new Response(confirmationHtml({ name }, submittedAt), {
    headers: { 'content-type': 'text/html; charset=utf-8' }
  });
}
