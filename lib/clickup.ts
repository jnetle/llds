const CLICKUP_API = 'https://api.clickup.com/api/v2';

/** Matches the timeout the previous Sheets webhook used. */
const REQUEST_TIMEOUT_MS = 10000;

export type ClickUpResult = { ok: true; taskId: string } | { ok: false };

/**
 * Create one task in a ClickUp list.
 *
 * Auth is a personal API token (`pk_…`) sent bare in `Authorization` — ClickUp
 * does not want a `Bearer` prefix for these. `markdown_content` carries the
 * rendered body and overrides `description` when both are present; we send
 * `description` too so the content still lands as plain text if that field is
 * ever renamed out from under us.
 *
 * Failures are logged with ClickUp's own `err`/`ECODE` (a bad list id and a bad
 * token are indistinguishable from the status alone) and reported to the caller
 * as a bare `{ ok: false }` — nothing from ClickUp reaches the visitor.
 */
export async function createInquiryTask(args: { token: string; listId: string; name: string; markdown: string }): Promise<ClickUpResult> {
  const { token, listId, name, markdown } = args;

  try {
    const res = await fetch(`${CLICKUP_API}/list/${encodeURIComponent(listId)}/task`, {
      method: 'POST',
      headers: {
        Authorization: token,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        name,
        markdown_content: markdown,
        description: markdown
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('ClickUp task creation failed', res.status, detail);
      return { ok: false };
    }

    const body = (await res.json().catch(() => null)) as { id?: string } | null;
    if (!body?.id) {
      console.error('ClickUp returned 2xx with no task id', body);
      return { ok: false };
    }

    return { ok: true, taskId: body.id };
  } catch (err) {
    // Network failure or the 10s timeout tripping.
    console.error('Could not reach the ClickUp API', err);
    return { ok: false };
  }
}
