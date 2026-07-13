export type ProjectCategory = 'renovation' | 'new-build';

export type Project = {
  id: string;
  title: string;
  location: string;
  year: string;
  discipline: string;
  category: ProjectCategory;
  cover: string;
  palette: [string, string, string];
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

export const PROJECTS: Project[] = [
  {
    id: 'highgate',
    title: 'Highgate Residence',
    location: 'North London',
    year: '2025',
    discipline: 'Full Interior Architecture',
    category: 'renovation',
    cover: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=80',
    palette: ['#C8B89B', '#6B5C42', '#2A2E25'],
    intro:
      'A late Victorian villa reimagined as a quiet sanctuary for a family of four. Reclaimed oak, lime plaster, and hand-thrown ceramics anchor a layered palette of moss, ochre, and ivory.',
    gallery: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    id: 'arles',
    title: 'Maison d’Arles',
    location: 'Provence, France',
    year: '2024',
    discipline: 'Restoration & Furnishing',
    category: 'renovation',
    cover: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1800&q=80',
    palette: ['#E8DEC8', '#A88A5C', '#3A2A1C'],
    intro:
      'An 18th century mas restored with restraint. Lime-washed walls, terracotta floors, and antique linens converse with contemporary art and bespoke walnut joinery.',
    gallery: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    id: 'shoreditch',
    title: 'Shoreditch Loft',
    location: 'East London',
    year: '2025',
    discipline: 'Apartment Conversion',
    category: 'renovation',
    cover: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=80',
    palette: ['#D4CDB8', '#8E7B5C', '#202220'],
    intro:
      'A former print works converted into a single-storey loft. Industrial scale tempered by velvet, brushed brass, and a muted earth-toned palette.',
    gallery: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    id: 'kentcoast',
    title: 'Coast House, Kent',
    location: 'Whitstable',
    year: '2024',
    discipline: 'New Build Interiors',
    category: 'new-build',
    cover: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1800&q=80',
    palette: ['#E5DECF', '#9CA193', '#2D332C'],
    intro:
      'A weather-board house perched above the shingle. Pale oak floors, heavy linen, ceramic and limewash echo the bleached light of the North Kent coast.',
    gallery: [
      'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    id: 'marylebone',
    title: 'Marylebone Pied-à-Terre',
    location: 'Central London',
    year: '2025',
    discipline: 'Apartment Refurbishment',
    category: 'renovation',
    cover: 'https://images.unsplash.com/photo-1616593969747-4797dc75033e?auto=format&fit=crop&w=1800&q=80',
    palette: ['#D8C9A8', '#7A6442', '#2A2520'],
    intro:
      'A compact two-bedroom mansion flat reworked around a single long sightline. Burl walnut, unlacquered brass, and heavy wool drapery soften the proportions.',
    gallery: [
      'https://images.unsplash.com/photo-1616593969747-4797dc75033e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    id: 'cotswold',
    title: 'Cotswold Barn',
    location: 'Gloucestershire',
    year: '2025',
    discipline: 'Agricultural Conversion',
    category: 'renovation',
    cover: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1800&q=80',
    palette: ['#E2D9C3', '#8B7A5A', '#2B2820'],
    intro:
      'An 18th-century stone threshing barn converted into a single-volume family home. Raw oak trusses, hand-finished plaster, and a low palette of bracken and moss.',
    gallery: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  {
    id: 'hampstead',
    title: 'Hampstead Townhouse',
    location: 'North West London',
    year: '2026',
    discipline: 'Listed Restoration',
    category: 'renovation',
    cover: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1800&q=80',
    palette: ['#D9D3C1', '#6F6A52', '#24261F'],
    intro:
      'A Grade II listed Georgian townhouse returned to period proportions and quietly modernised. Tonal wall colour, slipper chairs, antiquarian books, and heavy glazed linens.',
    gallery: [
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1600&q=80'
    ]
  }
];

export const projectsByCategory = (category: ProjectCategory) => PROJECTS.filter(p => p.category === category);
