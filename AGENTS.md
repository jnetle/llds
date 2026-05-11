# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commands

```bash
npm run dev          # Start dev server (Turbopack by default)
npm run build        # Production build (Turbopack by default)
npm start            # Start production server
npm run lint         # ESLint (--max-warnings=0) + scripts/check-css.mjs
npm run check:css    # CSS guard alone (forbidden patterns in app/globals.css)
npm run typecheck    # tsc --noEmit (no script runs this implicitly — run before opening a PR; reviewers can't catch type errors otherwise)
npm run format       # Format the repo with Prettier
npm run format:check # Verify formatting without writing
```

There are no tests configured yet.

## Pre-commit hook

Husky + lint-staged is wired up. On every `git commit`, `.husky/pre-commit` runs `npx lint-staged`, which on staged files only:

1. `eslint --fix --max-warnings=0` on `*.{ts,tsx,js,mjs}` — auto-strips unused imports, fails commit on any remaining warning
2. `prettier --write` on the same files plus `*.{json,md,css}`

Fixed files are re-staged automatically. Husky installs via the `prepare` script on `npm install` — no manual setup for new contributors.

**Bypassing**: `git commit --no-verify` skips the hook. Reserve for true WIP; the assumption is shared code passes lint.

**Don't run full-repo lint in the hook.** Lint-staged is scoped on purpose — keep it fast so people don't reach for `--no-verify`. CI (when added) is the right place for full-repo `lint` / `format:check` / `typecheck`.

## Linting

ESLint flat config in `eslint.config.mjs` extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`, plus `eslint-plugin-unused-imports`:

- `unused-imports/no-unused-imports`: **error** (auto-fixable). The Next.js preset's `@typescript-eslint/no-unused-vars` is disabled in favor of this — it catches the same things but separates imports from locals so imports can be auto-stripped.
- `unused-imports/no-unused-vars`: **warning**. Prefix unused names with `_` to silence (e.g. `_unusedArg`).
- `npm run lint` uses `--max-warnings=0`, so any warning fails CI/lint. Don't commit code with lingering warnings — fix or `_`-prefix.

## Formatting

Prettier is the source of truth for formatting. Config lives in `.prettierrc.json`; ignore list in `.prettierignore`. The pre-commit hook runs Prettier on staged files automatically; use `npm run format` for ad-hoc full-repo runs and `npm run format:check` in CI. Active rules:

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

Next.js 16.2 App Router project with TypeScript and React 19.2. Tailwind CSS v4 is installed and configured, but utility-class usage is limited to a handful of shell utilities in `app/layout.tsx` (`min-h-full`, `flex`, `flex-col`, `flex-1`). The rest of the codebase uses the design system below — do not migrate inline styles to Tailwind utilities.

- `app/` — App Router: all routes, layouts, and pages live here
- `app/layout.tsx` — root layout; loads Cormorant Garamond (serif) and Inter (sans) via `next/font/google` and exposes them as the `--font-cormorant` / `--font-inter` CSS vars
- `app/page.tsx` — home route (`/`)
- `components/ui/` — design system primitives (`Section`, `Grid`, `Container`, `Heading`, `Eyebrow`)
- `components/` — feature components (`Header`, `Footer`, `HeroGrid`, `GridCell`, `ProjectsGrid`, `ProjectDetail`, `StatementSection`, `ProjectStrip`, `Wordmark`, `HomeShell`)
- `hooks/` — React hooks, one per file. File name matches the hook name (e.g. `useScrollY.ts` exports `useScrollY`). Import as `@/hooks/useFoo`. Do not bundle multiple hooks into a single file.
- `lib/tokens.ts` — single source of truth for color, spacing, typography, motion tokens
- `public/` — static assets served at `/`
- Path alias `@/` maps to the repo root

ESLint uses the flat config format (`eslint.config.mjs`) with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. The legacy `.eslintrc` format is not used.

## Design system

The codebase has a small, opinionated design system. Prefer it over new CSS or ad-hoc inline styles. Spacing changes should be one-line edits — to a token in `lib/tokens.ts` or a prop on a primitive. If you're reaching for new CSS rules to fix spacing, something is wrong.

**Tokens — `lib/tokens.ts`:**

- `color` — `{ bg, ink, inkSoft, hairline, divider }`. All resolve via CSS vars (`var(--bg)` etc.).
- `text` — `{ display, section, card, body, bodySm }`. Spread into a style: `style={{ ...text.body }}`.
- `motion` — `{ ease, durFast, durMed, durSlow, durXSlow }`. Compose into transitions: `` transition: `opacity ${motion.durMed} ${motion.ease}` ``.
- `sectionPadY` — `{ none, xxs, xs, sm, md, lg, xl, '2xl' }`, each `{ d, m }`. Desktop values are 0/60/80/120/140/160/180/200; mobile values follow ~40% ratio (0/24/32/48/56/64/72/80). Consumed by `<Section>` — rarely used directly.
- `gutter` — `{ d: '8vw', m: '24px' }`. Consumed by `<Section>` and `<Grid>`.
- `space` — px scale (4, 8, 14, 22, 32, 48, 60, 80, 100, 140, 180). Use for one-off spacing.

**Primitives — `components/ui/`:**

- `<Section>` — page section wrapper. Owns vertical padding (preset `padY` or `padTop`/`padBottom`), horizontal gutter, optional `topBorder`, and the desktop/mobile padding split via `useCompact(600)`. `as` accepts `'section' | 'div' | 'article' | 'header' | 'footer' | 'form'`. Forwards `ref` and inherits `HTMLAttributes` (so `onSubmit`, `aria-*`, `id`, etc. flow through).
- `<Grid>` — responsive grid. `cols` accepts a string (auto-collapses to `'1fr'` at ≤1024px, like the `useCols` pattern) or `{ d, t?, m }` for explicit per-tier control where `t` falls back to `m`. `gap`/`rowGap`/`columnGap` take the same form. Replaces inline `gridTemplateColumns: cols(...)` patterns.
- `<Container>` — max-width content wrapper with optional `align: 'left' | 'center'`. Used inside `<Section>` for capped editorial widths (e.g. `maxWidth={1100}` or `1400`).
- `<Heading>` — `level: 'display' | 'section' | 'card'` drives the typography token. `as` overrides the rendered tag (defaults: display→h1, section→h2, card→h3). `italic` and `serif` (default `true`) handle common variants. Style overrides win over level defaults.
- `<Eyebrow>` — wraps the `.micro` / `.micro-sm` + opacity pattern (used 40+ times across the site). `size: 'sm' | 'md'`, `opacity` defaults to 0.55.

**When to use raw elements instead of primitives:**

- **Bespoke poster typography** (e.g. Press hero h1 at `clamp(96px, 16vw, 280px)`, Services hero at 132px). Forcing through `<Heading>` with style overrides for every property defeats the point. Use raw `<h1 className="serif" style={{ ..., margin: 0 }}>`.
- **Bespoke gutters** (`ProjectsGrid` uses 32px desktop / 20px mobile to maximize tile width; `ProjectDetail`'s top-bar and footer-nav use 36px to align with the global header). `<Section>`'s `8vw` desktop gutter would crop content too tightly. Use a raw `<section>` / `<div>` and apply tokens for color/motion.
- **Full-bleed heroes** (Services hero at `100vh` with absolute-positioned content). `<Section>` is for padded content blocks, not edge-to-edge layout.

## CSS pitfalls (regression-guarded)

- **Never** apply `overflow: hidden` (or `overflow-x` / `overflow-y: hidden`) to `html`, `body`, or `:root`. It creates a scroll container and silently disables `position: sticky` on every descendant. The Services page quick-links nav (`app/services/page.tsx`) is the canary — if it stops sticking, suspect this rule first. `npm run lint` enforces this via `scripts/check-css.mjs`.
- To suppress horizontal overflow at the root, use `overflow-x: clip` instead. Per spec, `clip` hides overflowing content without becoming a scroll container, so sticky positioning of descendants still works. `body { overflow-x: clip }` is the current setup in `globals.css` and is intentional.
- If a specific component (not the root) is overflowing, prefer fixing the source: `width: 100%`, `min-width: 0`, `flex-basis: min(<px>, <vw>)`, or scoped `overflow: hidden` on a container that is not an ancestor of any sticky element.
- Layout responsiveness is fully JS-driven. Use `useCompact()` (default `(max-width: 1024px)`) and the `useCols()` helper from `hooks/useCompact.ts` to switch grid templates between desktop and tablet/mobile values. Section vertical padding and gutter are owned by the `<Section>` primitive (`components/ui/Section.tsx`) which uses `useCompact(600)` for the desktop/mobile split. Token presets live in `lib/tokens.ts` (`sectionPadY`, `gutter`, `text`, `motion`, `color`).
- A handful of mobile-only CSS rules remain in `app/globals.css` (≤600px): hero height clamps for `section[style*='height: 100vh']`, the services quick-links sticky nav scroll behaviour, header padding, the `header > div > nav { display: none }` rule that's load-bearing for the compact Header layout, and a few accessibility/typography defaults. Anything relying on inline-style attribute selectors for grids or padding has been removed — those concerns now live in the design system primitives.

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
