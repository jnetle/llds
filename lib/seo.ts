import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

type PageMeta = {
  /** Full share-card title, including the studio name — OG has no title template. */
  title: string;
  description: string;
  /** Site-relative path, e.g. '/about'. Resolved against metadataBase. */
  path: string;
  type?: 'website' | 'article';
  /**
   * Set only for a route that has its own `opengraph-image` file beside it, which Next
   * wires up for that segment automatically. Everything else inherits the site card.
   */
  hasOwnImage?: boolean;
};

/**
 * Build a route's `openGraph` block.
 *
 * **Next replaces a parent's `openGraph` with a child's — it does not merge them.** So a
 * route that hand-rolls its own silently drops every default the root set: `siteName`,
 * `locale`, and, critically, the `images` entry pointing at `app/opengraph-image.tsx`.
 * That is not theoretical — /about, /press, /services, /inquire and /projects all shipped
 * advertising `twitter:card=summary_large_image` with no image behind it, which renders
 * as an empty card frame.
 *
 * Routing every page through this helper means a route can only add to the defaults, and
 * can no longer lose them by omission.
 */
export function pageOpenGraph({ title, description, path, type = 'website', hasOwnImage = false }: PageMeta): Metadata['openGraph'] {
  return {
    type,
    siteName: SITE.name,
    locale: 'en_US',
    url: path,
    title,
    description,
    // A route with a sibling opengraph-image gets it applied at its own segment; naming
    // it here as well would override that route with the generic site card.
    ...(hasOwnImage ? {} : { images: ['/opengraph-image'] })
  };
}
