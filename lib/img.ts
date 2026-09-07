// Cloudflare R2 public base for hosted images. Set NEXT_PUBLIC_IMG_BASE (no trailing slash) per environment.
const FALLBACK_IMG_BASE = 'https://pub-2c63d568453046b488491cb8d09ac07b.r2.dev';
const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE || FALLBACK_IMG_BASE;

// Build a URL for a hosted image key, e.g. img('about/maria39.jpg').
export const img = (key: string): string => `${IMG_BASE}/${key.replace(/^\/+/, '')}`;
