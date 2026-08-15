import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // react-pdf resolves its fonts from disk at render time, so the TTFs and the
  // logo have to be traced into the deployment — nothing imports them, so the
  // tracer cannot find them on its own. Getting this wrong fails only on Vercel,
  // never locally: the PDF renders in a fallback face instead of Cormorant.
  outputFileTracingIncludes: {
    '/inquire': ['./lib/pdf/fonts/**', './public/logo-long-navy.png']
  },
  // Keep react-pdf out of the bundler; it expects to run as a plain Node package.
  serverExternalPackages: ['@react-pdf/renderer'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        // Cloudflare R2 public dev URL — swap/add the custom domain here in prod.
        protocol: 'https',
        hostname: 'pub-2c63d568453046b488491cb8d09ac07b.r2.dev'
      }
    ]
  }
};

export default nextConfig;
