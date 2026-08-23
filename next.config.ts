import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // react-pdf resolves its fonts from disk at render time, so the TTFs and the
  // logo have to be traced into the deployment — nothing imports them, so the
  // tracer cannot find them on its own. Getting this wrong fails only on Vercel,
  // never locally: the PDF renders in a fallback face instead of Cormorant.
  outputFileTracingIncludes: {
    '/inquire': ['./lib/pdf/fonts/**', './public/logo-long-navy.png'],
    // Same trap, same fix: the OG routes read these TTFs from disk at render time and
    // nothing imports them, so the tracer would leave them out and the routes would 500
    // in production while rendering perfectly in dev. See lib/og.tsx.
    '/opengraph-image': ['./lib/pdf/fonts/**'],
    '/projects/[slug]/opengraph-image': ['./lib/pdf/fonts/**']
  },
  // Keep react-pdf out of the bundler; it expects to run as a plain Node package.
  serverExternalPackages: ['@react-pdf/renderer'],
  images: {
    // Trimmed from the defaults to match what this design actually renders. Next emits a
    // srcset candidate for every width in these two lists, and each unique
    // (source, width, quality, format) is a billed transformation — so a width nothing
    // can use is pure waste. Source images are capped at 2400px (AGENTS.md § Images), so
    // the default 3840 asked the optimizer for sizes no original even has.
    //
    // 2400 is the last entry on purpose: it is exactly the source cap, and it is what a
    // full-bleed hero on a retina desktop resolves to. Stopping at 2048 measurably
    // downgraded /projects/[slug] (2048px into a 1440css x2 frame) while 3840 above it
    // bought nothing, since the optimizer never upscales past the original.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2400],
    // Default starts at 32. The smallest image on the site is the header logo at ~128px,
    // and nothing renders below 96.
    imageSizes: [96, 128, 256, 384],
    // 31 days, up from the 4-hour default. Safe *because* of the convention already
    // documented in AGENTS.md: R2 keys are stable, and an image that needs to change
    // immediately is either purged in Cloudflare or re-pointed with `?v=2`. There is no
    // cache-invalidation API here, so a long TTL commits us to that workflow.
    minimumCacheTTL: 2678400,
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
