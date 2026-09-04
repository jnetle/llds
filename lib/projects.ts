import { img } from '@/lib/img';

/** One rendered photograph. `alt` is always present; until real copy arrives it is derived — see `deriveAlt`. */
export type ProjectImage = {
  src: string;
  alt: string;
};

/** A project as the site consumes it. `ProjectRecord` below is what you actually author. */
export type Project = {
  id: string;
  title: string;
  location: string;
  year: string;
  builder: string;
  /** The lede on the detail page. */
  intro: string;
  /** <=160 chars — this is the meta description and the OG description. */
  summary: string;
  cover: ProjectImage;
  gallery: [ProjectImage, ProjectImage, ProjectImage];
  /** ISO date. Feeds `lastModified` in app/sitemap.ts; falls back to build time. */
  updatedAt?: string;
  /** False while the images are shared Unsplash placeholders. Anything publishing them as the studio's work checks this. */
  hasRealAssets: boolean;
};

// Unsplash placeholders, cycled across every project until real assets land on R2 under `projects/<slug>/`.
type PlaceholderAssets = { cover: string; gallery: [string, string, string] };

const PLACEHOLDER_ASSETS: PlaceholderAssets[] = [
  {
    cover: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    cover: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=2400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    cover: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    cover: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=2400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    cover: 'https://images.unsplash.com/photo-1616593969747-4797dc75033e?auto=format&fit=crop&w=2400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1616593969747-4797dc75033e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    cover: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=2400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    cover: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=2400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1600&q=80'
    ]
  }
];

// Titles are the street name; owners' surnames are kept out of every value and slug for privacy, and survive only as
// the `// <surname>` mapping comments below, which are stripped from the production bundle.
/**
 * What you author. Only the first five fields are required; the rest are slots for content that has not arrived and is
 * derived until it does — so importing a finished project is an edit to one record, never to a component.
 */
type ProjectRecord = {
  id: string;
  title: string;
  location: string;
  year: string;
  builder: string;
  /** Flip once `cover.jpg` and `gallery-1..3.jpg` are on R2 under `projects/<id>/`. URLs derive from the id. */
  assetsReady?: boolean;
  /** Real lede copy. Omitted -> derived from location/year/builder. */
  intro?: string;
  /** Real meta description, <=160 chars. Omitted -> falls back to `intro`. */
  summary?: string;
  /** Real per-photo alt text. Omitted -> derived. Gallery indices match `gallery-N`. */
  alt?: { cover?: string; gallery?: [string?, string?, string?] };
  /** ISO date of the last meaningful change, for the sitemap. */
  updatedAt?: string;
};

// The single ordering source for the Projects index, the home hero/strip, and detail-page prev/next.
// Keep sorted by `year` descending.
const PROJECT_META: ProjectRecord[] = [
  // Shuford
  { id: 'yucca-ave', title: 'Yucca Ave', location: 'North Augusta, SC', year: '2026', builder: 'Southern State Builders' },
  // McDonald
  { id: 'mcdonald-ln', title: 'McDonald Ln', location: 'Evans, GA', year: '2025', builder: 'Southern State Builders' },
  // Faveran
  { id: 'faveran-ln', title: 'Faveran Ln', location: 'McCormick, SC', year: '2025', builder: 'Southern State Builders' },
  // Sanders
  { id: 'two-mile-dr', title: 'Two Mile Dr', location: 'Johnston, SC', year: '2025', builder: 'Chandler Homes' },
  // Brown
  { id: 'holiday-rd', title: 'Holiday Rd', location: 'McCormick, SC', year: '2024', builder: 'Southern State Builders' },
  // Roberson
  { id: 'gordon-dr', title: 'Gordon Dr', location: 'Modoc, SC', year: '2024', builder: 'Zook Homes' },
  // Ross
  { id: 'rolland-place-2024', title: 'Rolland Place (2024)', location: 'McCormick, SC', year: '2024', builder: 'Southern State Builders' },
  // McCann
  { id: 'amelia-dr', title: 'Amelia Dr', location: 'McCormick, SC', year: '2024', builder: 'Southern State Builders' },
  // Fisher
  { id: 'riverclub-ln', title: 'Riverclub Ln', location: 'North Augusta, SC', year: '2024', builder: 'Southern State Builders' },
  // Campbell
  { id: 'heatherstone-way', title: 'Heatherstone Way', location: 'Martinez, GA', year: '2024', builder: 'Southern State Builders' },
  // Willingham
  { id: 'atomic-rd', title: 'Atomic Rd', location: 'Aiken, SC', year: '2024', builder: 'Southern State Builders' },
  // Woodward
  { id: 'heathwood-dr', title: 'Heathwood Dr', location: 'Aiken, SC', year: '2024', builder: 'Chandler Homes' },
  // Bernal
  { id: 'rolland-place-2023', title: 'Rolland Place (2023)', location: 'McCormick, SC', year: '2023', builder: 'Southern State Builders' },
  // Guha
  { id: 'conifer-rd', title: 'Conifer Rd', location: 'Augusta, GA', year: '2022', builder: 'Southern State Builders' },
  // Wachowicz
  { id: 'kestwick-dr', title: 'Kestwick Dr', location: 'Martinez, GA', year: '2022', builder: 'Southern State Builders' }
];

// ── Derivation ──────────────────────────────────────────────────────────────
// Fills the gaps in a ProjectRecord. Each fallback is deliberately provisional-sounding, so a page rendering derived
// copy reads as unfinished rather than as an editorial choice.

const deriveIntro = (m: ProjectRecord): string => `A home in ${m.location}, completed in ${m.year} with ${m.builder}.`;

/** Derived alt text — a floor, not a finish. Search engines discount formulaic alt text; set `alt` on the record. */
const deriveAlt = (m: ProjectRecord, index: number | 'cover'): string => {
  // A placeholder must not claim to depict this project: it is a stock interior reused under other project names.
  if (!m.assetsReady) return `Placeholder interior photograph for ${m.title}`;
  return index === 'cover'
    ? `${m.title} — interior design in ${m.location} by Laurel Leaf Design Studio`
    : `${m.title}, interior view ${index + 1} — ${m.location}`;
};

/** R2 keys are deterministic from the slug, per the bucket layout in AGENTS.md. */
const realAssets = (id: string): PlaceholderAssets => ({
  cover: img(`projects/${id}/cover.jpg`),
  gallery: [img(`projects/${id}/gallery-1.jpg`), img(`projects/${id}/gallery-2.jpg`), img(`projects/${id}/gallery-3.jpg`)]
});

const buildProject = (m: ProjectRecord, i: number): Project => {
  const src = m.assetsReady ? realAssets(m.id) : PLACEHOLDER_ASSETS[i % PLACEHOLDER_ASSETS.length];
  const intro = m.intro ?? deriveIntro(m);

  return {
    id: m.id,
    title: m.title,
    location: m.location,
    year: m.year,
    builder: m.builder,
    intro,
    summary: m.summary ?? intro,
    updatedAt: m.updatedAt,
    hasRealAssets: m.assetsReady === true,
    cover: { src: src.cover, alt: m.alt?.cover ?? deriveAlt(m, 'cover') },
    gallery: src.gallery.map((s, gi) => ({ src: s, alt: m.alt?.gallery?.[gi] ?? deriveAlt(m, gi) })) as [
      ProjectImage,
      ProjectImage,
      ProjectImage
    ]
  };
};

export const PROJECTS: Project[] = PROJECT_META.map(buildProject);

/** Lookup by slug. The id *is* the slug — hand-authored, never generated. */
export const getProject = (slug: string): Project | undefined => PROJECTS.find(p => p.id === slug);

/** `"Aiken, SC"` → `{ city: 'Aiken', region: 'SC' }`. Anything not in that shape degrades to the whole string as city. */
export const splitLocation = (location: string): { city: string; region?: string } => {
  const [city, region] = location.split(',').map(part => part.trim());
  return region ? { city, region } : { city };
};
