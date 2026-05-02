# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server (Turbopack by default)
npm run build        # Production build (Turbopack by default)
npm start            # Start production server
npm run lint         # Run ESLint (uses eslint CLI directly — not next lint)
npm run format       # Format the repo with Prettier
npm run format:check # Verify formatting without writing
```

There are no tests configured yet.

## Formatting

Prettier is the source of truth for formatting. Config lives in `.prettierrc.json`; ignore list in `.prettierignore`. Run `npm run format` after edits, or `npm run format:check` in CI. Active rules:

- `semi: true` — terminate statements with semicolons
- `tabWidth: 2`
- `singleQuote: true` — single quotes in JS/TS (JSX attrs still use double per Prettier defaults)
- `printWidth: 140`
- `trailingComma: "none"`
- `arrowParens: "avoid"` — `x => x` instead of `(x) => x` for single-arg arrows
- `bracketSameLine: true` — keep `>` of multi-line JSX tags on the last prop line
- `bracketSpacing: true` — `{ foo }` not `{foo}`

## Deployment

This project deploys to Vercel. Prefer Vercel-compatible patterns: avoid long-running Node processes, use edge-safe APIs where possible, and keep environment variables in Vercel project settings (not committed `.env` files).

## Images

Raster images live in `public/images/` and are served via Vercel's edge CDN at no extra cost. Current Unsplash URLs are **placeholders** — replace with local paths as real assets arrive.

**Directory layout:**
```
public/images/
  projects/<project-slug>/cover.jpg, gallery-1.jpg, …
  about/hero.jpg
  press/award-1.jpg, …
```

**Rules:**
- Use `next/image` (not CSS `backgroundImage`) — it handles lazy loading, WebP conversion, and responsive `srcSet` automatically
- Compress images before committing: target ≤ 200 KB per image, max 1600–2400 px wide
- Prefer `.jpg` for photos; `next/image` will re-serve as WebP on the fly
- SVGs stay in `public/` (not `public/images/`) as they are now

## Architecture

Next.js 16.2 App Router project with TypeScript, Tailwind CSS v4, and React 19.2.

- `app/` — App Router: all routes, layouts, and pages live here
- `app/layout.tsx` — root layout; wraps every page with Geist fonts and base Tailwind classes
- `app/page.tsx` — home route (`/`)
- `hooks/` — React hooks, one per file. File name matches the hook name (e.g. `useScrollY.ts` exports `useScrollY`). Import as `@/hooks/useFoo`. Do not bundle multiple hooks into a single file.
- `public/` — static assets served at `/`
- Path alias `@/` maps to the repo root

ESLint uses the flat config format (`eslint.config.mjs`) with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. The legacy `.eslintrc` format is not used.

## Next.js 16 Breaking Changes to Know

**Async Request APIs** — `cookies()`, `headers()`, `draftMode()`, route `params`, and page `searchParams` are all async. Always `await` them:

```ts
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
}
```

Run `npx next typegen` to generate `PageProps`, `LayoutProps`, and `RouteContext` helpers for type-safe async props.

**Linting** — `next lint` is removed. Use `eslint` directly (`npm run lint`). `next build` no longer runs linting automatically.

**Proxy (formerly Middleware)** — request interception files must be named `proxy.ts` / `proxy.js` and export a function named `proxy`. The `edge` runtime is not supported in proxy; use `middleware.ts` if you need `edge`.

**Caching APIs**

- `revalidateTag(tag)` now requires a second `cacheLife` profile argument: `revalidateTag('posts', 'max')`
- `unstable_cacheLife` / `unstable_cacheTag` are now stable: import as `cacheLife` / `cacheTag`
- `updateTag` is new: use it in Server Actions for immediate cache invalidation (read-your-writes semantics)
- PPR is now `cacheComponents: true` in `next.config.ts` (not `experimental.ppr`)

**Parallel Routes** — all `@slot` directories require an explicit `default.js`/`default.tsx` file or builds will fail.

**Image component**

- `next/legacy/image` is deprecated; use `next/image`
- `images.domains` is deprecated; use `images.remotePatterns`
- Local images with query strings require `images.localPatterns.search` config

**Removed** — `serverRuntimeConfig`, `publicRuntimeConfig`, AMP support, `devIndicators.appIsrStatus/buildActivity/buildActivityPosition`, `experimental.dynamicIO` (replaced by `cacheComponents`).
