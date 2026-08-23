import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GoogleAnalytics } from '@next/third-parties/google';
import { JsonLd } from '@/components/seo/JsonLd';
import { studioSchema, websiteSchema } from '@/lib/schema';
import { SITE } from '@/lib/site';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap'
});

const inter = Inter({
  variable: '--font-inter',
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  display: 'swap'
});

// Pre-launch: keep the site out of search results. Set SITE_LIVE=true in Vercel Production
// at launch to drop the noindex; anything else (including unset, the local default) keeps
// it on, so the safe state is the one you get by doing nothing.
const siteIsLive = process.env.SITE_LIVE === 'true';

export const metadata: Metadata = {
  // Every relative URL below — canonicals, OG images — resolves against this. Without
  // it Next throws on a relative `openGraph.images` and emits no canonical at all.
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    // Child routes set the bare page name ('Projects') and get the suffix from here.
    // A page that needs to opt out uses `title: { absolute: '…' }`.
    template: `%s — ${SITE.name}`
  },
  description: SITE.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'en_US',
    url: '/',
    title: SITE.name,
    description: SITE.description
  },
  twitter: { card: 'summary_large_image' },
  robots: siteIsLive
    ? {
        index: true,
        follow: true,
        // The site is a photography portfolio; without `max-image-preview: large`
        // Google shows a thumbnail the size of a favicon next to the result.
        googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 }
      }
    : { index: false, follow: false }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Set per environment in Vercel: production property on Production, test property on
  // Preview/Development. Unset (the local default) renders no gtag script at all.
  const gaId = process.env.GA_MEASUREMENT_ID;

  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {/* Site-wide structured data. Rendered once, at the root, so every page
            carries the studio node that per-page schema references by @id. */}
        <JsonLd data={[studioSchema(), websiteSchema()]} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
