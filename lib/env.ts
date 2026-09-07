/**
 * Centralized environment access.
 *
 * - Public values (`NEXT_PUBLIC_*`) may be read by code that can run in the browser.
 * - Server-only values (tokens/keys) are exposed through helpers and should be imported only from server code.
 */

const DEFAULT_SITE_URL = 'http://localhost:3000';
const DEFAULT_IMG_BASE = 'https://pub-2c63d568453046b488491cb8d09ac07b.r2.dev';

const clean = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const httpsHostnameFrom = (value: string | null): string | null => {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' ? parsed.hostname : null;
  } catch {
    return null;
  }
};

/**
 * Public site origin, no trailing slash.
 * Falls back to Vercel's production domain, then localhost for local development.
 */
export const siteUrl = (() => {
  const configured = clean(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) return trimTrailingSlash(configured);

  const vercelProd = clean(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  return vercelProd ? `https://${vercelProd}` : DEFAULT_SITE_URL;
})();

/** Public image base origin for R2/CDN keys, no trailing slash. */
export const imageBaseUrl = (() => {
  const configured = clean(process.env.NEXT_PUBLIC_IMG_BASE);
  return configured ? trimTrailingSlash(configured) : DEFAULT_IMG_BASE;
})();

/** Host allowlist candidate for next/image from NEXT_PUBLIC_IMG_BASE, only when it's a valid https URL. */
export const configuredImageHost = httpsHostnameFrom(clean(process.env.NEXT_PUBLIC_IMG_BASE));

/** True only when explicitly set to `true`. */
export const siteIsLive = process.env.SITE_LIVE === 'true';

/** Optional GA measurement id; undefined means analytics disabled. */
export const gaMeasurementId = clean(process.env.GA_MEASUREMENT_ID) ?? undefined;

/**
 * ClickUp config for inquiry task creation.
 * Returns null unless both required values are present.
 */
export const getClickUpConfig = (): { token: string; listId: string } | null => {
  const token = clean(process.env.CLICKUP_API_TOKEN);
  const listId = clean(process.env.CLICKUP_LIST_ID);
  if (!token || !listId) return null;
  return { token, listId };
};

/**
 * Resend config for inquiry confirmation emails.
 * Returns null unless required values are present; replyTo is optional.
 */
export const getInquiryEmailConfig = (): { apiKey: string; from: string; replyTo?: string } | null => {
  const apiKey = clean(process.env.RESEND_API_KEY);
  const from = clean(process.env.INQUIRY_FROM_EMAIL);
  if (!apiKey || !from) return null;

  const replyTo = clean(process.env.INQUIRY_REPLY_TO) ?? undefined;
  return { apiKey, from, replyTo };
};

export const isProduction = process.env.NODE_ENV === 'production';
