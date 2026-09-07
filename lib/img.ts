import { imageBaseUrl } from '@/lib/env';

// Cloudflare R2/CDN base for hosted images. Set NEXT_PUBLIC_IMG_BASE (no trailing slash) per environment.
const IMG_BASE = imageBaseUrl;

// Build a URL for a hosted image key, e.g. img('about/maria39.jpg').
export const img = (key: string): string => `${IMG_BASE}/${key.replace(/^\/+/, '')}`;
