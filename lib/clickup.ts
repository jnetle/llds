const CLICKUP_API = 'https://api.clickup.com/api/v2';

/** Matches the timeout the previous Sheets webhook used. */
const REQUEST_TIMEOUT_MS = 10000;

/** Uploads carry bytes, so they get more room than the JSON calls. */
const UPLOAD_TIMEOUT_MS = 20000;

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

/**
 * Attach a file to an existing task. Has to be a second call — ClickUp has no
 * way to create a task with an attachment in one request.
 *
 * `Content-Type` is deliberately not set: `fetch` writes it itself, including
 * the multipart boundary, and setting it by hand produces a body ClickUp cannot
 * parse. Uploads get a longer timeout than the JSON calls since they carry bytes.
 */
export async function attachFileToTask(args: {
  token: string;
  taskId: string;
  filename: string;
  bytes: Uint8Array;
  contentType?: string;
}): Promise<boolean> {
  const { token, taskId, filename, bytes, contentType = 'application/pdf' } = args;

  try {
    // Copy into a plainly ArrayBuffer-backed view. A Node Buffer is typed as
    // Uint8Array<ArrayBufferLike>, which BlobPart will not accept because it
    // could in principle be SharedArrayBuffer-backed.
    const body = new Uint8Array(bytes.byteLength);
    body.set(bytes);

    const form = new FormData();
    form.append('attachment', new Blob([body], { type: contentType }), filename);

    const res = await fetch(`${CLICKUP_API}/task/${encodeURIComponent(taskId)}/attachment`, {
      method: 'POST',
      headers: { Authorization: token },
      body: form,
      signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS)
    });

    if (!res.ok) {
      console.error('ClickUp attachment upload failed', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('Could not upload the attachment to ClickUp', err);
    return false;
  }
}

/**
 * Rewrite a task's description. Used only to restore the full questionnaire when
 * the PDF upload failed, so the answers are never absent from ClickUp entirely.
 */
export async function updateTaskDescription(args: { token: string; taskId: string; markdown: string }): Promise<boolean> {
  const { token, taskId, markdown } = args;

  try {
    const res = await fetch(`${CLICKUP_API}/task/${encodeURIComponent(taskId)}`, {
      method: 'PUT',
      headers: { Authorization: token, 'content-type': 'application/json' },
      body: JSON.stringify({ markdown_content: markdown, description: markdown }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });

    if (!res.ok) {
      console.error('ClickUp description update failed', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('Could not update the ClickUp task description', err);
    return false;
  }
}
