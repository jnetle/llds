/**
 * The studio's identity, in one place.
 *
 * Everything here is read by both the rendered page and the structured data in
 * `lib/schema.ts`. That is the point: before this file the service area was written
 * three different ways across Footer, CoverPanel and StatementSection, and the social
 * URLs existed only inside Footer's `SOCIAL_LINKS`. Structured data that disagrees with
 * the page it sits on is worse than no structured data at all, so both now come from
 * here and the components import back.
 */

/**
 * Production origin. No trailing slash — `absoluteUrl` composes it with `new URL`.
 *
 * `metadataBase` in app/layout.tsx reads this, and every canonical, sitemap entry, OG
 * URL and schema `@id` resolves against it. Getting it wrong does not throw — it
 * silently emits URLs pointing somewhere useless — so check a deployed preview, not dev.
 *
 * **Set `NEXT_PUBLIC_SITE_URL` on Preview as well as Production.** Two reasons, both
 * easy to get wrong:
 *
 * 1. This module is imported by components/Footer.tsx, which is `'use client'`, so it is
 *    compiled into the browser bundle. Only `NEXT_PUBLIC_`-prefixed variables are inlined
 *    there — `VERCEL_PROJECT_PRODUCTION_URL` is not, so the fallback below evaluates to
 *    `undefined` in the browser and the server and client would disagree about the origin.
 * 2. On Preview deployments `VERCEL_PROJECT_PRODUCTION_URL` is the *production* domain,
 *    not the preview's own URL — so relying on the fallback makes previews emit
 *    production canonicals, which is precisely what you were hoping to verify.
 *
 * The fallback is therefore a last resort for local dev, not a substitute for setting it.
 */
const url =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * Closed on purpose. components/Footer.tsx keys its glyph map by this union, so adding a
 * network here fails `tsc` there until it also has an icon — rather than publishing the
 * URL in structured data while the footer link quietly goes missing.
 */
export type SocialLabel = 'Instagram' | 'Facebook';

export type SocialLink = { label: SocialLabel; href: string };

export const SITE = {
  name: 'Laurel Leaf Design Studio',
  tagline: 'Considered interiors for the long view.',
  /** Longer form, for meta descriptions that need a service and a place in them. */
  description:
    'Laurel Leaf Design Studio is an interior design practice serving Augusta, Georgia and Aiken, South Carolina — residential and small commercial work, from planning through installation.',
  founder: 'Maria Rhinehart',
  foundingDate: '2020',
  url,

  /** The `sameAs` values for the studio's schema node, and the Footer's icon row. */
  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/laurelleafdesignstudio' },
    { label: 'Facebook', href: 'https://www.facebook.com/laurelleafdesignstudio' }
  ] as SocialLink[],

  /**
   * Every place the studio has actually delivered work, taken from PROJECT_META in
   * lib/projects.ts. Ordered by prominence rather than alphabetically — the first three
   * are the ones the site's own copy names.
   */
  areaServed: ['Augusta, GA', 'North Augusta, SC', 'Aiken, SC', 'Martinez, GA', 'Evans, GA', 'McCormick, SC', 'Johnston, SC', 'Modoc, SC'],

  /**
   * Empty on purpose. The studio is by appointment only and publishes no phone, email,
   * or street address anywhere on the site — so the LocalBusiness node omits those
   * properties rather than inventing them. Fill any of these in and `studioSchema()`
   * picks it up automatically.
   *
   * If you do add them: they must match the Google Business Profile character for
   * character, and they must also appear on the page. Structured data that states a
   * fact the page does not is the thing manual actions are for.
   */
  telephone: '',
  email: '',
  address: null as { streetAddress: string; addressLocality: string; addressRegion: string; postalCode: string } | null
} as const;

/** Absolute URL for a site-relative path. `absoluteUrl('/projects')` → `https://…/projects`. */
export const absoluteUrl = (path: string): string => new URL(path, SITE.url).toString();
