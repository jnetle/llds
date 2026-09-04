import type { MetadataRoute } from 'next';
import { SITE, absoluteUrl } from '@/lib/site';

/**
 * Repeats the pre-launch gate from app/layout.tsx rather than inheriting it: a Route Handler never sees the root
 * layout's metadata, and a `robots.txt` allowing everything while every page says `noindex` is a contradiction
 * crawlers resolve unpredictably. Unset is the safe state.
 */
const siteIsLive = process.env.SITE_LIVE === 'true';

export default function robots(): MetadataRoute.Robots {
  if (!siteIsLive) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: absoluteUrl('/sitemap.xml'),
    // The directive takes a bare hostname — no scheme, no trailing slash.
    host: new URL(SITE.url).host
  };
}
