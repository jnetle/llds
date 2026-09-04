import { SITE, absoluteUrl } from '@/lib/site';
import { splitLocation, type Project } from '@/lib/projects';

/**
 * schema.org builders. Every fact comes from `lib/site.ts` or `lib/projects.ts` — the same values the pages render —
 * so the markup cannot drift from the visible copy.
 *
 * No `Review` or `AggregateRating` on purpose: the quotes in `lib/testimonials.ts` are invented placeholder copy, and
 * marking those up is both false and a documented manual-action trigger. Add them when there are real client words.
 */

type Node = Record<string, unknown>;

/** schema.org wants a state's name, not its postal abbreviation. */
const US_STATES: Record<string, string> = { GA: 'Georgia', SC: 'South Carolina' };

/** Stable @id for the studio, so other nodes can reference it instead of restating it. */
export const STUDIO_ID = `${SITE.url}/#studio`;
const WEBSITE_ID = `${SITE.url}/#website`;

/**
 * The studio itself. `HomeAndConstructionBusiness` is the nearest type schema.org offers — there is no interior design
 * vocabulary. `areaServed` stands in for an address: an appointment-only studio has a service area, not a storefront.
 */
export function studioSchema(): Node {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': STUDIO_ID,
    name: SITE.name,
    description: SITE.description,
    slogan: SITE.tagline,
    url: SITE.url,
    foundingDate: SITE.foundingDate,
    founder: { '@type': 'Person', name: SITE.founder, jobTitle: 'Founder & Interior Designer' },
    // `City` has no `addressRegion`, and consumers drop unknown properties — a bare "Augusta" would lose the point
    // of a two-state service area. `containedInPlace` is the modelled way to name a city's state.
    areaServed: SITE.areaServed.map(area => {
      const { city, region } = splitLocation(area);
      return {
        '@type': 'City',
        name: city,
        ...(region ? { containedInPlace: { '@type': 'State', name: US_STATES[region] ?? region } } : {})
      };
    }),
    sameAs: SITE.social.map(s => s.href),
    knowsAbout: ['Interior design', 'Residential interior architecture', 'New construction', 'Renovation'],
    // Omitted rather than emitted empty — see lib/site.ts.
    ...(SITE.telephone ? { telephone: SITE.telephone } : {}),
    ...(SITE.email ? { email: SITE.email } : {}),
    ...(SITE.address ? { address: { '@type': 'PostalAddress', ...SITE.address } } : {}),
    // No `award`: the 2026 Stellar Awards named on `/press` were presented to Southern State Builders, the studio's build
    // partner. The studio designed the home, but `award` asserts the recipient — so it stays off this node.
    subjectOf: {
      '@type': 'Article',
      headline: 'Understated Luxury: A Bathroom Transformed',
      datePublished: '2024-12-01',
      author: { '@type': 'Person', name: SITE.founder },
      publisher: { '@type': 'Periodical', name: 'Aiken Hound & Home Magazine' }
    }
  };
}

export function websiteSchema(): Node {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE.name,
    url: SITE.url,
    publisher: { '@id': STUDIO_ID },
    inLanguage: 'en-US'
  };
}

/** `[['Projects', '/projects'], ['Yucca Ave', '/projects/yucca-ave']]` — home is prepended. */
export function breadcrumbSchema(trail: [name: string, path: string][]): Node {
  const items = [['Home', '/'] as [string, string], ...trail];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: absoluteUrl(path)
    }))
  };
}

/** One project. `CreativeWork` rather than `Product` — a portfolio piece, with no price and nothing to buy. */
export function projectSchema(project: Project): Node {
  const { city, region } = splitLocation(project.location);

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': absoluteUrl(`/projects/${project.id}`) + '#project',
    name: project.title,
    description: project.summary,
    url: absoluteUrl(`/projects/${project.id}`),
    // Year-only because that is all the precision the data has — better than a fabricated January 1st.
    dateCreated: project.year,
    creator: { '@id': STUDIO_ID },
    locationCreated: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: city, ...(region ? { addressRegion: region } : {}) }
    },
    // Omitted while the photos are placeholders: claiming a stock interior depicts this project would be false, and
    // the pooled images repeat across projects, so several @ids would assert the same photographs.
    ...(project.hasRealAssets ? { image: [project.cover, ...project.gallery].map(i => i.src) } : {}),
    isPartOf: { '@id': WEBSITE_ID }
  };
}
