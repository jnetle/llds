import { img } from '@/lib/img';
import { expandStateCode } from '@/lib/usStates';

/** One rendered photograph. `alt` is always present; until real copy arrives it is derived — see `deriveAlt`. */
export type ProjectImage = {
  src: string;
  alt: string;
};

/**
 * A gallery plate. Carries its own aspect because the masonry template publishes photographs uncropped and has to
 * reserve the right box before the file loads; the cropping templates ignore it, which is why `cover` has none.
 */
export type GalleryImage = ProjectImage & {
  /** width ÷ height. */
  aspect: number;
  /** Spans every masonry column instead of sitting in one. */
  feature: boolean;
};

/**
 * One authored photograph: its file, its words, and its shape in a single entry. These three used to be parallel
 * index-aligned structures (a count, an alt array, an aspect map keyed by slot) and nothing made them agree — a
 * miscount hid photographs, a shifted alt array described the wrong one, both silently.
 */
export type GalleryPlate = {
  /**
   * File name inside `projects/<assetKey>/`, extension included. A descriptive slug rather than the camera's own
   * name: the file name is a subject-matter signal to image search, and this is the only place it can be given one.
   */
  file: string;
  /**
   * The photographer's original file name, when `file` renames it. Nothing renders this — it is the thread back to
   * the delivered shoot, so a re-edit of one frame can be matched to the plate it replaces without guessing.
   */
  source?: string;
  /** Real alt text. Omitted -> derived, which reads as unfinished on purpose. */
  alt?: string;
  /** width ÷ height. Only the masonry template reads it; omitted -> 3/4. */
  aspect?: number;
  /**
   * Run this plate full width, breaking the masonry's columns around it. Suits the frames shot landscape — a
   * portrait one spanning both columns stands over 1.5× the content width tall, which reads as an accident.
   * Masonry only; the cropping templates ignore it.
   */
  feature?: boolean;
};

/**
 * Which layout the detail page's gallery renders.
 * - `plates`   — full-bleed stacked bands, each cropped to a fixed height. The original treatment.
 * - `masonry`  — an Unsplash-style column grid; every photograph uncropped, at its own aspect.
 */
export type GalleryTemplate = 'plates' | 'masonry';

/** A project as the site consumes it. `ProjectRecord` below is what you actually author. */
export type Project = {
  slug: string;
  /** Stable storage key for R2 object paths; may be shorter than the route slug. */
  assetKey: string;
  title: string;
  location: string;
  year: string;
  builder: string;
  /** What the studio did here, e.g. `Kitchen + Primary Bathroom Renovation`. Undefined until authored. */
  scope?: string;
  /** The lede on the detail page, one entry per paragraph. */
  intro: string[];
  /** <=160 chars — this is the meta description and the OG description. */
  summary: string;
  cover: ProjectImage;
  /** Variable length: as many plates as the project has on R2. Placeholder projects always carry 3. */
  gallery: GalleryImage[];
  galleryTemplate: GalleryTemplate;
  /** ISO date. Feeds `lastModified` in app/sitemap.ts; falls back to build time. */
  updatedAt?: string;
  /** False while the images are shared Unsplash placeholders. Anything publishing them as the studio's work checks this. */
  hasRealAssets: boolean;
};

// Unsplash placeholders, cycled across every project until real assets land on R2 under `projects/<assetKey>/`.
type PlaceholderAssets = { cover: string; gallery: string[] };

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
  slug: string;
  /**
   * Stable storage key for R2 object paths; keep immutable once images are uploaded.
   * Can differ from `slug` when you want shorter bucket paths, e.g. slug `rolland-place-2024` + assetKey `rp24`.
   */
  assetKey: string;
  title: string;
  location: string;
  year: string;
  builder: string;
  /**
   * The scope of work, shown beside the location on the detail page — `Kitchen + Primary Bathroom Renovation`.
   * Deliberately not derived: no other field knows which rooms were touched, and a guess would read as fact.
   * Omitted -> the heading is just place and year, as it was before.
   */
  scope?: string;
  /**
   * The shoot, in display order, naming files inside `projects/<assetKey>/`. Authoring the names rather than deriving
   * `gallery-N.jpg` is what makes **reordering a move in this array** — under a derived numbering it meant renaming
   * objects on R2, and `next.config.ts` caches each optimized derivative for `minimumCacheTTL` (31 days), so every
   * renamed URL would serve a stale image for a month unless invalidated by hand.
   *
   * Present and non-empty is what "this project has real photography" means; there is no separate flag to forget.
   * Omitted -> the project renders from the shared Unsplash placeholder pool.
   */
  gallery?: GalleryPlate[];
  /**
   * File backing the cover tile, in the same folder. Usually one already in `gallery` — pointing at it costs no
   * second object, and re-picking the cover becomes a one-word edit with nothing to re-upload or invalidate.
   * Omitted -> the first plate.
   */
  cover?: string;
  /** Cover alt. Omitted -> the alt of the plate `cover` names, else derived. */
  coverAlt?: string;
  /** Real lede copy, one entry per paragraph. Omitted -> derived from location/year/builder. */
  intro?: string[];
  /**
   * Real meta description, <=160 chars — it is the `<meta name="description">`, the OG description and the
   * structured-data description. Omitted -> the first paragraph of `intro`, which is only a sane default while that
   * paragraph is the derived one-liner; real lede copy runs far past 160, so author this whenever `intro` is authored.
   */
  summary?: string;
  /** Gallery layout. Omitted -> `plates`, the original full-bleed treatment. */
  galleryTemplate?: GalleryTemplate;
  /** ISO date of the last meaningful change, for the sitemap. */
  updatedAt?: string;
};

// The single ordering source for the Projects index, the home hero/strip, and detail-page prev/next.
// Keep sorted by `year` descending.
const PROJECT_META: ProjectRecord[] = [
  // Shuford
  {
    slug: 'yucca-ave',
    assetKey: 'yucca-ave',
    title: 'Yucca Ave',
    location: 'North Augusta, SC',
    year: '2026',
    builder: 'Southern State Builders'
  },
  // McDonald
  {
    slug: 'mcdonald-ln',
    assetKey: 'mcdonald-ln',
    title: 'McDonald Ln',
    location: 'Evans, GA',
    year: '2025',
    builder: 'Southern State Builders'
  },
  // Faveran
  {
    slug: 'faveran-ln',
    assetKey: 'faveran-ln',
    title: 'Faveran Ln',
    location: 'McCormick, SC',
    year: '2025',
    builder: 'Southern State Builders'
  },
  // Sanders
  {
    slug: 'johnston-two-mile-house',
    assetKey: 'two-mile-house',
    title: 'Two Mile House',
    location: 'Johnston, SC',
    year: '2025',
    builder: 'Chandler Homes',
    scope: 'Kitchen + Primary Bathroom Renovation',
    intro: [
      'Set on more than 100 acres, this longtime family home was ready for a new chapter. Working within the kitchen’s existing footprint, we reimagined the layout to make better use of the space, removing the peninsula and introducing a generous island with storage on both sides and seating at the end. A full wall of custom cabinetry created the pantry the home had always been missing, while warm brass, natural wood floors, and traditional details give the new kitchen a sense of permanence that feels at home with the property.',
      'In the primary bathroom, we replaced the existing deck-mounted tub and enclosed shower with a freestanding tub and spacious tiled shower. Separate vanities in a soft, muted green, warm brass lighting, and quiet stone finishes create a calm retreat while still feeling connected to the character of the home.'
    ],
    summary:
      'A longtime family home on more than 100 acres in Johnston, South Carolina — a reimagined kitchen and a calm primary bath by Laurel Leaf Design Studio.',
    galleryTemplate: 'masonry',
    // The cover names a file already in the shoot, so there is no second copy of it in the bucket.
    cover: 'bath-tub-window-bay.jpg',
    updatedAt: '2026-09-11',
    // Display order. Reordering this array reorders the page; nothing on R2 moves.
    // The two `feature` plates also set the masonry's run boundaries, so their positions are load-bearing for the
    // layout: they split the shoot into runs of 15 / 18 / 6, and an even run of same-shape plates packs level.
    // `aspect` is only set on the three frames shot landscape — the rest take the 3/4 default.
    gallery: [
      {
        file: 'kitchen-island-table-pendant.jpg',
        source: 'IMG-6260.jpg',
        alt: 'The Two Mile House kitchen, a stone-topped island table under a drum pendant with cream inset cabinetry run to the ceiling',
        aspect: 4 / 3
      },
      {
        file: 'kitchen-island-range-wall.jpg',
        source: 'IMG-6240.jpg',
        alt: 'Island and range wall in the Two Mile House kitchen, lit by a pair of patterned drum pendants'
      },
      {
        file: 'kitchen-island-microwave-run.jpg',
        source: 'IMG-6262.jpg',
        alt: 'The long marble island in the Two Mile House kitchen, with a built-in microwave and open shelving beyond'
      },
      {
        file: 'kitchen-island-table-legs.jpg',
        source: 'IMG-6265.jpg',
        alt: 'Turned legs of the island table in the Two Mile House kitchen, the floor opening through to the living room'
      },
      {
        file: 'kitchen-range-island-flowers.jpg',
        source: 'IMG-6419.jpg',
        alt: 'Range and island in the Two Mile House kitchen, with cut flowers and a potted fern on the counter'
      },
      {
        file: 'kitchen-island-window-sink.jpg',
        source: 'IMG-6244.jpg',
        alt: 'Island, pendants, and a window over the sink in the Two Mile House kitchen'
      },
      {
        file: 'kitchen-island-stools.jpg',
        source: 'IMG-6258.jpg',
        alt: 'The island in the Two Mile House kitchen with two wooden stools drawn up to it'
      },
      {
        file: 'kitchen-pendant-shades.jpg',
        source: 'IMG-6266.jpg',
        alt: 'The two patterned pendant shades hanging close over the sink run in the Two Mile House kitchen'
      },
      {
        file: 'kitchen-refrigerator-island-run.jpg',
        source: 'IMG-6270.jpg',
        alt: 'The Two Mile House kitchen seen past the refrigerator, island and sink run in line'
      },
      {
        file: 'kitchen-island-length-doorway.jpg',
        source: 'IMG-6389.jpg',
        alt: 'The length of the island in the Two Mile House kitchen, looking down the hardwood toward a lit doorway'
      },
      {
        file: 'kitchen-island-fern-detail.jpg',
        source: 'IMG-6410.jpg',
        alt: 'Potted fern on the marble island in the Two Mile House kitchen, built-in shelving behind'
      },
      {
        file: 'kitchen-range-hood-panelling.jpg',
        source: 'IMG-6236.jpg',
        alt: 'Range wall in the Two Mile House kitchen — honed black counters, vertical panelling, and a shaped vent hood'
      },
      {
        file: 'kitchen-farmhouse-sink-window.jpg',
        source: 'IMG-6252.jpg',
        alt: 'Window above the farmhouse sink in the Two Mile House kitchen, vent hood to one side'
      },
      {
        file: 'kitchen-island-greenery.jpg',
        source: 'IMG-6254.jpg',
        alt: 'Island in the Two Mile House kitchen with potted greenery, the farmhouse sink and window behind'
      },
      {
        file: 'kitchen-toward-bay-window.jpg',
        source: 'IMG-6278.jpg',
        alt: 'The Two Mile House kitchen looking toward the bay-window sitting area at the far end'
      },
      {
        file: 'kitchen-working-run-sitting-area.jpg',
        feature: true,
        source: 'IMG-6255.jpg',
        alt: 'The working run of the Two Mile House kitchen — farmhouse sink and honed black counters, the island opening to a window-lit sitting area',
        aspect: 4 / 3
      },
      {
        file: 'kitchen-nook-lamp-decanter.jpg',
        source: 'IMG-6234.jpg',
        alt: 'Built-in nook in the Two Mile House kitchen, with a lamp, framed art, and a decanter tray on black stone'
      },
      {
        file: 'kitchen-cabinetry-run-hall.jpg',
        source: 'IMG-6246.jpg',
        alt: 'Floor-to-ceiling cabinetry running the length of the Two Mile House kitchen toward the hall'
      },
      {
        file: 'kitchen-nook-cookbooks.jpg',
        source: 'IMG-6248.jpg',
        alt: 'The built-in nook in the Two Mile House kitchen, shelved with cookbooks above a framed picture and lamp'
      },
      {
        file: 'kitchen-cabinetry-glazed-door.jpg',
        source: 'IMG-6249.jpg',
        alt: 'Tall cabinetry and the built-in nook in the Two Mile House kitchen, beside a glazed door'
      },
      {
        file: 'kitchen-island-nook-door.jpg',
        source: 'IMG-6250.jpg',
        alt: 'Island and built-in nook in the Two Mile House kitchen, the door at the end framing greenery outside'
      },
      {
        file: 'kitchen-corner-range-sink.jpg',
        source: 'IMG-6237.jpg',
        alt: 'Corner cabinetry, range, and farmhouse sink in the Two Mile House kitchen'
      },
      {
        file: 'kitchen-island-table-centred.jpg',
        source: 'IMG-6259.jpg',
        alt: 'The Two Mile House kitchen head-on: the island table centred under its pendant, stools either side'
      },
      {
        file: 'kitchen-refrigerator-wall.jpg',
        source: 'IMG-6261.jpg',
        alt: 'The refrigerator wall in the Two Mile House kitchen, cabinetry carried over the top'
      },
      {
        file: 'kitchen-range-island-greenery.jpg',
        source: 'IMG-6275.jpg',
        alt: 'Range and island in the Two Mile House kitchen, greenery on the counter'
      },
      {
        file: 'kitchen-across-island-shelving.jpg',
        source: 'IMG-6276.jpg',
        alt: 'The Two Mile House kitchen across the island, range wall and built-in shelving together'
      },
      {
        file: 'bath-double-vanity-mirrors.jpg',
        source: 'IMG-6281.jpg',
        alt: 'Double vanity in the Two Mile House primary bath, arched mirrors flanked by brass sconces above pale cabinetry'
      },
      {
        file: 'bath-double-vanity-wide.jpg',
        source: 'IMG-6282.jpg',
        alt: 'The full double vanity in the Two Mile House primary bath, mirrors and sconces in line'
      },
      {
        file: 'bath-vanity-corner-towels.jpg',
        source: 'IMG-6284.jpg',
        alt: 'Corner of the vanity in the Two Mile House primary bath, folded towels on the open shelving'
      },
      {
        file: 'bath-vanity-mirrors-column.jpg',
        source: 'IMG-6287.jpg',
        alt: 'Vanity corner in the Two Mile House primary bath, the arched mirrors meeting at the shelved column'
      },
      {
        file: 'bath-vanity-coral-shelf.jpg',
        source: 'IMG-6295.jpg',
        alt: 'Vanity in the Two Mile House primary bath — arched mirror, brass sconces, and coral on the open shelf'
      },
      {
        file: 'bath-vanity-basin-faucet.jpg',
        source: 'IMG-6310.jpg',
        alt: 'Basin and faucet at the vanity in the Two Mile House primary bath, mirror and sconce above'
      },
      {
        file: 'bath-vanity-basin-towels.jpg',
        source: 'IMG-6311.jpg',
        alt: 'Vanity basin in the Two Mile House primary bath, with stacked towels on the shelving alongside'
      },
      {
        file: 'bath-folded-towels-detail.jpg',
        source: 'IMG-6314.jpg',
        alt: 'Folded towels on the marble vanity top in the Two Mile House primary bath'
      },
      {
        file: 'bath-double-vanity-shelving.jpg',
        feature: true,
        source: 'IMG-6337.jpg',
        alt: 'Double vanity in the Two Mile House primary bath, with arched mirrors, brass sconces, and open corner shelving between the two basins',
        aspect: 4 / 3
      },
      {
        file: 'bath-vanity-run-shower.jpg',
        source: 'IMG-6338.jpg',
        alt: 'The vanity run in the Two Mile House primary bath, looking toward the tiled shower'
      },
      {
        file: 'bath-shower-tub-beyond.jpg',
        source: 'IMG-6288.jpg',
        alt: 'Subway-tiled walk-in shower in the Two Mile House primary bath, the tub visible beyond the glass'
      },
      {
        file: 'bath-tub-beside-shower.jpg',
        source: 'IMG-6289.jpg',
        alt: 'The freestanding tub in the Two Mile House primary bath, set beneath the windows beside the shower'
      },
      {
        file: 'bath-shower-glass-tub.jpg',
        source: 'IMG-6290.jpg',
        alt: 'Shower glass and freestanding tub in the Two Mile House primary bath, daylight from the window bay'
      },
      {
        file: 'bath-tub-window-bay.jpg',
        source: 'IMG-6309.jpg',
        alt: 'A freestanding tub beneath a bay of windows in the Two Mile House primary bath, a subway-tiled walk-in shower alongside'
      },
      {
        file: 'bath-mosaic-tile-floor.jpg',
        source: 'IMG-6330.jpg',
        alt: 'Mosaic tile floor in the Two Mile House primary bath shower, laid around a patterned drain'
      }
    ]
  },
  // Brown
  {
    slug: 'holiday-rd',
    assetKey: 'holiday-rd',
    title: 'Holiday Rd',
    location: 'McCormick, SC',
    year: '2024',
    builder: 'Southern State Builders'
  },
  // Roberson
  { slug: 'gordon-dr', assetKey: 'gordon-dr', title: 'Gordon Dr', location: 'Modoc, SC', year: '2024', builder: 'Zook Homes' },
  // Ross
  {
    slug: 'rolland-place-2024',
    assetKey: 'rolland-place-2024',
    title: 'Rolland Place (2024)',
    location: 'McCormick, SC',
    year: '2024',
    builder: 'Southern State Builders'
  },
  // McCann
  {
    slug: 'amelia-dr',
    assetKey: 'amelia-dr',
    title: 'Amelia Dr',
    location: 'McCormick, SC',
    year: '2024',
    builder: 'Southern State Builders'
  },
  // Fisher
  {
    slug: 'north-augusta-river-club-kitchen',
    assetKey: 'riverclub-ln',
    title: 'River Club Kitchen',
    location: 'North Augusta, SC',
    year: '2024',
    builder: 'Southern State Builders'
  },
  // Campbell
  {
    slug: 'martinez-heatherstone-kitchen',
    assetKey: 'heatherstone-way',
    title: 'Heatherstone Kitchen',
    location: 'Martinez, GA',
    year: '2024',
    builder: 'Southern State Builders'
  },
  // Willingham
  {
    slug: 'aiken-homestead',
    assetKey: 'atomic-rd',
    title: 'Aiken Homestead',
    location: 'Aiken, SC',
    year: '2024',
    builder: 'Southern State Builders'
  },
  // Woodward
  {
    slug: 'aiken-heathwood-house',
    assetKey: 'heathwood-dr',
    title: 'Heathwood House',
    location: 'Aiken, SC',
    year: '2024',
    builder: 'Chandler Homes'
  },
  // Bernal
  {
    slug: 'mccormick-modern-escape',
    assetKey: 'rolland-place-2023',
    title: 'Rolland Place (2023)',
    location: 'McCormick, SC',
    year: '2023',
    builder: 'Southern State Builders'
  },
  // Guha
  {
    slug: 'augusta-conifer-modern-tudor',
    assetKey: 'conifer-rd',
    title: 'Conifer Modern Tudor',
    location: 'Augusta, GA',
    year: '2022',
    builder: 'Southern State Builders'
  },
  // Wachowicz
  {
    slug: 'martinez-kestwick-kitchen',
    assetKey: 'kestwick-dr',
    title: 'Kestwick Kitchen',
    location: 'Martinez, GA',
    year: '2022',
    builder: 'Southern State Builders'
  }
];

// ── Derivation ──────────────────────────────────────────────────────────────
// Fills the gaps in a ProjectRecord. Each fallback is deliberately provisional-sounding, so a page rendering derived
// copy reads as unfinished rather than as an editorial choice.

const deriveIntro = (m: ProjectRecord): string[] => [`A home in ${m.location}, completed in ${m.year} with ${m.builder}.`];

/** A project has real photography exactly when its shoot has been authored. No separate flag to fall out of step. */
const hasRealAssets = (m: ProjectRecord): boolean => Boolean(m.gallery?.length);

/** Derived alt text — a floor, not a finish. Search engines discount formulaic alt text; set `alt` on the plate. */
const deriveAlt = (m: ProjectRecord, index: number | 'cover'): string => {
  // A placeholder must not claim to depict this project: it is a stock interior reused under other project names.
  if (!hasRealAssets(m)) return `Placeholder interior photograph for ${m.title}`;
  return index === 'cover'
    ? `${m.title} — interior design in ${m.location} by Laurel Leaf Design Studio`
    : `${m.title}, interior view ${index + 1} — ${m.location}`;
};

/** Portrait 3:4 — what the placeholder pool is cropped to, and the shape most interiors are shot in. */
const DEFAULT_ASPECT = 3 / 4;

/** Only the folder is derived now; the leaf is authored, per the bucket layout in AGENTS.md. */
const plateUrl = (assetKey: string, file: string): string => img(`projects/${assetKey}/${file}`);

const buildProject = (m: ProjectRecord, i: number): Project => {
  const intro = m.intro ?? deriveIntro(m);
  const plates = m.gallery;
  const pool = PLACEHOLDER_ASSETS[i % PLACEHOLDER_ASSETS.length];

  const gallery: GalleryImage[] = plates?.length
    ? plates.map((plate, gi) => ({
        src: plateUrl(m.assetKey, plate.file),
        alt: plate.alt ?? deriveAlt(m, gi),
        aspect: plate.aspect ?? DEFAULT_ASPECT,
        feature: plate.feature === true
      }))
    : pool.gallery.map((src, gi) => ({ src, alt: deriveAlt(m, gi), aspect: DEFAULT_ASPECT, feature: false }));

  // Naming a file already in `gallery` is the normal case, so the cover inherits that plate's words rather than
  // restating them — one photograph, one description, no way for the two to disagree.
  //
  // Gated on the gallery, not on `cover` alone: `hasRealAssets` keys off the gallery, so a record carrying only a
  // cover would resolve a real R2 photograph and then label it "Placeholder interior photograph", while the hero
  // below it still showed Unsplash. Ignoring a lone `cover` keeps the project wholly on placeholders until the
  // shoot is authored, which is the one coherent state.
  const coverFile = plates?.length ? (m.cover ?? plates[0].file) : undefined;
  const cover: ProjectImage = coverFile
    ? {
        src: plateUrl(m.assetKey, coverFile),
        alt: m.coverAlt ?? plates?.find(plate => plate.file === coverFile)?.alt ?? deriveAlt(m, 'cover')
      }
    : { src: pool.cover, alt: deriveAlt(m, 'cover') };

  return {
    slug: m.slug,
    assetKey: m.assetKey,
    title: m.title,
    location: m.location,
    year: m.year,
    builder: m.builder,
    scope: m.scope,
    intro,
    summary: m.summary ?? intro[0],
    updatedAt: m.updatedAt,
    hasRealAssets: hasRealAssets(m),
    cover,
    galleryTemplate: m.galleryTemplate ?? 'plates',
    gallery
  };
};

export const PROJECTS: Project[] = PROJECT_META.map(buildProject);

/** Lookup by slug. Slugs are hand-authored, never generated. */
export const getProject = (slug: string): Project | undefined => PROJECTS.find(p => p.slug === slug);

/** `"Aiken, SC"` → `{ city: 'Aiken', region: 'SC' }`. Anything not in that shape degrades to the whole string as city. */
export const splitLocation = (location: string): { city: string; region?: string } => {
  const [city, region] = location.split(',').map(part => part.trim());
  return region ? { city, region } : { city };
};

/**
 * `"Johnston, SC"` → `"Johnston, South Carolina"`, for the project detail heading. Display only: the record keeps
 * the short form, which is what the tiles, the `<title>` and the structured data all want.
 */
export const formatLocationLong = (location: string): string => {
  const { city, region } = splitLocation(location);
  return region ? `${city}, ${expandStateCode(region)}` : city;
};
