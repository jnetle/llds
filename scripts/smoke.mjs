#!/usr/bin/env node
// Smoke test against a running production server (`npm run build && npm start`).
//
//   node scripts/smoke.mjs [baseUrl]        # default http://localhost:3000
//
// Fetches every page listed in /sitemap.xml plus a few routes the sitemap does not list (robots, OG images, a 404),
// and fails if any returns the wrong status or renders without an <h1>. `next build` proves the pages compile and
// prerender; this proves the built server actually serves them, which is what a framework or React bump can break
// without failing the build. The sitemap is the route list on purpose: publishing a project adds it here for free.

const base = (process.argv[2] ?? process.env.SMOKE_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const TIMEOUT_MS = 30_000;

async function get(path) {
  const res = await fetch(base + path, { redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT_MS) });
  const type = res.headers.get('content-type') ?? '';
  const body = type.startsWith('text/') || type.includes('xml') ? await res.text() : Buffer.from(await res.arrayBuffer());
  return { status: res.status, type, body };
}

/** Wait for `next start` to accept connections — CI starts it in the background a moment before this runs. */
async function waitForServer() {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      await fetch(base + '/robots.txt', { signal: AbortSignal.timeout(2_000) });
      return;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  throw new Error(`Server at ${base} did not come up within 60s`);
}

const failures = [];
const check = (ok, label, detail) => {
  console.log(`${ok ? '✓' : '✗'} ${label}${ok ? '' : ` — ${detail}`}`);
  if (!ok) failures.push(label);
};

await waitForServer();

// Sitemap URLs carry the configured site origin (NEXT_PUBLIC_SITE_URL), which in CI is not this server.
const sitemap = await get('/sitemap.xml');
check(sitemap.status === 200, 'GET /sitemap.xml', `status ${sitemap.status}`);
const pages = [...String(sitemap.body).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => {
  const u = new URL(m[1]);
  return u.pathname + u.search;
});
check(pages.length > 0, 'sitemap lists pages', 'no <loc> entries');

// Every distinct og:image the pages point at — read off the HTML rather than guessed, since image routes with
// `generateImageMetadata` carry an id segment and a cache-busting query.
const ogImages = new Set();

for (const path of [...new Set(pages)]) {
  try {
    const { status, type, body } = await get(path);
    const ok = status === 200 && type.includes('text/html') && /<h1[\s>]/.test(body);
    check(ok, `GET ${path}`, `status ${status}, ${type}${status === 200 ? ', no <h1>' : ''}`);
    const og = /<meta property="og:image" content="([^"]+)"/.exec(String(body));
    if (og) {
      const u = new URL(og[1].replaceAll('&amp;', '&'));
      ogImages.add(u.pathname + u.search);
    }
  } catch (err) {
    check(false, `GET ${path}`, err.message);
  }
}
check(ogImages.size > 0, 'pages declare og:image', 'no og:image meta found');

const extras = [
  { path: '/robots.txt', status: 200, type: 'text/plain' },
  { path: '/__smoke-test-missing-route__', status: 404, type: 'text/html' },
  ...[...ogImages].map(path => ({ path, status: 200, type: 'image/png' }))
];

for (const { path, status, type } of extras) {
  try {
    const res = await get(path);
    const ok = res.status === status && res.type.includes(type);
    check(ok, `GET ${path} → ${status}`, `got ${res.status}, ${res.type}`);
  } catch (err) {
    check(false, `GET ${path} → ${status}`, err.message);
  }
}

if (failures.length) {
  console.error(`\n${failures.length} smoke check(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${pages.length + extras.length + 3} smoke checks passed.`);
