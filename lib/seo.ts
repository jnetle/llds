import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

type PageMeta = {
  /** Full share-card title, including the studio name — OG has no title template. */
  title: string;
  description: string;
  /** Site-relative path, e.g. '/about'. Resolved against metadataBase. */
  path: string;
  type?: 'website' | 'article';
  /** Set only for a route with its own `opengraph-image` file beside it. Everything else inherits the site card. */
  hasOwnImage?: boolean;
};

/**
 * Build a route's `openGraph` block.
 *
 * Next *replaces* a parent's `openGraph` with a child's rather than merging, so a route that hand-rolls its own
 * silently drops `siteName`, `locale` and the `images` entry — which ships a `summary_large_image` card with no image
 * behind it. Going through this helper means a route can add to the defaults but never lose them by omission.
 */
export function pageOpenGraph({ title, description, path, type = 'website', hasOwnImage = false }: PageMeta): Metadata['openGraph'] {
  return {
    type,
    siteName: SITE.name,
    locale: 'en_US',
    url: path,
    title,
    description,
    // Naming a sibling opengraph-image here would override that route's own card with the generic one.
    ...(hasOwnImage ? {} : { images: ['/opengraph-image'] })
  };
}
