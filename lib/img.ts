// Cloudflare R2 public base for hosted images. Swap for the custom domain in prod.
const IMG_BASE = 'https://pub-2c63d568453046b488491cb8d09ac07b.r2.dev';

// Build a URL for a hosted image key, e.g. img('about/maria39.jpg').
export const img = (key: string): string => `${IMG_BASE}/${key.replace(/^\/+/, '')}`;
