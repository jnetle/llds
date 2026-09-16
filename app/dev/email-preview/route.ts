import { isProduction } from '@/lib/env';
import { confirmationHtml, confirmationSubject, confirmationText } from '@/lib/inquiryEmail';
import { requestHtml, requestSubject, requestText } from '@/lib/pieceEmail';

/**
 * Local preview for the transactional emails — renders the same builders the server actions use, with hot reload, so
 * iterating on `COPY` doesn't mean answering 34 questions and writing a live ClickUp task each pass.
 *
 * 404s whenever `NODE_ENV` is `production`, which covers Vercel Preview as well as Production.
 *
 *   /dev/email-preview                      → the inquiry confirmation, HTML
 *   /dev/email-preview?format=text          → the plain-text version
 *   /dev/email-preview?name=D%27Angelo      → try a different greeting
 *   /dev/email-preview?template=piece       → the piece request confirmation
 *   /dev/email-preview?template=piece&piece=Ashby%20Sconce&brand=Visual%20Comfort%20%26%20Co.
 *
 * Both templates take a `name` here rather than a whole submission, which is why each exposes a narrow `Recipient`
 * type. The piece one also takes a name and a brand — an ampersand in the brand is the case worth checking, since it
 * is escaped in the HTML part and must stay raw in the text part.
 */
export async function GET(request: Request): Promise<Response> {
  if (isProduction) {
    return new Response('Not found', { status: 404 });
  }

  const params = new URL(request.url).searchParams;
  const name = params.get('name') ?? 'Jane Doe';
  // Fixed by default so a refresh diffs cleanly against the last render.
  const submittedAt = params.get('now') ?? '2026-09-01T14:22:00.000Z';
  const asText = params.get('format') === 'text';

  if (params.get('template') === 'piece') {
    const piece = {
      name: params.get('piece') ?? 'Ashby Plaster Sconce',
      brand: params.get('brand') ?? 'Visual Comfort & Co.'
    };

    if (asText) {
      return new Response(`Subject: ${requestSubject()}\n\n${requestText({ name }, piece, submittedAt)}`, {
        headers: { 'content-type': 'text/plain; charset=utf-8' }
      });
    }

    return new Response(requestHtml({ name }, piece, submittedAt), {
      headers: { 'content-type': 'text/html; charset=utf-8' }
    });
  }

  if (asText) {
    return new Response(`Subject: ${confirmationSubject()}\n\n${confirmationText({ name }, submittedAt)}`, {
      headers: { 'content-type': 'text/plain; charset=utf-8' }
    });
  }

  return new Response(confirmationHtml({ name }, submittedAt), {
    headers: { 'content-type': 'text/html; charset=utf-8' }
  });
}
