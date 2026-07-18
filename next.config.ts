import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
