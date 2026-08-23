import type { MetadataRoute } from 'next';
import { PROJECTS } from '@/lib/projects';
import { absoluteUrl } from '@/lib/site';

/**
 * Static routes, in rough priority order. `/inquire` is included deliberately — it is the
 * site's conversion page and there is nothing private about the form itself.
 */
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'monthly' },
  { path: '/projects', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/services', priority: 0.8, changeFrequency: 'yearly' },
  { path: '/about', priority: 0.7, changeFrequency: 'yearly' },
  { path: '/press', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/inquire', priority: 0.5, changeFrequency: 'yearly' }
];

/**
 * `updatedAt` is a hand-typed string. Next calls `toISOString()` on whatever this returns,
 * so an unparseable date (`'2026-13-01'`) would fail static generation with a bare
 * `RangeError: Invalid time value` and no clue which record caused it. Fall back instead.
 */
function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // One timestamp for the whole build, so every entry without its own `updatedAt` agrees.
  const built = new Date();

  return [
    ...ROUTES.map(r => ({
      url: absoluteUrl(r.path),
      lastModified: built,
      changeFrequency: r.changeFrequency,
      priority: r.priority
    })),
    // Project pages come from the data, so adding a project adds a sitemap entry.
    ...PROJECTS.map(p => ({
      url: absoluteUrl(`/projects/${p.id}`),
      lastModified: parseDate(p.updatedAt) ?? built,
      changeFrequency: 'yearly' as const,
      priority: 0.8
    }))
  ];
}
