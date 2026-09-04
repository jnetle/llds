import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // react-pdf and the OG routes read these TTFs (and the logo) from disk at render time, and nothing imports them, so
  // the tracer cannot find them on its own. Getting this wrong fails ONLY on Vercel: the PDF renders in a fallback
  // face and the OG routes 500, both while working perfectly in dev.
  outputFileTracingIncludes: {
    '/inquire': ['./lib/pdf/fonts/**', './public/logo-long-navy.png'],
    '/opengraph-image': ['./lib/pdf/fonts/**'],
    '/projects/[slug]/opengraph-image': ['./lib/pdf/fonts/**']
  },
  serverExternalPackages: ['@react-pdf/renderer'],
  images: {
    // Next emits a srcset candidate per width and each unique (source, width, quality, format) is a billed
    // transformation, so widths nothing can use are pure waste. 2400 is last because it is exactly the source cap
    // (AGENTS.md § Images) and what a full-bleed hero on a retina desktop resolves to; stopping at 2048 measurably
    // downgraded /projects/[slug], and 3840 bought nothing since the optimizer never upscales past the original.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2400],
    // Default starts at 32; the smallest image here is the ~128px header logo.
    imageSizes: [96, 128, 256, 384],
    // 31 days, up from the 4-hour default. There is no cache-invalidation API, so this commits us to the documented
    // workflow: R2 keys are stable, and an image that must change immediately is purged in Cloudflare or re-pointed
    // with `?v=2`.
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
