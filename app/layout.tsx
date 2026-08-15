import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GoogleAnalytics } from '@next/third-parties/google';

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
  title: 'Laurel Leaf Design Studio',
  description: 'Considered interiors for the long view.',
  ...(siteIsLive ? {} : { robots: { index: false, follow: false } })
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
