const CLICKUP_API = 'https://api.clickup.com/api/v2';

const REQUEST_TIMEOUT_MS = 10000;

/** Uploads carry bytes, so they get more room than the JSON calls. */
const UPLOAD_TIMEOUT_MS = 20000;

export type ClickUpResult = { ok: true; taskId: string } | { ok: false };

/**
 * Create one task in a ClickUp list.
 *
 * The `pk_…` personal token goes bare in `Authorization` — ClickUp rejects a `Bearer` prefix. `markdown_content`
 * overrides `description` when both are sent; `description` is sent anyway so the content survives a field rename.
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
    console.error('Could not reach the ClickUp API', err);
    return { ok: false };
  }
}

/**
 * Attach a file to an existing task — necessarily a second call, as ClickUp cannot create a task with an attachment.
 *
 * Do not set `Content-Type`: `fetch` writes it with the multipart boundary, and setting it by hand yields a body
 * ClickUp cannot parse.
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
    // BlobPart rejects a Node Buffer (typed Uint8Array<ArrayBufferLike>, so possibly SharedArrayBuffer-backed).
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

/** Rewrite a task's description — used only to restore the full questionnaire when the PDF upload failed. */
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
