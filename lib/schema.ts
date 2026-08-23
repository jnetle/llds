import { SITE, absoluteUrl } from '@/lib/site';
import { splitLocation, type Project } from '@/lib/projects';

/**
 * schema.org builders. Everything factual here comes from `lib/site.ts` or `lib/projects.ts`
 * — the same values the pages render — so the markup cannot drift from the visible copy.
 *
 * Deliberately absent: `Review` and `AggregateRating`. Every quote in `lib/testimonials.ts`
 * is flagged in that file as invented placeholder copy. Marking invented testimonials up as
 * structured data is both false and a documented manual-action trigger. Add them when there
 * are real client words to attribute, and not before.
 */

type Node = Record<string, unknown>;

/** schema.org wants a state's name, not its postal abbreviation. */
const US_STATES: Record<string, string> = { GA: 'Georgia', SC: 'South Carolina' };

/** Stable @id for the studio, so other nodes can reference it instead of restating it. */
export const STUDIO_ID = `${SITE.url}/#studio`;
const WEBSITE_ID = `${SITE.url}/#website`;

/**
 * The studio itself.
 *
 * `HomeAndConstructionBusiness` is the nearest real type — schema.org has no interior
 * design vocabulary, and this is the LocalBusiness subtype Google documents for the trade.
 * `areaServed` carries the whole service region because there is no address: a studio that
 * works by appointment across two states has a service area, not a storefront.
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
    // `City` has no `addressRegion` — consumers drop unknown properties, which would
    // leave a bare "Augusta" and lose the whole point of a two-state service area.
    // `containedInPlace` is the modelled way to say which state a city is in.
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
    // Each of these is omitted rather than emitted empty — see the note in lib/site.ts.
    ...(SITE.telephone ? { telephone: SITE.telephone } : {}),
    ...(SITE.email ? { email: SITE.email } : {}),
    ...(SITE.address ? { address: { '@type': 'PostalAddress', ...SITE.address } } : {}),
    /**
     * Real, verifiable recognition — the strongest genuine signal the site has. Mirrors
     * what `/press` renders; update both together.
     */
    award: [
      'Best Curb Appeal, Custom Built Spec Home — 2026 Stellar Awards, HBA of the Aiken-Augusta Region',
      'Best Kitchen, Custom Built Spec Home — 2026 Stellar Awards, HBA of the Aiken-Augusta Region'
    ],
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

/**
 * One project. `CreativeWork` rather than `Product` or `Service` — it is a body of work
 * shown as a portfolio piece, with no price and nothing to buy.
 */
export function projectSchema(project: Project): Node {
  const { city, region } = splitLocation(project.location);

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': absoluteUrl(`/projects/${project.id}`) + '#project',
    name: project.title,
    description: project.summary,
    url: absoluteUrl(`/projects/${project.id}`),
    // `year` is all the precision the data has, so the date is year-only rather than a
    // fabricated January 1st.
    dateCreated: project.year,
    creator: { '@id': STUDIO_ID },
    locationCreated: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: city, ...(region ? { addressRegion: region } : {}) }
    },
    // Omitted entirely while the photos are placeholders. Publishing a stock interior as
    // a machine-readable depiction of this project would be a false claim — and the same
    // pooled image is reused under other project names, so three @ids would assert the
    // same photographs. Same reasoning as the absent Review schema above.
    ...(project.hasRealAssets ? { image: [project.cover, ...project.gallery].map(i => i.src) } : {}),
    isPartOf: { '@id': WEBSITE_ID }
  };
}
