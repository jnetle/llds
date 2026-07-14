export type ProjectCategory = 'renovation' | 'new-build';

export type Project = {
  id: string;
  title: string;
  location: string;
  year: string;
  builder: string;
  category: ProjectCategory;
  cover: string;
  intro: string;
  gallery: [string, string, string];
};

// Display order and labels for the grouped Projects index. Single source of
// truth so the component never hardcodes category strings or copy.
export const CATEGORY_ORDER: ProjectCategory[] = ['renovation', 'new-build'];

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  renovation: 'Renovations',
  'new-build': 'New Builds'
};

// Placeholder imagery. These are the original Unsplash sets, kept as a small
// pool and cycled across every project (`i % POOL.length`) until real assets
// land in `public/images/projects/<slug>/` per the CLAUDE.md workflow.
type Assets = Pick<Project, 'cover' | 'gallery'>;

const PLACEHOLDER_ASSETS: Assets[] = [
  {
    cover: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    cover: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    cover: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    cover: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    cover: 'https://images.unsplash.com/photo-1616593969747-4797dc75033e?auto=format&fit=crop&w=1800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1616593969747-4797dc75033e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    cover: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    cover: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1600&q=80'
    ]
  }
];

// Core project metadata. Titles are the street name (a working placeholder until
// final names are chosen); the owner's surname is intentionally omitted from
// every value and every slug for privacy. The `// <surname>` comments are for
// internal mapping only and are stripped from the production bundle — remove
// them if you'd rather not keep surnames in source at all.
type ProjectMeta = Pick<Project, 'id' | 'title' | 'location' | 'year' | 'builder' | 'category'>;

const PROJECT_META: ProjectMeta[] = [
  // Guha
  {
    id: 'conifer-rd',
    title: 'Conifer Rd',
    location: 'Augusta, GA',
    year: '2022',
    builder: 'Southern State Builders',
    category: 'new-build'
  },
  // Bernal
  {
    id: 'rolland-place-2023',
    title: 'Rolland Place (2023)',
    location: 'McCormick, SC',
    year: '2023',
    builder: 'Southern State Builders',
    category: 'new-build'
  },
  // Brown
  {
    id: 'holiday-rd',
    title: 'Holiday Rd',
    location: 'McCormick, SC',
    year: '2024',
    builder: 'Southern State Builders',
    category: 'new-build'
  },
  // Roberson
  { id: 'gordon-dr', title: 'Gordon Dr', location: 'Modoc, SC', year: '2024', builder: 'Zook Homes', category: 'new-build' },
  // Ross
  {
    id: 'rolland-place-2024',
    title: 'Rolland Place (2024)',
    location: 'McCormick, SC',
    year: '2024',
    builder: 'Southern State Builders',
    category: 'new-build'
  },
  // McCann
  {
    id: 'amelia-dr',
    title: 'Amelia Dr',
    location: 'McCormick, SC',
    year: '2024',
    builder: 'Southern State Builders',
    category: 'new-build'
  },
  // McDonald
  {
    id: 'mcdonald-ln',
    title: 'McDonald Ln',
    location: 'Evans, GA',
    year: '2025',
    builder: 'Southern State Builders',
    category: 'new-build'
  },
  // Faveran
  {
    id: 'faveran-ln',
    title: 'Faveran Ln',
    location: 'McCormick, SC',
    year: '2025',
    builder: 'Southern State Builders',
    category: 'new-build'
  },
  // Shuford
  {
    id: 'yucca-ave',
    title: 'Yucca Ave',
    location: 'North Augusta, SC',
    year: '2026',
    builder: 'Southern State Builders',
    category: 'new-build'
  },
  // Wachowicz
  {
    id: 'kestwick-dr',
    title: 'Kestwick Dr',
    location: 'Martinez, GA',
    year: '2022',
    builder: 'Southern State Builders',
    category: 'renovation'
  },
  // Fisher
  {
    id: 'riverclub-ln',
    title: 'Riverclub Ln',
    location: 'North Augusta, SC',
    year: '2024',
    builder: 'Southern State Builders',
    category: 'renovation'
  },
  // Campbell
  {
    id: 'heatherstone-way',
    title: 'Heatherstone Way',
    location: 'Martinez, GA',
    year: '2024',
    builder: 'Southern State Builders',
    category: 'renovation'
  },
  // Willingham
  { id: 'atomic-rd', title: 'Atomic Rd', location: 'Aiken, SC', year: '2024', builder: 'Southern State Builders', category: 'renovation' },
  // Woodward
  { id: 'heathwood-dr', title: 'Heathwood Dr', location: 'Aiken, SC', year: '2024', builder: 'Chandler Homes', category: 'renovation' },
  // Sanders
  { id: 'two-mile-dr', title: 'Two Mile Dr', location: 'Johnston, SC', year: '2025', builder: 'Chandler Homes', category: 'renovation' }
];

// Neutral placeholder intro copy derived from the facts we have. Replace with
// real project descriptions when available.
const buildIntro = (m: ProjectMeta): string =>
  m.category === 'new-build'
    ? `A new home in ${m.location}, completed in ${m.year} in collaboration with ${m.builder}.`
    : `A full renovation in ${m.location}, completed in ${m.year} with ${m.builder}.`;

export const PROJECTS: Project[] = PROJECT_META.map((m, i) => {
  const assets = PLACEHOLDER_ASSETS[i % PLACEHOLDER_ASSETS.length];
  return { ...m, ...assets, intro: buildIntro(m) };
});

export const projectsByCategory = (category: ProjectCategory) => PROJECTS.filter(p => p.category === category);
