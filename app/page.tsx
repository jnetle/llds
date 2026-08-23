import type { Metadata } from 'next';
import { HomeShell } from '@/components/HomeShell';
import { pageOpenGraph } from '@/lib/seo';
import { SITE } from '@/lib/site';

/**
 * The home page's own metadata. It inherits the root's `title.default` — the studio name
 * is the right title here — but takes its own description: the root tagline ("Considered
 * interiors for the long view") is good copy and useless as a search snippet, naming
 * neither the service nor the region on the one page most likely to rank for both.
 */
export const metadata: Metadata = {
  description: SITE.description,
  alternates: { canonical: '/' },
  openGraph: pageOpenGraph({
    title: SITE.name,
    description: SITE.description,
    path: '/',
    // app/opengraph-image.tsx is this segment's own file — Next wires it up here.
    hasOwnImage: true
  })
};

export default function Home() {
  return <HomeShell />;
}
