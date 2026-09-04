/** The studio's identity. Both the rendered pages and `lib/schema.ts` read from here, so the two cannot drift. */

/**
 * Production origin, no trailing slash. Feeds `metadataBase`, every canonical, the sitemap and each schema `@id`.
 *
 * Set `NEXT_PUBLIC_SITE_URL` on Preview as well as Production. The fallback is for local dev only: Footer is a client
 * component, so only `NEXT_PUBLIC_`-prefixed vars reach the browser, and on Preview `VERCEL_PROJECT_PRODUCTION_URL` is
 * the *production* domain — previews would emit production canonicals. A wrong value doesn't throw, so verify on a
 * deployed preview rather than in dev.
 */
const url =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/** Closed on purpose: Footer keys its glyph map by this union, so a new network fails `tsc` there until it has an icon. */
export type SocialLabel = 'Instagram' | 'Facebook';

export type SocialLink = { label: SocialLabel; href: string };

export const SITE = {
  name: 'Laurel Leaf Design Studio',
  tagline: 'Considered interiors for the long view.',
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

  /** Every place the studio has delivered work, ordered by prominence — the first three are the ones the copy names. */
  areaServed: ['Augusta, GA', 'North Augusta, SC', 'Aiken, SC', 'Martinez, GA', 'Evans, GA', 'McCormick, SC', 'Johnston, SC', 'Modoc, SC'],

  /**
   * Empty on purpose — the studio publishes no contact details, so the LocalBusiness node omits them rather than
   * inventing them. Fill any in and `studioSchema()` picks it up, but it must then match the Google Business Profile
   * exactly and also appear on the page.
   */
  telephone: '',
  email: '',
  address: null as { streetAddress: string; addressLocality: string; addressRegion: string; postalCode: string } | null
} as const;

/** Absolute URL for a site-relative path. `absoluteUrl('/projects')` → `https://…/projects`. */
export const absoluteUrl = (path: string): string => new URL(path, SITE.url).toString();
