import type { MetadataRoute } from 'next';
import { SITE, absoluteUrl } from '@/lib/site';

/**
 * The same pre-launch gate as the `robots` meta tag in app/layout.tsx — but it has to be
 * repeated here, not inherited. This is a Route Handler, not a page, so the root layout's
 * metadata never reaches it; a `robots.txt` saying `Allow: /` while every page says
 * `noindex` is a contradiction crawlers resolve unpredictably.
 *
 * Unset (the local and Preview default) is the safe state, exactly as in the layout.
 */
const siteIsLive = process.env.SITE_LIVE === 'true';

export default function robots(): MetadataRoute.Robots {
  if (!siteIsLive) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: absoluteUrl('/sitemap.xml'),
    // A bare hostname — the directive takes no scheme and no trailing slash.
    host: new URL(SITE.url).host
  };
}
