import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
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

// Pre-launch noindex. Set SITE_LIVE=true on Vercel Production at launch; anything else, unset included, keeps it on.
const siteIsLive = process.env.SITE_LIVE === 'true';

export const metadata: Metadata = {
  // Every relative URL below resolves against this; without it Next throws on relative OG images and emits no canonical.
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    // Child routes set the bare page name and inherit the suffix; opt out with `title: { absolute: '…' }`.
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
        // Without `max-image-preview: large` Google shows a favicon-sized thumbnail beside the result.
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
  // Set per environment in Vercel. Unset (the local default) renders no gtag script at all.
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
        <ScrollToTop />
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
