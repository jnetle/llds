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

Raster photos are hosted on **Cloudflare R2** (chosen for zero egress fees) behind a CDN
domain. Today the **About** page loads its profile photos directly from R2 (see the
`pub-….r2.dev` URLs in `app/about/page.tsx`); **project** imagery is still on the Unsplash
placeholder pool in `lib/projects.ts` and will migrate to R2 under the slug convention
below as real assets are uploaded. **SVGs** (logo, UI icons) stay in `public/` as
versioned code assets — they are not hosted on R2.

**Bucket layout (single bucket, feature-first).** Keys are lowercase kebab-case,
use descriptive slugs (never camera/Unsplash IDs), and have stable filenames so URLs
are deterministic from data:

```
<NEXT_PUBLIC_IMG_BASE>/
  projects/<slug>/cover.jpg
  projects/<slug>/gallery-1.jpg … gallery-3.jpg      # slugs = PROJECT_META ids in lib/projects.ts
  about/profile-1.jpg … profile-3.jpg                # profile shots
  about/hero.jpg                                       # if/when added
  press/awards/<award-slug>.jpg                        # one per award
  press/gallery/1.jpg … N.jpg                          # the strip, in order (5 today)
  press/magazine/cover.jpg                             # the issue cover
  press/magazine/page-1.jpg … page-4.jpg               # the spread, in reading order
  press/magazine/hh-masthead.png                       # the publication's own lockup
  press/magazine/portrait.jpg                          # the designer in the featured room
  services/<section-slug>/hero.jpg                     # one per Services section
  shared/…                                             # genuine cross-page one-offs
```

**Rules:**

- Folder = feature/route; leaf = role (`cover`, `hero`, `gallery-N`, `profile-N`). Numbered variants are plain 1-based.
- Compress before upload with `node scripts/compress-images.mjs <in> <out>`: target ≤ 200 KB per image, max 2400 px wide, output `.jpg`.
- **Magazine spread pages are the one deliberate exception to the 200 KB target.** `press/magazine/page-{1,2}.jpg` are documents, not photographs — page 2 is two columns of 9pt body copy, and the reader's lightbox is meant to be read, not just looked at. They run 1500–1800 px and ~270/370 KB. The photo pages and the cover hold the normal budget.
- A third party's masthead is displayed with `mix-blend-mode: multiply` over Bone White rather than an alpha-knockout PNG (see the `press/magazine/hh-masthead.png` usage in `app/press/page.tsx`). The artwork is black on white, so multiply removes the box for free — and leaves the publication's mark in its own color, which recoloring to `ink` would not.
- Rename on upload to meaningful slugs — don't carry `photo-160058…` IDs over.
- **Project photos are switched on per project, not globally.** `lib/projects.ts` derives every R2 key from the project's slug, so uploading `projects/<slug>/cover.jpg` and `gallery-1..3.jpg` and setting `assetsReady: true` on that one record is the entire migration — no URL is ever pasted into the data. Until the flag is set, that project renders from the Unsplash placeholder pool. When every record carries it, delete `PLACEHOLDER_ASSETS` and drop `images.unsplash.com` from `next.config.ts`.
- Replace-in-place keeps the URL stable, but the CDN caches by TTL — purge the object in Cloudflare, or append `?v=2`, for an immediate swap.
- **Every image on the site now renders through `next/image`**, project imagery included — so all of it gets a `srcset`, lazy loading, and WebP. Pre-compression on upload still matters (it is what the optimizer fetches), but it is no longer the only defence. Any new image host needs its hostname in `next.config.ts` `images.remotePatterns`.
- `next/image` with `fill` emits an absolutely-positioned `<img>`, so **its wrapper must be positioned**. `body` is itself `position: relative`, so a missing `position` on the wrapper does not fail quietly — the photo escapes and covers the whole page.
- An `<img>` is a replaced element and **renders no pseudo-elements**. Two of the three `__media` classes in `globals.css` therefore stay on a wrapper `<div>` rather than moving onto the image: `.grid-cell__media` because its `::after` is the entire hover scrim, and `.strip-tile__media` because it owns the tile's box. Only `.project-tile__media` sits on the `<img>`, because all it carries is a `transform`, which replaced elements do honour. Hover states do not show up in a screenshot diff — check them by hovering.
- **`priority` is deprecated in Next 16** in favour of `preload`, and the docs prefer `loading="eager"` + `fetchPriority="high"` over either when more than one image could be the LCP. New call sites use the latter; `priority` survives in `app/about/page.tsx`, `components/CoverPanel.tsx`, and `components/press/MagazineReader.tsx` and should be migrated when those files are next touched.
- SVGs stay in `public/` (not on R2).
- **TODO — Press photos are temporarily in the repo, not the bucket.** `public/images/press/{awards,gallery,magazine}/` holds eight images saved off the studio's Stellar Awards Instagram post — seven stills (1024–1280 px, 174–199 KB each) plus `awards/stellar-2026-card.jpg`, the post's overlaid title card, used as the hero lead-story thumbnail. `app/press/page.tsx` reads all of them through a local `pressImg()` helper instead of `img`. The seven stills are Instagram-resolution re-compressions standing in until the photographer's originals arrive; the title card is finished artwork and won't be superseded. `magazine/` holds seven more — the Winter 2024 Aiken Hound & Home feature, rasterised from the issue PDF plus the two high-res originals the studio has — and unlike the stills these are **final**; they are only in the repo to keep one migration rather than two. **When the originals land:** compress them, upload everything under the `press/…` keys above, delete `public/images/press/`, and change `pressImg` back to `img(\`press/${key}\`)` — the helper's keys are already exactly the bucket keys, so nothing else moves.
- The brand mark is the exception to "rasters live on R2": `public/logo-long-{navy,bone}.png` are versioned code assets, cropped to identical tight bounds so `components/LogoLong.tsx` can stack them and crossfade between the two — a raster mark can't be recolored via `currentColor` the way the rest of the header is.

## Architecture

Next.js 16.2 App Router project with TypeScript, Tailwind CSS v4, and React 19.2.

**Styling splits three ways:**

- **Tailwind** — the responsive layer, and only that: breakpoints, section padding, gutters, grid tiers. Breakpoints belong in CSS. This layer used to be read in JS via `useCompact`, which meant SSR and first paint always emitted the _desktop_ tier and reflowed on hydrate; it also forced `'use client'` onto `<Section>` and `<Grid>`. Two breakpoints are defined in `app/globals.css` (`sm` 601px, `lg` 1025px) — Tailwind's `md`/`xl`/`2xl` defaults survive but the design has no such tiers, so don't reach for them.
- **Inline `style` + `lib/tokens.ts`** — static and per-instance values (colors, type, one-off spacing, image URLs, animation delays). This is most of the codebase and it is fine where it is.
- **`app/globals.css`** — global typography (`.serif`, `.micro`), element resets, `:root` tokens, and bespoke keyframe choreography that utilities express badly (the cover panel stagger, the header/logo crossfade).

The inline-style style originates from PR #2, which ported a single-file React + Babel-standalone HTML mock. That mock had no build step, so it could have neither Tailwind's compiler nor CSS Modules — everything _had_ to be inline. That constraint has never applied to this repo, but the result works: **don't bulk-convert what isn't broken.** Reach for Tailwind when something needs a breakpoint, not to restyle what already renders correctly.

CSS Modules are available and unused. They're the right tool if a component ever needs scoped pseudo-elements or state selectors beyond what utilities cover; nothing needs them today.

- `app/` — App Router: all routes, layouts, and pages live here
- `app/layout.tsx` — root layout; loads Cormorant Garamond (serif) and Inter (sans) via `next/font/google` and exposes them as the `--font-cormorant` / `--font-inter` CSS vars. These are **not** the logo's fonts — see "Logo typography" below before changing them
- `app/page.tsx` — home route (`/`)
- `components/ui/` — design system primitives (`Section`, `Grid`, `Container`, `Heading`, `Eyebrow`)
- `components/` — feature components (`Header`, `Footer`, `HeroGrid`, `GridCell`, `ProjectsGrid`, `ProjectDetail`, `StatementSection`, `ProjectStrip`, `Wordmark`, `HomeShell`); route-scoped ones sit in a subfolder (`components/press/`, `components/testimonials/`)
- **Scroll-scrubbed sections** (today only `components/press/MagazineReader.tsx`) follow one pattern: a tall track with a `position: sticky; top: 0; height: 100svh` stage, and `hooks/useTrackProgress.ts` reporting 0→1 across the pinned range. That hook takes a **callback**, not state, on purpose — `useScrollY` re-renders its whole consuming subtree once per scroll frame, so anything driving more than a couple of properties should write to DOM nodes through refs and keep React state for discrete values only (the reader re-renders ~5 times per pass, when the page index changes). Reduced-motion and no-JS fallbacks belong in CSS, not a `usePrefersReducedMotion()` / `useCompact()` branch: both initialise `false`, so a JS branch renders the animated layout first and swaps after hydrate. See the `@media (prefers-reduced-motion: reduce), (scripting: none)` block under `.mag-*` in `globals.css`.
- `hooks/` — React hooks, one per file. File name matches the hook name (e.g. `useScrollY.ts` exports `useScrollY`). Import as `@/hooks/useFoo`. Do not bundle multiple hooks into a single file.
- `lib/tokens.ts` — single source of truth for color, spacing, typography, motion tokens
- `public/` — static assets served at `/`
- Path alias `@/` maps to the repo root

ESLint uses the flat config format (`eslint.config.mjs`) with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. The legacy `.eslintrc` format is not used.

## Inquiry form → ClickUp

`/inquire` is the only route with a server round-trip, and `app/inquire/actions.ts` is the only `'use server'` file in the repo. A submission becomes **one ClickUp task with a PDF attached**. Needs `CLICKUP_API_TOKEN` (a `pk_…` personal token, sent bare in `Authorization` — no `Bearer`) and `CLICKUP_LIST_ID`.

The order in `submitInquiry` is load-bearing: **render the PDF first**, then create the task, then attach. Rendering is local and can fail; doing it before anything is written means the description is chosen once, with certainty, and there is no state where both the PDF and the answers are missing.

- PDF renders → task gets `toSummaryMarkdown` (contact, type, budget, timeline) and the PDF carries all 34 answers
- PDF fails → task gets `toFullMarkdown` instead, so nothing is lost
- PDF renders but the upload fails → the description is rewritten to `toFullMarkdown` via `updateTaskDescription`

Only a failed _task creation_ fails the submission; the visitor then gets a retry prompt rather than a false success. There are no ClickUp custom fields in play, so this works against any list without setup. Statuses and notifications live in ClickUp (watch the list, or an Automation on task-created) — no code owns them.

**The PDF** (`lib/pdf/inquiryDocument.tsx`) is `@react-pdf/renderer`, chosen because it handles wrapping and pagination across ~34 variable-length answers. Three things there are easy to break:

- **Fonts are registered from a local path, never a URL.** react-pdf resolves `src` at render time and a network fetch there is a documented serverless cold-start failure that silently falls back to Helvetica. The TTFs are committed under `lib/pdf/fonts/` (SIL OFL, licenses alongside) and `next.config.ts` lists them plus `logo-long-navy.png` in `outputFileTracingIncludes` — nothing imports those files, so Vercel's tracer cannot find them on its own. **This fails only on Vercel, never locally.** If a deployed PDF looks wrong, check tracing first.
- **`fontFamily` does not inherit from a `View` to its `Text` children.** Setting it on a wrapper silently falls back. Put it on the `Text`.
- The brand hexes are written literally in that file. `lib/tokens.ts` resolves everything through CSS custom properties, and a PDF has no CSSOM.

Adding or changing a question means four files, and TypeScript enforces three of them:

- `lib/inquirySchema.ts` — the field, its validation, and any option list
- `lib/inquiryQuestions.ts` — the question copy (`QUESTIONS`) and its band (`INQUIRY_BANDS`). `QUESTIONS` is a `Record<AnswerKey, string>`, so a schema field with no question text fails `tsc`
- `lib/inquiryPayload.ts` — `normalizeAnswers` returns the same `Record`, so a new field fails `tsc` here too. Arrays get joined; conditionally-revealed fields get stripped when their gate is closed. `toAnswerBands` is the shape both the markdown and the PDF render from, so they cannot disagree about what was asked
- `app/inquire/page.tsx` — the `defaultValues` entry (react-hook-form needs one per key) and the JSX. `<Field>` labels read from `QUESTIONS`, so the form and the ClickUp task always ask in the same words; band titles on `<FormBand>` are still literals and must match `INQUIRY_BANDS`

`npm run typecheck` is what catches all of this — no script runs `tsc` implicitly, so run it before opening a PR.

## SEO

The machinery is built; the content is not. Real project names, descriptions, and
photography are still outstanding, and everything below is wired so that importing them
is a data edit rather than a code change.

**`lib/site.ts` is the identity singleton.** Studio name, tagline, founder, service area,
and social URLs live there and nowhere else. `components/Footer.tsx` reads its social row
from it, and `lib/schema.ts` emits the same values as structured data — markup that
contradicts the page it sits on is worse than no markup. Display copy that deliberately
differs (the footer's shortened service-area line) says so in a comment.

**The site origin is `NEXT_PUBLIC_SITE_URL`**, falling back to Vercel's deployment URL and
then to localhost. It feeds `metadataBase`, every canonical, the sitemap, and the absolute
OG image URLs. An unset value does not fail the build — it emits canonicals pointing at
localhost, so verify on a deployed preview, never in dev.

**Two independent pre-launch gates, both keyed on `SITE_LIVE`:**

- `app/layout.tsx` sets `robots: { index: false }` at the root, and metadata merges down — so no child route may set its own `robots` key without clobbering the guard for that route. `app/not-found.tsx` is the one deliberate exception.
- `app/robots.ts` repeats the check. It is a Route Handler, so the layout's metadata never reaches it; a `robots.txt` saying `Allow: /` while every page says `noindex` is a contradiction crawlers resolve unpredictably.

Unset is the safe state in both. At launch: set `SITE_LIVE=true` on Vercel **Production
only** (Preview keeps it unset; Vercel sends its own `X-Robots-Tag: noindex` there).

**Titles use a template.** The root sets `title.template = '%s — Laurel Leaf Design
Studio'`, so child routes set the bare page name (`title: 'Projects'`) and must **not**
repeat the suffix or it doubles. `openGraph.title` has no template and keeps the full
string. A page that must opt out uses `title: { absolute: '…' }`.

**Structured data** is built in `lib/schema.ts` and rendered by `components/seo/JsonLd.tsx`,
which escapes `<` per the Next docs. The studio node is emitted once at the root with a
stable `@id`; per-page nodes reference it rather than restating it. There is deliberately
**no `Review` or `AggregateRating`** — every quote in `lib/testimonials.ts` is invented
placeholder copy, and marking invented testimonials up as structured data is both false
and a documented manual-action trigger. Add them when there are real client words.

**OG images** are generated by `ImageResponse` from a shared card in `lib/og.tsx`. Two
constraints there mirror the inquiry PDF, for the same reason — neither renderer has a
CSSOM: brand hexes are written literally (`lib/tokens.ts` resolves through CSS vars), and
fonts are read from disk at module scope, never fetched. The TTFs are the same ones the
PDF uses, and both OG routes are listed in `next.config.ts` `outputFileTracingIncludes`.
**Nothing imports those files, so getting the tracing wrong fails only on Vercel** — the
route 500s in production and renders perfectly in dev.

**One `<h1>` per page.** `/press` sets one display phrase across two block-level spans
inside a single `h1`; `/projects` carries an `sr-only` one because the design has no room
for a visible heading above the grid.

## Design system

The codebase has a small, opinionated design system. Prefer it over new CSS or ad-hoc inline styles. Spacing changes should be one-line edits — to a token in `lib/tokens.ts` or a prop on a primitive. If you're reaching for new CSS rules to fix spacing, something is wrong.

**Tokens — `lib/tokens.ts`:**

- `brand` — the nine colors of the 2026 Laurel Leaf brand book, verbatim: `saddleLeather #8A5A32`, `navyInk #0F1A2B`, `heritageGreen #1F3A32`, `charlestonSage #7C8E76`, `modernTan #E6DCC7`, `boneWhite #F4F1EA`, `warmStone #A89F96`, `titaniumWhite #FFF`, `midnightBlack #000`. **Go through `color` below unless you need a deliberate brand accent** — the semantic tokens are what a future palette change re-points. Never introduce a hex that isn't in this list.
- `color` — semantic roles, each resolving through a CSS var to a `brand` value: `{ bg, ink, inkSoft, error, hairline, divider, navy, headerFill }`. `bg` is Bone White, `ink` is Heritage Green, `navy` is Navy Ink, `headerFill` is Warm Stone. `error` (`#8B3A2E`) is the one deliberate exception — the brand book has no error color.
- `text` — `{ display, section, card, body, bodySm }`. Spread into a style: `style={{ ...text.body }}`.
- `motion` — `{ ease, durFast, durMed, durSlow, durXSlow }`. Compose into transitions: `` transition: `opacity ${motion.durMed} ${motion.ease}` ``.
- `sectionPadY` — `{ none, xxs, xs, sm, md, lg, xl, '2xl' }`, each `{ d, m }`. Desktop values are 0/60/80/120/140/160/180/200; mobile values follow ~40% ratio (0/24/32/48/56/64/72/80). Consumed by `<Section>` — rarely used directly.
- `gutter` — `{ d: '8vw', m: '24px' }`. Consumed by `<Section>` and `<Grid>`.
- `space` — px scale (4, 8, 14, 22, 32, 48, 60, 80, 100, 140, 180). Use for one-off spacing.

**Primitives — `components/ui/`:**

- `<Section>` — page section wrapper. Owns vertical padding (preset `padY` or `padTop`/`padBottom`), horizontal gutter, optional `topBorder`, and the desktop/mobile split — all as Tailwind classes, so it is a server component. `as` accepts `'section' | 'div' | 'article' | 'header' | 'footer' | 'form'`. Forwards `ref` and inherits `HTMLAttributes` (so `onSubmit`, `aria-*`, `id`, etc. flow through). Its `PAD_TOP`/`PAD_BOTTOM` maps must be **complete literal class strings** — Tailwind scans source text, so an interpolated `` `pt-[${n}px]` `` is never emitted and silently renders as no padding. `scripts/check-css.mjs` asserts those maps stay in step with `sectionPadY`.
- `<Grid>` — responsive grid. `cols` accepts a string (auto-collapses to `'1fr'` at ≤1024px, like the `useCols` pattern) or `{ d, t?, m }` for explicit per-tier control where `t` falls back to `m`. `gap`/`rowGap`/`columnGap` take the same form. Replaces inline `gridTemplateColumns: cols(...)` patterns.
- `<Container>` — max-width content wrapper with optional `align: 'left' | 'center'`. Used inside `<Section>` for capped editorial widths (e.g. `maxWidth={1100}` or `1400`).
- `<Heading>` — `level: 'display' | 'section' | 'card'` drives the typography token. `as` overrides the rendered tag (defaults: display→h1, section→h2, card→h3). `italic` and `serif` (default `true`) handle common variants. Style overrides win over level defaults.
- `<Eyebrow>` — wraps the `.micro` / `.micro-sm` + opacity pattern (used 40+ times across the site). `size: 'sm' | 'md'`, `opacity` defaults to 0.55.

**When to use raw elements instead of primitives:**

- **Bespoke poster typography** (e.g. Press hero h1 at `clamp(96px, 16vw, 280px)`, Services hero at 132px). Forcing through `<Heading>` with style overrides for every property defeats the point. Use raw `<h1 className="serif" style={{ ..., margin: 0 }}>`.
- **Bespoke gutters** (`ProjectsGrid` uses 32px desktop / 20px mobile to maximize tile width; `ProjectDetail`'s top-bar and footer-nav use 36px to align with the global header). `<Section>`'s `8vw` desktop gutter would crop content too tightly. Use a raw `<section>` / `<div>` and apply tokens for color/motion.
- **Full-bleed heroes** (Services hero at `100vh` with absolute-positioned content). `<Section>` is for padded content blocks, not edge-to-edge layout.

## Logo typography — the artwork does not set the site's fonts

The master logo lives outside the repo (`Laurel Leaf Final Logo LONG.ai`). Its type was never converted to outlines, so the families are readable straight from the file's PDF font descriptors:

| Logo element            | Font in the artwork                                     |
| ----------------------- | ------------------------------------------------------- |
| `LAUREL LEAF` wordmark  | **STIX Two Text** Regular (400), hand-kerned per letter |
| `DESIGN STUDIO` tagline | **Gotham Medium** (500), `0.14em` tracking              |

**The site deliberately does not use either.** It runs Cormorant Garamond + Inter, and that mismatch is a decision, not an oversight — both logo fonts were trialled on the site and rolled back. Do not "fix" it by swapping the site to match the artwork.

Notes if the question ever comes back up:

- **STIX Two Text is free** (SIL OFL, on Google Fonts, `STIX_Two_Text` in `next/font/google`) — but it has **no weight below 400**. Everything serif here is 300, so a swap forces `.serif`, `.form-band-numeral`, and the `display`/`section`/`card` weights in `lib/tokens.ts` up to 400.
- **Gotham is commercial** (Hoefler&Co). Measured against the subset embedded in the `.ai`, the closest free substitute is **Montserrat** — ~4% RMS deviation on cap-relative letterwidths and the same exact 0.700 cap-height ratio; Archivo is next at ~5.8%. Note Montserrat Medium is lighter than Gotham Medium (stem 14.3% of cap vs 17.6%), so match the weight up, not across.
- `public/logo-full.svg` is fully outlined paths — **no runtime font dependency**, so none of the above affects rendering the mark itself.
- `components/Wordmark.tsx` sets the header wordmark in Cormorant at weight 400. It is not trying to reproduce the artwork's letterfit; the artwork is hand-kerned glyph by glyph, the component uses uniform `0.22em` tracking.

## CSS pitfalls (regression-guarded)

- **Never** apply `overflow: hidden` (or `overflow-x` / `overflow-y: hidden`) to `html`, `body`, or `:root`. It creates a scroll container and silently disables `position: sticky` on every descendant. The Services page quick-links nav (`app/services/page.tsx`) is the canary — if it stops sticking, suspect this rule first. `npm run lint` enforces this via `scripts/check-css.mjs`.
- To suppress horizontal overflow at the root, use `overflow-x: clip` instead. Per spec, `clip` hides overflowing content without becoming a scroll container, so sticky positioning of descendants still works. `body { overflow-x: clip }` is the current setup in `globals.css` and is intentional.
- If a specific component (not the root) is overflowing, prefer fixing the source: `width: 100%`, `min-width: 0`, `flex-basis: min(<px>, <vw>)`, or scoped `overflow: hidden` on a container that is not an ancestor of any sticky element.
- **Never write a selector that matches inline-style text** (`nav[style*='position: sticky']`, `div[style*='height: 100vh']`). React emits `height:100vh` **unspaced** during SSR, but the CSSOM re-serialises to `height: 100vh` **spaced** the moment React updates that element — so such a rule is inert on load and switches on mid-session when unrelated state changes. The services quick-links nav did exactly this: it wrapped on mobile until the sticky state flipped, then snapped to a scroll strip. Put a class on the element. `npm run lint` enforces this via `scripts/check-css.mjs`.
- Responsiveness lives in CSS. `<Section>` and `<Grid>` handle it themselves (Tailwind classes and the `.grid-tiers` custom properties respectively) and are server components. `useCompact()` / `useCols()` from `hooks/useCompact.ts` remain for genuinely behavioural cases — swapping rendered markup, not styling it — but note they initialise to `false`, so anything using them renders the desktop branch on first paint. Don't reach for them for layout. Token presets live in `lib/tokens.ts` (`sectionPadY`, `gutter`, `text`, `motion`, `color`).
- A handful of mobile-only CSS rules remain in `app/globals.css` (≤600px): header padding, the `header > div > nav { display: none }` rule that's load-bearing for the compact Header layout, and a few accessibility/typography defaults.

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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
