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

// The authored source for every project on the site. `PROJECTS` below is what the pages actually render — it drops
// the records still on placeholder photography — and is the single ordering source for the Projects index, the home
// hero/strip, and detail-page prev/next. Authored newest-first; `PROJECTS` below re-sorts by `year` descending, so a record dropped in the wrong place
// still lands in the right year. Order *within* a year is this array's alone — nothing else expresses it.
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
    cover: 'kitchen-range-island-flowers.jpg',
    updatedAt: '2026-09-11',
    // Display order. Reordering this array reorders the page; nothing on R2 moves.
    // The two `feature` plates also set the masonry's run boundaries, so their positions are load-bearing for the
    // layout: they split the shoot into runs of 15 / 18 / 6, and an even run of same-shape plates packs level.
    // `aspect` is only set on the three frames shot landscape — the rest take the 3/4 default.
    gallery: [
      {
        file: 'kitchen-island-table-pendant.jpg',
        alt: 'The Two Mile House kitchen, a stone-topped island table under a drum pendant with cream inset cabinetry run to the ceiling',
        aspect: 4 / 3
      },
      {
        file: 'kitchen-island-range-wall.jpg',
        alt: 'Island and range wall in the Two Mile House kitchen, lit by a pair of patterned drum pendants'
      },
      {
        file: 'kitchen-island-microwave-run.jpg',
        alt: 'The long marble island in the Two Mile House kitchen, with a built-in microwave and open shelving beyond'
      },
      {
        file: 'kitchen-island-table-legs.jpg',
        alt: 'Turned legs of the island table in the Two Mile House kitchen, the floor opening through to the living room'
      },
      {
        file: 'kitchen-range-island-flowers.jpg',
        alt: 'Range and island in the Two Mile House kitchen, with cut flowers and a potted fern on the counter'
      },
      {
        file: 'kitchen-island-window-sink.jpg',
        alt: 'Island, pendants, and a window over the sink in the Two Mile House kitchen'
      },
      {
        file: 'kitchen-island-stools.jpg',
        alt: 'The island in the Two Mile House kitchen with two wooden stools drawn up to it'
      },
      {
        file: 'kitchen-pendant-shades.jpg',
        alt: 'The two patterned pendant shades hanging close over the sink run in the Two Mile House kitchen'
      },
      {
        file: 'kitchen-refrigerator-island-run.jpg',
        alt: 'The Two Mile House kitchen seen past the refrigerator, island and sink run in line'
      },
      {
        file: 'kitchen-island-length-doorway.jpg',
        alt: 'The length of the island in the Two Mile House kitchen, looking down the hardwood toward a lit doorway'
      },
      {
        file: 'kitchen-island-fern-detail.jpg',
        alt: 'Potted fern on the marble island in the Two Mile House kitchen, built-in shelving behind'
      },
      {
        file: 'kitchen-range-hood-panelling.jpg',
        alt: 'Range wall in the Two Mile House kitchen — honed black counters, vertical panelling, and a shaped vent hood'
      },
      {
        file: 'kitchen-farmhouse-sink-window.jpg',
        alt: 'Window above the farmhouse sink in the Two Mile House kitchen, vent hood to one side'
      },
      {
        file: 'kitchen-island-greenery.jpg',
        alt: 'Island in the Two Mile House kitchen with potted greenery, the farmhouse sink and window behind'
      },
      {
        file: 'kitchen-toward-bay-window.jpg',
        alt: 'The Two Mile House kitchen looking toward the bay-window sitting area at the far end'
      },
      {
        file: 'kitchen-working-run-sitting-area.jpg',
        feature: true,
        alt: 'The working run of the Two Mile House kitchen — farmhouse sink and honed black counters, the island opening to a window-lit sitting area',
        aspect: 4 / 3
      },
      {
        file: 'kitchen-nook-lamp-decanter.jpg',
        alt: 'Built-in nook in the Two Mile House kitchen, with a lamp, framed art, and a decanter tray on black stone'
      },
      {
        file: 'kitchen-cabinetry-run-hall.jpg',
        alt: 'Floor-to-ceiling cabinetry running the length of the Two Mile House kitchen toward the hall'
      },
      {
        file: 'kitchen-nook-cookbooks.jpg',
        alt: 'The built-in nook in the Two Mile House kitchen, shelved with cookbooks above a framed picture and lamp'
      },
      {
        file: 'kitchen-cabinetry-glazed-door.jpg',
        alt: 'Tall cabinetry and the built-in nook in the Two Mile House kitchen, beside a glazed door'
      },
      {
        file: 'kitchen-island-nook-door.jpg',
        alt: 'Island and built-in nook in the Two Mile House kitchen, the door at the end framing greenery outside'
      },
      {
        file: 'kitchen-corner-range-sink.jpg',
        alt: 'Corner cabinetry, range, and farmhouse sink in the Two Mile House kitchen'
      },
      {
        file: 'kitchen-island-table-centred.jpg',
        alt: 'The Two Mile House kitchen head-on: the island table centred under its pendant, stools either side'
      },
      {
        file: 'kitchen-refrigerator-wall.jpg',
        alt: 'The refrigerator wall in the Two Mile House kitchen, cabinetry carried over the top'
      },
      {
        file: 'kitchen-range-island-greenery.jpg',
        alt: 'Range and island in the Two Mile House kitchen, greenery on the counter'
      },
      {
        file: 'kitchen-across-island-shelving.jpg',
        alt: 'The Two Mile House kitchen across the island, range wall and built-in shelving together'
      },
      {
        file: 'bath-double-vanity-mirrors.jpg',
        alt: 'Double vanity in the Two Mile House primary bath, arched mirrors flanked by brass sconces above pale cabinetry'
      },
      {
        file: 'bath-double-vanity-wide.jpg',
        alt: 'The full double vanity in the Two Mile House primary bath, mirrors and sconces in line'
      },
      {
        file: 'bath-vanity-corner-towels.jpg',
        alt: 'Corner of the vanity in the Two Mile House primary bath, folded towels on the open shelving'
      },
      {
        file: 'bath-vanity-mirrors-column.jpg',
        alt: 'Vanity corner in the Two Mile House primary bath, the arched mirrors meeting at the shelved column'
      },
      {
        file: 'bath-vanity-coral-shelf.jpg',
        alt: 'Vanity in the Two Mile House primary bath — arched mirror, brass sconces, and coral on the open shelf'
      },
      {
        file: 'bath-vanity-basin-faucet.jpg',
        alt: 'Basin and faucet at the vanity in the Two Mile House primary bath, mirror and sconce above'
      },
      {
        file: 'bath-vanity-basin-towels.jpg',
        alt: 'Vanity basin in the Two Mile House primary bath, with stacked towels on the shelving alongside'
      },
      {
        file: 'bath-folded-towels-detail.jpg',
        alt: 'Folded towels on the marble vanity top in the Two Mile House primary bath'
      },
      {
        file: 'bath-double-vanity-shelving.jpg',
        feature: true,
        alt: 'Double vanity in the Two Mile House primary bath, with arched mirrors, brass sconces, and open corner shelving between the two basins',
        aspect: 4 / 3
      },
      {
        file: 'bath-vanity-run-shower.jpg',
        alt: 'The vanity run in the Two Mile House primary bath, looking toward the tiled shower'
      },
      {
        file: 'bath-shower-tub-beyond.jpg',
        alt: 'Subway-tiled walk-in shower in the Two Mile House primary bath, the tub visible beyond the glass'
      },
      {
        file: 'bath-tub-beside-shower.jpg',
        alt: 'The freestanding tub in the Two Mile House primary bath, set beneath the windows beside the shower'
      },
      {
        file: 'bath-shower-glass-tub.jpg',
        alt: 'Shower glass and freestanding tub in the Two Mile House primary bath, daylight from the window bay'
      },
      {
        file: 'bath-tub-window-bay.jpg',
        alt: 'A freestanding tub beneath a bay of windows in the Two Mile House primary bath, a subway-tiled walk-in shower alongside'
      },
      {
        file: 'bath-mosaic-tile-floor.jpg',
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
    assetKey: 'riverclub-kitchen',
    title: 'River Club Kitchen',
    location: 'North Augusta, SC',
    year: '2024',
    builder: 'Southern State Builders',
    scope: 'Kitchen Renovation',
    intro: [
      'In this North Augusta golf community, entertaining is part of everyday life, but a closed-off kitchen made hosting a crowd difficult. We removed the wall separating the kitchen and living room and reworked the layout around a spacious new island, giving the homeowners plenty of room for friends to gather while keeping the cook part of the conversation.',
      'Beyond the kitchen, every bit of space was put to work. A new scullery-style working pantry with a full-size sink and second dishwasher keeps entertaining cleanup out of sight, while the back entry gained built-in mudroom storage for everything that doesn’t need to make its way into the house. Even a small former closet found a new purpose as a dedicated coffee bar.'
    ],
    summary:
      'A North Augusta, South Carolina kitchen renovation that opened the room to the living space, with a new island, working pantry, mudroom and coffee bar.',
    updatedAt: '2026-09-12',
    galleryTemplate: 'masonry',
    // Portrait, and the frame that holds the whole room at tile size — across the island to the range wall, pendants overhead.
    cover: 'island-counter-pendants-range-3215.jpg',
    // Display order follows the lede: the island the house gathers at, then the opened plan the wall used to divide,
    // then the working walls, and last the three spaces the second paragraph names — pantry, mudroom, coffee bar.
    // File names carry the camera number, as at Heathwood House, Aiken Homestead and Heatherstone, so a frame can be
    // matched back to the photographer's original from the bucket listing alone.
    //
    // The delivery is 35 frames across four spaces; six are left off where another frame says the same thing better,
    // and one — a brass chandelier over the dining table — is left off because it photographs the adjoining room
    // rather than this scope of work.
    //
    // 17 of the 29 run 200–300 KB at the default quality floor. Like Heatherstone and unlike Aiken Homestead this
    // shoot is NOT held at a raised floor: --min-quality=64 was measured against the default on the three densest
    // frames and buys ~3% on the 1200 px WebP derivative next/image actually serves (137/145/153 KB vs
    // 141/149/157 KB) while making each bucket object ~65% heavier (440–447 KB vs 297–300 KB). Same reason as
    // Heatherstone: these are iPhone frames, already smooth enough that the floor never bites.
    //
    // The three `feature` plates are the shoot's only landscape frames, and they split the masonry into runs of
    // 6, 4, 6 and 10 — all even, so each run's two columns end level. `aspect` is set only where the frame is not
    // the 3/4 default.
    gallery: [
      {
        file: 'kitchen-island-pendants-stools-3182.jpg',
        alt: 'The River Club kitchen in full — a grey island beneath three brass-and-white pendants, leather stools drawn up along it, the marble range wall beyond'
      },
      {
        file: 'island-stools-range-wall-3198.jpg',
        alt: 'The island at the centre of the River Club kitchen, four swivel stools along one side and the vent hood and windows behind it'
      },
      {
        file: 'island-counter-pendants-range-3215.jpg',
        alt: 'Across the River Club island toward the range wall, pendants overhead and a branch of greenery on the quartz'
      },
      {
        file: 'island-quartz-top-sink-3254.jpg',
        alt: 'The veined quartz top of the River Club island, its sink and brass faucet set below the shaped vent hood'
      },
      {
        file: 'island-sink-end-back-hall-3207.jpg',
        alt: 'The sink end of the River Club island, the back hall and the stair beyond it'
      },
      {
        file: 'island-toward-coffee-bar-3257.jpg',
        alt: 'Along the River Club island toward the back of the house, the coffee bar built into the far wall'
      },
      {
        file: 'kitchen-wide-from-living-room-3251.jpg',
        alt: 'The River Club kitchen seen whole from the living room, the island running the length of the room beneath its three pendants',
        aspect: 4 / 3,
        feature: true
      },
      {
        file: 'living-room-into-kitchen-3263.jpg',
        alt: 'The River Club living room in the foreground and the kitchen beyond it, nothing between the two where a wall used to stand'
      },
      {
        file: 'back-hall-into-kitchen-3242.jpg',
        alt: 'The River Club kitchen from the back hall, the living room visible through the opening past the island'
      },
      {
        file: 'island-toward-breakfast-table-3245.jpg',
        alt: 'Past the River Club island to the breakfast table under its brass chandelier, the panelled refrigerator along the right',
        aspect: 2400 / 3309
      },
      {
        file: 'dining-room-toward-wall-ovens-3200.jpg',
        alt: 'The River Club kitchen from the dining room, the double wall ovens and the cooktop wall beyond the chandelier'
      },
      {
        file: 'open-plan-living-room-kitchen-3306.jpg',
        alt: 'The whole open plan at River Club — living room, kitchen and dining area reading as one room',
        aspect: 4 / 3,
        feature: true
      },
      {
        file: 'range-wall-and-wall-ovens-3258.jpg',
        alt: 'The cooking wall of the River Club kitchen, double wall ovens at one end of the run and the vent hood at the other'
      },
      {
        file: 'range-wall-drawer-run-3249.jpg',
        alt: 'The River Club range wall and the long run of drawers beneath it, brass sconces above the counter'
      },
      {
        file: 'range-wall-marble-backsplash-3185.jpg',
        alt: 'The River Club range wall straight on — a marble slab backsplash carried to the ceiling, pot filler and shaped hood'
      },
      {
        file: 'glass-cabinet-window-corner-3213.jpg',
        alt: 'A glass-front cabinet beside the wall ovens in the River Club kitchen, the window and its marble surround to the right'
      },
      {
        file: 'window-brass-sconce-marble-3295.jpg',
        alt: 'A brass sconce above one of the River Club kitchen windows, the marble carried around the opening'
      },
      {
        file: 'vent-hood-pot-filler-3318.jpg',
        alt: 'The shaped vent hood and its pot filler in the River Club kitchen, against the marble slab'
      },
      {
        file: 'island-toward-living-room-3274.jpg',
        alt: 'The River Club kitchen from the refrigerator end, the island leading to the living room on one side and the breakfast table on the other',
        aspect: 4 / 3,
        feature: true
      },
      {
        file: 'pantry-through-doorway-3226.jpg',
        alt: 'The River Club working pantry through its doorway — a full-size sink, a second dishwasher and open shelving on every wall'
      },
      {
        file: 'pantry-shelves-appliances-3229.jpg',
        alt: 'Inside the River Club pantry, open shelves above a run of small appliances with a beverage refrigerator at the end'
      },
      {
        file: 'pantry-sink-wall-shelving-3231.jpg',
        alt: 'The sink wall of the River Club pantry, open shelving above it and walnut roll-out drawers to one side'
      },
      {
        file: 'pantry-sink-tile-backsplash-3230.jpg',
        alt: 'The River Club pantry sink, its brass faucet against a handmade-look tile backsplash'
      },
      {
        file: 'pantry-walnut-roll-out-drawers-3235.jpg',
        alt: 'Walnut roll-out drawers built in below the counter of the River Club pantry'
      },
      {
        file: 'mudroom-back-entry-storage-3240.jpg',
        alt: 'Built-in mudroom storage at the River Club back entry, a walnut bench above its drawers and tall cabinets over it'
      },
      {
        file: 'mudroom-bench-drawers-3246.jpg',
        alt: 'The walnut bench top and drawer fronts of the River Club mudroom'
      },
      {
        file: 'coffee-bar-cabinet-3218.jpg',
        alt: 'The River Club coffee bar, built into a former closet with drawers below it and the living room beyond'
      },
      {
        file: 'coffee-bar-niche-tile-3217.jpg',
        alt: 'The coffee bar niche at River Club, a walnut shelf above the machine and tile carried to the top of the opening'
      },
      {
        file: 'coffee-bar-shelf-mugs-3220.jpg',
        alt: 'Mugs and a framed photograph on the walnut shelf of the River Club coffee bar'
      }
    ]
  },
  // Campbell
  {
    slug: 'martinez-heatherstone-kitchen',
    assetKey: 'heatherstone-kitchen',
    title: 'Heatherstone Kitchen',
    location: 'Martinez, GA',
    year: '2024',
    builder: 'Southern State Builders',
    scope: 'Kitchen Renovation',
    intro: [
      'With two young children and a dated kitchen layout that felt too small for family life, these homeowners were ready to make their new Martinez, Georgia home their own. We removed the angular peninsula and incorporated the former breakfast area into a new kitchen layout, placing the sink beneath an oversized window where Mom can keep an eye on the kids playing in the backyard.',
      'At the center, a warm stained-wood island creates a natural gathering place for everything from weeknight meals to future homework and craft projects. Custom cabinetry along the opposite wall adds a wall oven, beverage refrigerator, and much-needed storage, turning what was once two disconnected spaces into a kitchen designed for the way this family actually lives.'
    ],
    summary:
      'A Martinez, Georgia kitchen renovation with a family-centered layout, warm wood island, oversized window, and custom cabinetry.',
    galleryTemplate: 'masonry',
    // Portrait, and the one frame that holds the whole room — island, pendants, sink window and range wall — at tile size.
    cover: 'kitchen-island-pendants-wide-8020.jpg',
    updatedAt: '2026-09-12',
    // Display order follows the lede: the room whole, then the sink beneath its oversized window, then the island the
    // family gathers at, then the range wall, and last the cabinetry run that carries the wall oven, the beverage
    // refrigerator and the storage. File names carry the camera number, as at Heathwood House and Aiken Homestead, so
    // a frame can be matched back to the photographer’s original from the bucket listing alone.
    //
    // The delivery is 38 frames of one room shot in a single twenty-minute pass, so it is dense with near-duplicates;
    // seven are left off where another frame says the same thing better. Nothing is excluded for being a different
    // look: the island reads mid-brown on the faces in shade and pale honey on the panels facing the windows, which
    // is one island under one edit — EXIF puts every frame in the same twenty minutes on the same camera — not two
    // grades of the shoot to choose between.
    //
    // The arabesque mosaic backsplash, the quartz veining and the hardwood floor put 20 of 31 frames over the 200 KB
    // budget at the default quality floor, 183–336 KB. Unlike Aiken Homestead this shoot is NOT held at a raised
    // floor: --min-quality=64 was tried and measured against the default, and it buys nothing here. At 100% on the
    // three densest frames the two sources are indistinguishable, and the 1200 px WebP derivative next/image
    // actually serves comes out no smaller from the q64 source than from the default one (196/147/193 KB vs
    // 191/143/185 KB) — so the raised floor only made each bucket object ~50% heavier. The difference from Aiken is
    // the capture: these are iPhone frames, already smooth enough that the floor never bites the way a full-frame
    // file's stone veining did.
    //
    // The single `feature` is the landscape range wall; it splits the masonry into runs of 18 and 12, both even, so
    // each run’s two columns end level. `aspect` is set only where the frame is not the 3/4 default.
    gallery: [
      {
        file: 'kitchen-island-pendants-wide-8020.jpg',
        alt: 'The Heatherstone kitchen in full — a warm stained-wood island beneath two glass pendants, cream cabinetry carried around the walls'
      },
      {
        file: 'kitchen-island-window-range-wall-8017.jpg',
        alt: 'The Heatherstone kitchen from the doorway, the island centred between the sink window and the range wall',
        aspect: 4 / 3
      },
      {
        file: 'kitchen-island-quartz-top-8186.jpg',
        alt: 'The stained-wood island in the Heatherstone kitchen, its quartz top running the length of the room toward the range'
      },
      {
        file: 'kitchen-island-pendants-fridge-8184.jpg',
        alt: 'The Heatherstone kitchen across the island, glass pendants overhead and the refrigerator at the far end of the cabinetry',
        aspect: 4 / 3
      },
      {
        file: 'kitchen-island-corner-range-wall-8205.jpg',
        alt: 'The corner of the island in the Heatherstone kitchen, the range wall and its shaped vent hood beyond'
      },
      {
        file: 'kitchen-entry-wall-ovens-island-8217.jpg',
        alt: 'Looking into the Heatherstone kitchen past the built-in wall oven and microwave, the island and its pendants ahead'
      },
      {
        file: 'kitchen-entry-view-wide-8218.jpg',
        alt: 'The Heatherstone kitchen from the hall — wall ovens to one side, the refrigerator to the other, the island between them',
        aspect: 4 / 3
      },
      {
        file: 'kitchen-island-cabinet-wall-wide-8171.jpg',
        alt: 'The island and the full cabinetry run of the Heatherstone kitchen, the refrigerator at the end of it',
        aspect: 4 / 3
      },
      {
        file: 'kitchen-galley-toward-window-8045.jpg',
        alt: 'The working side of the Heatherstone kitchen, the range at one hand and the sink window at the end of the run'
      },
      {
        file: 'kitchen-sink-window-cabinetry-8143.jpg',
        alt: 'The sink wall of the Heatherstone kitchen — an oversized window over the sink, dishwasher and drawers below, pantry cabinetry beyond'
      },
      {
        file: 'sink-window-wallpaper-sconces-8079.jpg',
        alt: 'The oversized window above the Heatherstone sink, patterned wallpaper and two brass sconces framing it'
      },
      {
        file: 'sink-window-sconces-eucalyptus-8085.jpg',
        alt: 'Brass sconces and a pitcher of eucalyptus at the Heatherstone sink window, the garden beyond the glass'
      },
      {
        file: 'island-drawers-dining-beyond-8156.jpg',
        alt: 'Drawer fronts along the Heatherstone island, the dining room and its fireplace beyond'
      },
      {
        file: 'island-drawers-windows-beyond-8157.jpg',
        alt: 'The Heatherstone island from its end, brass pulls on stained wood and the sink window beyond'
      },
      {
        file: 'island-drawer-fronts-brass-pulls-8061.jpg',
        alt: 'Brass pulls on the stained-wood drawer fronts of the Heatherstone island'
      },
      {
        file: 'island-end-panel-grain-8064.jpg',
        alt: 'The panelled end of the Heatherstone island, its grain catching the light from the windows'
      },
      {
        file: 'island-quartz-veining-lemons-8121.jpg',
        alt: 'Veining in the quartz top of the Heatherstone island, a bowl of lemons at its edge'
      },
      {
        file: 'range-wall-pendants-symmetry-8178.jpg',
        alt: 'The range wall of the Heatherstone kitchen centred between its two glass pendants'
      },
      {
        file: 'range-wall-pendants-wide-8180.jpg',
        feature: true,
        alt: 'The full range wall of the Heatherstone kitchen — shaped vent hood, arabesque mosaic backsplash, and a glass pendant to either side',
        aspect: 4 / 3
      },
      {
        file: 'range-wall-from-island-8163.jpg',
        alt: 'The Heatherstone range wall seen across the island, vent hood and pot filler centred'
      },
      {
        file: 'range-wall-hood-backsplash-8208.jpg',
        alt: 'Cabinetry, vent hood and mosaic backsplash above the range in the Heatherstone kitchen'
      },
      {
        file: 'range-hood-pot-filler-8089.jpg',
        alt: 'The shaped vent hood and brushed-nickel pot filler above the range in the Heatherstone kitchen'
      },
      {
        file: 'cooktop-pot-filler-detail-8008.jpg',
        alt: 'The gas cooktop, pot filler and arabesque mosaic backsplash in the Heatherstone kitchen'
      },
      {
        file: 'range-wall-pantry-refrigerator-8173.jpg',
        alt: 'The length of the Heatherstone range wall, full-height pantry cabinetry and the refrigerator at the end'
      },
      {
        file: 'cabinet-run-range-autumn-branches-8167.jpg',
        alt: 'The cabinetry run and range in the Heatherstone kitchen, autumn branches standing on the island in the foreground'
      },
      {
        file: 'cabinet-run-uppers-backsplash-8097.jpg',
        alt: 'Upper cabinets and mosaic backsplash in the Heatherstone kitchen, a stand mixer on the counter below'
      },
      {
        file: 'pantry-cabinet-counter-flowers-8164.jpg',
        alt: 'Full-height pantry cabinetry in the Heatherstone kitchen, flowers on the counter and the range beyond'
      },
      {
        file: 'cabinet-run-range-hardwood-8202.jpg',
        alt: 'The cabinetry run of the Heatherstone kitchen from the island, drawers and range along the wall'
      },
      {
        file: 'pantry-range-wall-island-wide-8200.jpg',
        alt: 'The Heatherstone kitchen from the pantry end — storage cabinetry, the range wall, and the island at right',
        aspect: 4 / 3
      },
      {
        file: 'beverage-refrigerator-wall-oven-8098.jpg',
        alt: 'The beverage refrigerator built into the Heatherstone cabinetry, wall oven and microwave alongside'
      },
      {
        file: 'wall-oven-tower-beverage-fridge-8221.jpg',
        alt: 'The wall-oven tower and beverage refrigerator in the Heatherstone kitchen, the island and dining room beyond'
      }
    ]
  },
  // Willingham
  {
    slug: 'aiken-homestead',
    assetKey: 'aiken-homestead',
    title: 'Aiken Homestead',
    location: 'Aiken, SC',
    year: '2024',
    builder: 'Southern State Builders',
    scope: 'Primary Bathroom Renovation',
    intro: [
      'The inspiration for this Aiken primary bathroom renovation started with a favorite hotel shower discovered while traveling. The existing bathroom already had a good footprint, so rather than changing it for the sake of change, we focused on transforming the experience, creating a shower the homeowner now says is even better than the one that inspired it.',
      'Dual shower heads, a rain head, heated marble floors, and a freestanding tub bring the hotel-level comforts home, while soft blue cabinetry, delicate wallpaper, and warm brass details keep the space elegant and personal. A custom marble floor pattern, shower accent wall, and dedicated vanity knee space finish a bathroom designed to make an ordinary morning feel a little less ordinary.'
    ],
    summary:
      'An Aiken, South Carolina primary bathroom renovation inspired by a favorite hotel shower, with heated marble floors and elegant custom details.',
    galleryTemplate: 'masonry',
    // Portrait, and the one frame that carries the whole room — vanity, tub, and the custom floor — at tile size.
    cover: 'bath-vanity-tub-window-wide-7075.jpg',
    updatedAt: '2026-09-12',
    // Display order follows the lede: the room whole, then the shower it was designed around, then the tub, then the
    // vanities and the details. File names carry the camera number, as at Heathwood House, so a frame can be matched
    // back to the photographer’s original from the bucket listing alone.
    //
    // The delivery holds three shoots of this one bathroom — this main set, a lower-resolution Instagram set, and a
    // holiday-styled set. Only the main set is published, plus three frames from the small set that it has no
    // equivalent of: the two landscape frames (nothing in the main shoot is anything but 3/4) and the close view of
    // the floor pattern. The holiday set documents styling the lede never mentions, and is left off.
    //
    // The single `feature` is the landscape shower frame; it splits the masonry into runs of 16 and 15, and the first
    // of those is even, so its two columns end level. `aspect` is set only where the frame is not the 3/4 default.
    gallery: [
      {
        file: 'bath-vanity-tub-window-wide-7075.jpg',
        alt: 'The Aiken Homestead primary bathroom in full — a soft blue vanity, a freestanding tub beneath a crystal chandelier, and a custom marble floor pattern running the length of the room'
      },
      {
        file: 'bath-vanity-shower-wide-7020.jpg',
        alt: 'The Aiken Homestead primary bathroom from the vanity, the glass shower and its marble knee wall beyond'
      },
      {
        file: 'bath-tub-vanities-chandelier-7024.jpg',
        alt: 'Both vanities and the freestanding tub in the Aiken Homestead primary bathroom, a shuttered window between them'
      },
      {
        file: 'shower-glass-rain-head-7109.jpg',
        alt: 'The walk-in shower in the Aiken Homestead primary bathroom, its ceiling-mounted rain head and hexagon marble panel seen through frameless glass'
      },
      {
        file: 'shower-marble-knee-wall-7055.jpg',
        alt: 'The shower’s marble knee wall and bench in the Aiken Homestead primary bathroom, blue cabinetry to one side'
      },
      {
        file: 'shower-rain-head-dual-heads-7056.jpg',
        alt: 'Inside the Aiken Homestead shower — a square rain head overhead and dual wall-mounted heads on the marble tile'
      },
      {
        file: 'shower-hex-accent-wall-7058.jpg',
        alt: 'The hexagon marble accent panel set into the tiled shower wall in the Aiken Homestead primary bathroom, bench below'
      },
      {
        file: 'shower-heads-niche-7059.jpg',
        alt: 'Dual brass shower heads and a recessed marble niche in the Aiken Homestead shower'
      },
      {
        file: 'shower-bench-brass-valves-7064.jpg',
        alt: 'Four brass valves above the marble bench in the Aiken Homestead shower, the room’s wallpaper reflected in the mirror behind'
      },
      {
        file: 'shower-bench-tub-beyond-7072.jpg',
        alt: 'The Aiken Homestead shower from its open corner — marble bench and hand shower inside, the freestanding tub beyond the glass'
      },
      {
        file: 'shower-valves-tub-through-glass-7066.jpg',
        alt: 'Brass valves on the shower’s marble wall in the Aiken Homestead primary bathroom, the tub and chandelier visible through the glass'
      },
      {
        file: 'shower-valves-doorway-7089.jpg',
        alt: 'The Aiken Homestead shower’s brass controls and marble bench, looking out across the checkerboard floor to the bathroom door'
      },
      {
        file: 'shower-hand-shower-hex-7081.jpg',
        alt: 'Brass hand shower against the hexagon marble accent wall in the Aiken Homestead shower'
      },
      {
        file: 'shower-niche-detail-7079.jpg',
        alt: 'The recessed marble niche in the Aiken Homestead shower, bottles on the upper shelf and a brush and pumice on the lower'
      },
      {
        file: 'shower-hex-marble-mosaic-7061.jpg',
        alt: 'The hexagon marble mosaic of the Aiken Homestead shower accent wall meeting the field tile at the corner'
      },
      {
        file: 'shower-hex-mosaic-edge-7080.jpg',
        alt: 'The shower’s hexagon marble panel turning the corner onto plain marble tile in the Aiken Homestead primary bathroom'
      },
      {
        file: 'shower-bench-hex-panel-wide-006.jpg',
        alt: 'The full width of the Aiken Homestead shower — marble bench, brass hand shower, and the hexagon mosaic panel centred on the back wall',
        aspect: 3 / 2,
        feature: true
      },
      {
        file: 'tub-chandelier-shutters-7041.jpg',
        alt: 'The freestanding tub in the Aiken Homestead primary bathroom, centred under a crystal chandelier between shuttered windows'
      },
      {
        file: 'tub-corner-chandelier-7029.jpg',
        alt: 'The tub corner of the Aiken Homestead primary bathroom, chandelier overhead and a blue vanity to either side'
      },
      {
        file: 'tub-wallpaper-chandelier-7030.jpg',
        alt: 'Branching metallic wallpaper above the wainscot behind the Aiken Homestead tub, the chandelier hanging close'
      },
      {
        file: 'tub-vanity-wallpaper-7045.jpg',
        alt: 'The Aiken Homestead tub seen past the vanity, brass floor-mounted filler and wallpapered wall behind'
      },
      {
        file: 'tub-faucet-window-7026.jpg',
        alt: 'Brass floor-mounted tub filler and hand shower at the Aiken Homestead tub, a shuttered window alongside'
      },
      {
        file: 'tub-faucet-roses-detail-7043.jpg',
        alt: 'The rim of the Aiken Homestead tub — brass filler, a cut-glass vase of white roses, and the metallic wallpaper behind'
      },
      {
        file: 'tub-brass-faucet-dog-wide-009.jpg',
        alt: 'The homeowners’ dog resting its paws on the rim of the freestanding tub in the Aiken Homestead primary bathroom',
        aspect: 2150 / 1536
      },
      {
        file: 'vanity-knee-space-linen-tower-7049.jpg',
        alt: 'The Aiken Homestead vanity with its dedicated knee space and woven stool, a full-height linen tower alongside'
      },
      {
        file: 'vanity-counter-tulips-sconce-7126.jpg',
        alt: 'Brass faucet and a jar of white tulips on the Aiken Homestead vanity, a lucite and brass sconce on the mirror'
      },
      {
        file: 'vanity-sconces-brass-tray-7129.jpg',
        alt: 'Sconces, a brass tray and tulips along the stone counter of the Aiken Homestead vanity'
      },
      {
        file: 'vanity-base-marble-floor-003.jpg',
        alt: 'The base of the blue vanity in the Aiken Homestead primary bathroom meeting the custom marble floor pattern',
        aspect: 2 / 3
      },
      {
        file: 'cabinet-pulls-lucite-brass-7133.jpg',
        alt: 'Lucite and brass pulls on the soft blue cabinet doors of the Aiken Homestead vanity'
      },
      {
        file: 'cabinet-pulls-marble-floor-7135.jpg',
        alt: 'Lucite and brass cabinet pulls on the Aiken Homestead vanity, the marble floor pattern below'
      },
      {
        file: 'cabinet-pulls-vanity-run-7035.jpg',
        alt: 'The run of the Aiken Homestead vanity falling away behind a single lucite and brass pull'
      },
      {
        file: 'chandelier-crystals-wallpaper-7172.jpg',
        alt: 'Crystal drops of the chandelier in the Aiken Homestead primary bathroom, against the branching metallic wallpaper'
      }
    ]
  },
  // Woodward
  {
    slug: 'aiken-heathwood-house',
    assetKey: 'heathwood-house',
    title: 'Heathwood House',
    location: 'Aiken, SC',
    year: '2024',
    builder: 'Chandler Homes',
    scope: 'Kitchen + Bathroom Renovation',
    intro: [
      'After years of raising a family in this Aiken home, these homeowners were ready to rethink it for the years ahead, creating spaces they could enjoy every day and a home where their grown children and family could comfortably gather. We reworked the existing kitchen layout to create a more open, connected space, adding a large central island and dining area and transforming the former dining room into a hidden walk-in pantry with dedicated storage and space for a secondary refrigerator. A separate coffee bar gives a longtime daily ritual a place of its own.',
      'The renovation continued into the bathrooms, where borrowing space from the hall bath allowed us to turn a small shared primary bathroom into a true two-person space with a double vanity, freestanding tub, and walk-in shower. Throughout the home, clean lines, durable finishes, and thoughtfully planned storage brought a sense of order and ease to spaces that simply weren’t working for them anymore.'
    ],
    summary:
      'An Aiken, South Carolina kitchen and bathroom renovation designed for everyday ease, family gatherings, and the homeowners’ next chapter.',
    galleryTemplate: 'masonry',
    // Portrait, and the frame that reads best at tile size — the primary bath, tub and glass shower together. Already in
    // `gallery`, so no second object.
    cover: 'bath-tub-shower-glass-6594.jpg',
    updatedAt: '2026-09-11',
    // Display order, following the lede: kitchen, then the coffee bar and the pantry it hides, then the primary bath.
    // Unlike Two Mile House these file names carry the camera number, so a frame can be matched back to the
    // photographer’s original from the bucket listing alone.
    // The single `feature` is the one landscape frame in the shoot — it splits the masonry into runs of 20 and 10,
    // both even, so each run’s two columns end level. `aspect` is set only where the frame is not the 3/4 default.
    gallery: [
      {
        file: 'kitchen-island-pendants-wide-6573.jpg',
        alt: 'The Heathwood House kitchen in full — a black granite island centred beneath two lantern pendants, cream cabinetry carried around the walls',
        aspect: 1
      },
      {
        file: 'kitchen-island-range-wall-6504.jpg',
        alt: 'The Heathwood House kitchen from the dining side, the island in line with the range wall and a window beyond'
      },
      {
        file: 'kitchen-wall-oven-island-6503.jpg',
        alt: 'The Heathwood House kitchen looking toward the built-in wall oven, the island running the length of the room'
      },
      {
        file: 'kitchen-island-faucet-pendants-6488.jpg',
        alt: 'Gooseneck faucet at the island in the Heathwood House kitchen, lantern pendants overhead and the range wall beyond'
      },
      {
        file: 'kitchen-pendants-olive-branch-6505.jpg',
        alt: 'Lantern pendants over the black granite island in the Heathwood House kitchen, olive branches on the counter'
      },
      {
        file: 'kitchen-island-farmhouse-sink-6518.jpg',
        alt: 'The farmhouse sink set into the island in the Heathwood House kitchen, microwave and cabinetry behind'
      },
      {
        file: 'kitchen-range-wall-pot-filler-6497.jpg',
        alt: 'Range wall in the Heathwood House kitchen — stacked tile backsplash, a brushed-nickel pot filler, and tulips on the counter'
      },
      {
        file: 'kitchen-range-vent-hood-6517.jpg',
        alt: 'The shaped vent hood and range in the Heathwood House kitchen, pot filler mounted on the tiled wall'
      },
      {
        file: 'kitchen-cooktop-brass-cruet-6495.jpg',
        alt: 'Cooktop and vent hood in the Heathwood House kitchen, with a brass oil cruet and tulips alongside'
      },
      {
        file: 'kitchen-range-wall-from-island-6507.jpg',
        alt: 'The range wall of the Heathwood House kitchen seen across the island, hood and pot filler centred'
      },
      {
        file: 'kitchen-backsplash-detail-6516.jpg',
        alt: 'Stacked tile backsplash in the Heathwood House kitchen, a marble board and brass cruet on the black granite'
      },
      {
        file: 'kitchen-granite-counter-detail-6530.jpg',
        alt: 'Veining in the black granite counter of the Heathwood House kitchen, an olive branch casting its shadow across it'
      },
      {
        file: 'coffee-bar-counter-6535.jpg',
        alt: 'The coffee bar in the Heathwood House kitchen — glasses on a stone tray, drawers below and cabinetry above'
      },
      {
        file: 'coffee-bar-pantry-doors-closed-6538.jpg',
        alt: 'The coffee bar wall in the Heathwood House kitchen, the walk-in pantry’s full-height doors sitting flush beside it'
      },
      {
        file: 'pantry-doors-closed-6547.jpg',
        alt: 'Closed, the Heathwood House pantry reads as a bank of full-height cabinetry next to the coffee bar'
      },
      {
        file: 'pantry-doors-open-6548.jpg',
        alt: 'The same doors opened, revealing the Heathwood House walk-in pantry: a window, open shelving, and the original hardwood floor'
      },
      {
        file: 'pantry-doorway-open-6539.jpg',
        alt: 'The hidden pantry doorway standing open off the Heathwood House coffee bar'
      },
      {
        file: 'pantry-doorway-open-wide-6540.jpg',
        alt: 'Both pantry doors open at the Heathwood House coffee bar, the former dining room beyond'
      },
      {
        file: 'pantry-shelves-window-6546.jpg',
        alt: 'Inside the Heathwood House walk-in pantry, floating shelves running toward the window'
      },
      {
        file: 'pantry-shelving-run-6553.jpg',
        alt: 'The length of the Heathwood House walk-in pantry, open shelving stocked along one wall and the kitchen through the doorway'
      },
      {
        file: 'bath-tub-window-shower-6626.jpg',
        feature: true,
        alt: 'A freestanding tub beneath the window in the Heathwood House primary bath, the glass shower alongside and a marble-look feature wall behind',
        aspect: 4 / 3
      },
      {
        file: 'bath-tub-vanity-wide-6580.jpg',
        alt: 'The Heathwood House primary bath in full — freestanding tub and feature wall on one side, the double vanity on the other'
      },
      {
        file: 'bath-double-vanity-mirrors-6633.jpg',
        alt: 'Double vanity in the Heathwood House primary bath, two black-framed mirrors above a quartz top'
      },
      {
        file: 'bath-double-vanity-head-on-6643.jpg',
        alt: 'The double vanity head-on in the Heathwood House primary bath, the mirrors flanking an olive branch set between the basins',
        aspect: 2400 / 3427
      },
      {
        file: 'bath-vanity-run-6644.jpg',
        alt: 'The vanity run in the Heathwood House primary bath, quartz carried the length of the cabinetry'
      },
      {
        file: 'bath-tub-past-vanity-6608.jpg',
        alt: 'The freestanding tub in the Heathwood House primary bath, seen past the end of the vanity'
      },
      {
        file: 'bath-tub-marble-wall-6627.jpg',
        alt: 'The slipper tub in the Heathwood House primary bath, set against the full-height marble-look wall'
      },
      {
        file: 'bath-tub-shower-glass-6594.jpg',
        alt: 'Tub and glass shower together in the Heathwood House primary bath, a walnut side table alongside'
      },
      {
        file: 'bath-tub-shower-wide-6585.jpg',
        alt: 'The Heathwood House primary bath across the tub toward the walk-in shower'
      },
      {
        file: 'bath-tub-filler-detail-6591.jpg',
        alt: 'Floor-mounted tub filler in the Heathwood House primary bath, against the veining of the feature wall'
      },
      {
        file: 'bath-shower-bench-niche-6588.jpg',
        alt: 'Inside the walk-in shower in the Heathwood House primary bath — a built-in bench, recessed niche, and hex mosaic floor'
      }
    ]
  },
  // Bernal
  {
    slug: 'mccormick-modern-escape',
    assetKey: 'mccormick-modern-escape',
    title: 'Modern Escape',
    location: 'McCormick, SC',
    year: '2023',
    builder: 'Southern State Builders',
    scope: 'Custom New Construction',
    intro: [
      'Designed for a couple approaching the empty-nest years, this Clarks Hill Lake home was envisioned as a place to slow down, spread out, and enjoy life by the water. With views toward the lake and pool, the home was planned around relaxed living, from separate home offices to a generous screened porch that quickly became a favorite place to unwind.',
      'Clean white walls and warm wood tones set the foundation, while black cabinetry, woven lighting, and graphic details bring contrast throughout. In the primary bath, a single glass wall keeps the oversized shower open and modern, while dark chevron tile adds texture underfoot. Outside, board-and-batten siding, stained wood accents, brick, and black detailing give the home a crisp but welcoming presence.',
      'Not long after moving in, our client told us she had already taken her first nap on the screened porch. We’d say the house was doing exactly what it was designed to do.'
    ],
    summary:
      'A custom lake home in McCormick, South Carolina, designed for relaxed empty-nest living with warm wood, bold contrast, and a generous screened porch.',
    updatedAt: '2026-09-12',
    galleryTemplate: 'masonry',
    // Portrait, and the frame that introduces the house at tile size: the front elevation from the curve of the drive,
    // black gables over white board-and-batten, hardwoods over the approach.
    cover: 'front-elevation-from-drive-7063.jpg',
    // Display order follows the lede: the approach and the black-trimmed siding the second paragraph names, then
    // the living room and the kitchen at the heart of the open plan, then the primary bath the lede singles out,
    // the two smaller baths, and last the pool, the lake and the screened porch — closing where the copy closes,
    // on the porch. File names carry the camera number, as at Heathwood House, Aiken Homestead, Heatherstone,
    // River Club, Kestwick and Conifer, so a frame can be matched back to the photographer's original from the
    // bucket listing alone.
    //
    // The delivery is 42 frames across seven spaces and six are left off — a low cut rate, because unlike Conifer
    // this delivery carries no screenshots and no repeated crops. IMG_7035 is the one frame delivered twice, as a
    // landscape and as a portrait crop of it; the crop is the better composition and is the one published. The
    // other five are frames another says better: a second primary-bath shower-and-tub view a shutter apart from
    // the one published (6879), a second low-angle island profile (6927), a second island-to-fireplace view with a
    // pendant clipped (6918), a kitchen frame that is more than half bare floor and has a box left on the counter
    // (6938), and a 1478 px island-and-sink export (6989) well under the 2400 px target, whose composition 6933
    // already holds at full resolution.
    //
    // 17 of the 36 run 217–685 KB at the default quality floor. Like Heatherstone, River Club, Kestwick and
    // Conifer, and unlike Aiken Homestead, the shoot is NOT held at a raised floor: --min-quality=64 was measured
    // against the default on the five densest frames and buys 1–4% on the 1200 px WebP derivative next/image
    // actually serves (396/309/239/384/209 KB vs 401/312/248/373/218 KB — the front elevation coming out *larger*
    // from the q64 source) while making each bucket object ~47% heavier (1005/779/643/580/590 KB vs
    // 685/532/433/401/397 KB). At 100% on the densest frame, pines against the far shore of the lake, the two
    // sources are indistinguishable. The density here is foliage, brick and brushed concrete, not the stone
    // veining that made Aiken's floor bite.
    //
    // This shoot breaks the one-landscape-frame-one-`feature` mapping every shoot before it has used, because it
    // has nine landscape frames among 36 rather than one or three. Featuring all nine would put a full-width band
    // every fourth plate, and the narrative interleaves them too closely to survive it — it would strand the stair
    // as a one-plate run (a lone tile beside an empty column) and stack the kitchen's two wides back to back. So
    // the six that hold a whole space are featured and the other three ride in the columns: the garage wing, the
    // kitchen seen from the living room, and the pool from the house.
    //
    // The six split the masonry into runs of 4, 2, 4, 10, 6, 2 and 2 — all even, so every run's two columns carry
    // the same number of plates. Four end dead level. Runs 1, 2 and 6 end 0.583 column widths apart, which is the
    // minimum each allows: they are the runs carrying an in-column landscape, and at heights of 3/4 and 4/3 of a
    // column width no subset splits them evenly. Run 7 ends 0.083 apart, the 4/5 porch frame against a 3/4 one.
    //
    // `aspect` is set only on the ten frames that are not the 3/4 default: nine 4/3 landscapes and the 4/5 porch
    // frame, which is the delivery's portrait crop of IMG_7035 rather than a frame shot that way.
    gallery: [
      {
        file: 'front-elevation-from-drive-7063.jpg',
        alt: 'The Modern Escape front elevation from the curve of the drive — white board-and-batten under black gables, a stained wood entry, and hardwoods standing over the approach'
      },
      {
        file: 'entry-gables-brick-foundation-7055.jpg',
        alt: 'The entry wing of the Modern Escape from the motor court, brick steps and foundation carrying the white siding up to its black-trimmed gables'
      },
      {
        file: 'garage-wing-metal-awnings-7050.jpg',
        alt: 'The garage wing of the Modern Escape, black doors under standing-seam awnings on stained wood brackets, the front entry carrying on past them',
        aspect: 4 / 3
      },
      {
        file: 'stair-white-oak-treads-6967.jpg',
        alt: 'The Modern Escape stair, white oak treads over white risers with a slim wall-mounted rail and step lights washing down the wall'
      },
      {
        file: 'living-room-vaulted-sliders-3236.jpg',
        alt: 'The Modern Escape living room the width of the house — a linen sectional under the vaulted ceiling, black sliding doors opening onto the screened porch, the kitchen carrying on at left',
        aspect: 4 / 3,
        feature: true
      },
      {
        file: 'fireplace-oak-mantel-detail-7022.jpg',
        alt: 'The white oak mantel of the Modern Escape fireplace, a single hewn beam set into the black shiplap chimney breast'
      },
      {
        file: 'kitchen-from-living-room-3244.jpg',
        alt: 'The Modern Escape kitchen from the living room, two woven pendants over the black island with the hood wall and the bar shelving to either side',
        aspect: 4 / 3
      },
      {
        file: 'kitchen-island-range-wall-6987.jpg',
        alt: 'The Modern Escape kitchen across the island — white cabinetry and an oak-banded hood above the herringbone backsplash, two woven pendants hung over the black island',
        aspect: 4 / 3,
        feature: true
      },
      {
        file: 'island-pendants-range-wall-6913.jpg',
        alt: 'The black island of the Modern Escape kitchen under its woven pendants, the range and the panelled refrigerator along the wall behind'
      },
      {
        file: 'island-pendants-pantry-cabinets-6934.jpg',
        alt: 'The Modern Escape island straight on, its brass faucet centred between two woven pendants below the tall pantry cabinets'
      },
      {
        file: 'range-run-toward-window-wall-6909.jpg',
        alt: 'Down the working side of the Modern Escape kitchen past the range, black perimeter cabinetry and a window wall closing the far end'
      },
      {
        file: 'oak-hood-herringbone-range-6930.jpg',
        alt: 'The white oak hood of the Modern Escape kitchen over the herringbone backsplash, the range and its brass knobs below'
      },
      {
        file: 'island-perimeter-run-windows-6995.jpg',
        alt: 'The length of the Modern Escape kitchen — the black island on one side, the perimeter run beneath the window wall on the other, brass sconces above it',
        aspect: 4 / 3,
        feature: true
      },
      {
        file: 'island-sink-quartz-faucet-6933.jpg',
        alt: 'The sink set into the veined quartz of the Modern Escape island, the brass faucet and the black-framed doors beyond it'
      },
      {
        file: 'quartz-island-edge-detail-6924.jpg',
        alt: 'The mitred quartz edge of the Modern Escape island, the hood and the faucet falling away behind it'
      },
      {
        file: 'black-cabinetry-brass-pulls-6906.jpg',
        alt: 'Brass knobs and bar pulls along the black cabinetry of the Modern Escape kitchen, the window sill running above them'
      },
      {
        file: 'black-cabinetry-run-low-6928.jpg',
        alt: 'The Modern Escape island from floor level, its black run carrying toward the window wall and the brass sconces above the perimeter cabinets'
      },
      {
        file: 'island-toward-shiplap-fireplace-6946.jpg',
        alt: 'Past the Modern Escape island to the living room, the black shiplap fireplace and its oak mantel across the open plan'
      },
      {
        file: 'beverage-bar-oak-shelves-3276.jpg',
        alt: 'The beverage bar of the Modern Escape — three white oak shelves on herringbone tile above black cabinetry and a glass-front cooler, a brass sconce overhead'
      },
      {
        file: 'primary-bath-glass-wall-chevron-6878.jpg',
        alt: 'The Modern Escape primary bath — a single glass wall holding the open shower, the soaking tub beneath the window, and dark chevron tile running under all of it'
      },
      {
        file: 'primary-shower-tub-chevron-floor-6889.jpg',
        alt: 'The open shower of the Modern Escape primary bath behind its one pane of glass, the freestanding tub and its sconce alongside'
      },
      {
        file: 'primary-tub-filler-shower-detail-6888.jpg',
        alt: 'The brass floor filler at the Modern Escape tub, the shower fittings on the tiled wall beyond the glass'
      },
      {
        file: 'primary-tub-window-sconce-6883.jpg',
        alt: 'The Modern Escape soaking tub in its corner, the obscured window and a shaded sconce above it'
      },
      {
        file: 'primary-soaking-tub-window-6997.jpg',
        alt: 'The Modern Escape soaking tub straight on, centred under the window with the dark chevron tile running out to either side',
        aspect: 4 / 3,
        feature: true
      },
      {
        file: 'primary-vanity-brass-faucet-6882.jpg',
        alt: 'The Modern Escape primary vanity, a brass faucet at the undermount sink below a black-framed mirror and a matching sconce'
      },
      {
        file: 'primary-faucet-mirror-detail-6881.jpg',
        alt: 'The brass faucet of the Modern Escape primary vanity close up, doubled in the mirror behind it'
      },
      {
        file: 'guest-bath-black-vanity-3283.jpg',
        alt: 'The guest bath of the Modern Escape — a black vanity with brass knobs under a black-framed mirror, the graphic marble floor running to the window'
      },
      {
        file: 'guest-bath-window-graphic-floor-3281.jpg',
        alt: 'The window end of the Modern Escape guest bath, the black-and-white marble floor carried under the vanity and out to the door'
      },
      {
        file: 'marble-petal-floor-detail-6948.jpg',
        alt: 'The petal-cut marble floor of the Modern Escape guest bath close up, its black points meeting at the foot of the vanity'
      },
      {
        file: 'powder-room-wallpaper-round-mirror-6960.jpg',
        alt: 'The Modern Escape powder room, a round mirror hung on dark wallpaper drawn in gold arcs above a white vanity and its black fittings'
      },
      {
        file: 'rear-elevation-over-pool-3223.jpg',
        alt: 'The Modern Escape from the far side of the pool — the screened porch above, the lower level opening onto the deck, and the cabana at the end of the water',
        aspect: 4 / 3,
        feature: true
      },
      {
        file: 'pool-cabana-from-house-6980.jpg',
        alt: 'The pool of the Modern Escape from the house, the open cabana standing at the far corner of the deck',
        aspect: 4 / 3
      },
      {
        file: 'pool-cabana-toward-lake-6978.jpg',
        alt: 'The Modern Escape pool looking past the cabana to Clarks Hill Lake through the pines'
      },
      {
        file: 'deck-into-screened-porch-3234.jpg',
        alt: 'The deck of the Modern Escape at the corner of the screened porch, black sliding doors open to the dining table set inside it',
        aspect: 4 / 3,
        feature: true
      },
      {
        file: 'screened-porch-above-pool-7035.jpg',
        alt: 'The screened porch of the Modern Escape from the pool below, its gable carried on white columns above the brick retaining wall',
        aspect: 4 / 5
      },
      {
        file: 'screened-porch-lake-view-3214.jpg',
        alt: 'Inside the Modern Escape screened porch — black-framed seating on a woven rug, the pool below and the lake beyond the screens'
      }
    ]
  },
  // Guha
  {
    slug: 'augusta-conifer-modern-tudor',
    assetKey: 'conifer-modern-tudor',
    title: 'Conifer Modern Tudor',
    location: 'Augusta, GA',
    year: '2022',
    builder: 'Southern State Builders',
    scope: 'Custom New Construction',
    intro: [
      'From the beginning, this home was designed to have a character all its own. Inspired by Tudor architecture but interpreted with a fresh perspective, the exterior pairs painted brick, an arched entry, and warm wood details with dramatic black-framed windows that fill the home with natural light.',
      'Inside, that same balance of old and new continues with a mix of painted and white oak cabinetry, warm metals, and thoughtfully layered details. A hidden pantry keeps the kitchen functional and uncluttered, while unexpected moments, like the color-drenched powder room beneath the stairs and skylights flooding the primary bath with light, give the home personality.',
      'The result is a home that feels distinctive yet inviting, with details considered from the floor plan all the way through the finishing touches.'
    ],
    summary:
      'A fresh Tudor-inspired home in Augusta, Georgia, pairing timeless character with layered interiors and thoughtful custom details.',
    updatedAt: '2026-09-12',
    galleryTemplate: 'masonry',
    // Portrait, and the frame that carries the whole house at tile size — the gable, the arched entry, the black
    // window wall and the paver walk, in the only light the shoot caught at dusk.
    cover: 'front-elevation-dusk-2571.jpg',
    // Display order follows the lede: the exterior it is named for, then the door and what is behind it, then the
    // kitchen and the cabinetry mix, then the stair and the two rooms off it the lede calls out by name — the
    // colour-drenched powder room and the office — and last the skylit primary bath and the guest bath. File names
    // carry the camera number, as at Heathwood House, Aiken Homestead, Heatherstone, River Club and Kestwick, so a
    // frame can be matched back to the photographer's original from the bucket listing alone.
    //
    // The delivery is 53 frames and 22 are left off. Five are phone screenshots of frames already here, letterboxed
    // with black bars at 1125 px (three exteriors and two kitchens), and one of those also carries construction
    // debris on the lawn. Twelve more are second and third crops of a frame already published — the delivery ships
    // IMG_2659 three times, IMG_2759 three times, and 2655, 2665, 2680, 2698 twice each. The rest are frames another
    // says better: two overcast exteriors against the dusk ones, a warm-cast primary bath wide that does not match
    // the colour of the set around it, and a third bathroom with a single generic frame and nothing else of its room.
    //
    // 20 of the 31 run 202–583 KB at the default quality floor. Like Heatherstone, River Club and Kestwick, and
    // unlike Aiken Homestead, this shoot is NOT held at a raised floor: --min-quality=64 was measured against the
    // default on the five densest frames and buys 1–6% on the 1200 px WebP derivative next/image actually serves
    // (325/236/222/189/154 KB vs 329/251/228/198/165 KB) while making each bucket object ~50% heavier (855/651/628/
    // 530/526 KB vs 583/436/425/353/331 KB), and at 100% on the densest frame — pine foliage against a dusk sky —
    // the two sources are indistinguishable. The over-budget frames are dense the way AGENTS.md describes: painted
    // brick tooth, foliage, and a lawn, not the stone veining that made Aiken's floor bite.
    //
    // `primary-bath-skylights-wide-2745.jpg` is the shoot's ONLY landscape frame, so it is the only `feature`, and
    // it opens the primary bath. It splits the masonry into runs of 20 and 10 — both even, so each run's two columns
    // carry the same number of plates. The ten-plate run ends dead level; the twenty-plate run ends 0.17 column
    // widths apart, which is the minimum this set of aspects allows (an exact split is arithmetically impossible —
    // the heights are ninths of a column width and the total is not an even number of them). Reaching it costs one
    // swap: the range detail is published before the hood elevation rather than after.
    //
    // `aspect` is set only on the six frames that are not the 3/4 default: four 9/16 kitchen frames, the 2/3 stair
    // detail (the shoot's one DSLR frame, delivered at 1024 px), and the 4/3 feature.
    gallery: [
      {
        file: 'front-elevation-dusk-2571.jpg',
        alt: 'The Conifer front elevation at dusk — a steep painted-brick gable, an arched entry between copper gas lanterns, and black-framed windows lit warm from inside'
      },
      {
        file: 'front-elevation-from-lawn-dusk-2573.jpg',
        alt: 'The Conifer house from the lawn at dusk, the sweeping brick eave carrying from the gable down past the two-storey window to the entry'
      },
      {
        file: 'arched-entry-curved-eave-2785.jpg',
        alt: 'Where the curved eave of the Conifer entry meets the sided wing, the arched brick surround and the tall black-framed window side by side'
      },
      {
        file: 'arched-front-door-slate-porch-2786.jpg',
        alt: 'The Conifer front door — an arched stained-wood door set in painted brick above a slate porch, boxwoods in the bed beside it'
      },
      {
        file: 'copper-gas-lantern-painted-brick-2787.jpg',
        alt: 'A copper gas lantern on the Conifer entry wall, the tooth of the painted brick running behind it'
      },
      {
        file: 'foyer-arched-door-reclaimed-beams-2685.jpg',
        alt: 'The Conifer foyer from inside, the arched front door framed under a reclaimed hand-hewn beam with white oak floors running toward it'
      },
      {
        file: 'kitchen-from-living-room-beams-2668.jpg',
        alt: 'The Conifer kitchen seen from the living room, reclaimed beams crossing the ceiling between the two rooms'
      },
      {
        file: 'white-oak-island-under-beams-2654.jpg',
        alt: 'The white oak island of the Conifer kitchen under its two pendants, the hand-hewn beams overhead and the plaster hood beyond',
        aspect: 9 / 16
      },
      {
        file: 'kitchen-run-toward-range-2655.jpg',
        alt: 'Down the Conifer kitchen past the island toward the range, painted cabinetry on both sides under a quartz backsplash'
      },
      {
        file: 'cabinetry-run-panelled-refrigerator-2665.jpg',
        alt: 'The painted cabinetry run of the Conifer kitchen, the panelled refrigerator at one end and glass-front white oak uppers at the other',
        aspect: 9 / 16
      },
      {
        file: 'glass-cabinets-hidden-pantry-door-2659.jpg',
        alt: 'The glass-front white oak cabinets of the Conifer kitchen beside the panelled door that hides the pantry',
        aspect: 9 / 16
      },
      {
        file: 'range-pot-filler-glass-uppers-2676.jpg',
        alt: 'The Conifer range and its black pot filler, quartz carried up the wall between the white oak glass uppers'
      },
      {
        file: 'plaster-hood-quartz-backsplash-2671.jpg',
        alt: 'The plaster hood of the Conifer kitchen straight on, flanked by glass-front white oak cabinets above the range',
        aspect: 9 / 16
      },
      {
        file: 'stair-hall-window-wall-chandelier-2691.jpg',
        alt: 'The Conifer stair hall, two storeys of black-framed glass on the landing wall with an iron chandelier hanging in front of them'
      },
      {
        file: 'chandelier-from-upper-landing-2695.jpg',
        alt: 'The Conifer stair chandelier from the upper landing, the window wall and the clerestory above it carrying the light down'
      },
      {
        file: 'upper-landing-toward-office-2694.jpg',
        alt: 'The Conifer upper landing looking back toward the office, the round window visible between the built-in bookcases'
      },
      {
        file: 'stair-treads-black-balusters-2692.jpg',
        alt: 'The Conifer stair from below — stained oak treads and white risers behind squared black balusters'
      },
      {
        file: 'stair-treads-overhead-detail-4452.jpg',
        alt: 'The Conifer stair from above, the black handrail running down across the grain of the oak treads',
        aspect: 2 / 3
      },
      {
        file: 'powder-room-sage-vanity-2680.jpg',
        alt: 'The colour-drenched powder room beneath the Conifer stair — sage walls and panelling around a white vanity with a shaped quartz splash and a round brass mirror'
      },
      {
        file: 'office-built-ins-round-window-2698.jpg',
        alt: 'The Conifer office built-ins, two dark-backed bookcases over a drawer bank with the round window centred between them'
      },
      {
        file: 'primary-bath-skylights-wide-2745.jpg',
        alt: 'The Conifer primary bath the width of the room — the floating white oak double vanity, the marble shower under the vaulted ceiling, and the two skylights cut into it',
        aspect: 4 / 3,
        feature: true
      },
      {
        file: 'primary-bath-double-vanity-skylights-2743.jpg',
        alt: 'The Conifer primary bath from the door, both skylights open to the trees above the double vanity and the marble-lined shower'
      },
      {
        file: 'primary-bath-vanity-mirrors-sconces-2747.jpg',
        alt: 'The Conifer primary vanity straight on — two brass-framed mirrors and paired sconces above the floating white oak run'
      },
      {
        file: 'primary-vanity-brass-mirror-shower-2756.jpg',
        alt: 'One end of the Conifer primary vanity, a brass-framed mirror beside the glass wall of the marble shower'
      },
      {
        file: 'primary-vanity-run-under-skylight-2757.jpg',
        alt: 'Along the Conifer primary vanity toward the shower, the skylight throwing light down the marble slab wall'
      },
      {
        file: 'soaking-tub-marble-shower-wall-2759.jpg',
        alt: 'The freestanding tub in the Conifer primary bath, set on slate against the marble slab wall under the vaulted skylight'
      },
      {
        file: 'guest-bath-tub-stacked-tile-2573.jpg',
        alt: 'The Conifer guest bath — a tub under stacked white tile beside the fluted white oak vanity and its arched black mirror'
      },
      {
        file: 'fluted-oak-vanity-arched-mirror-2557.jpg',
        alt: 'The fluted white oak vanity of the Conifer guest bath under an arched black mirror, brass fittings on a marble top'
      },
      {
        file: 'fluted-oak-vanity-marble-top-2570.jpg',
        alt: 'The Conifer guest vanity from the side, the marble top overhanging the fluted white oak and its brass pull'
      },
      {
        file: 'fluted-oak-brass-pull-detail-2568.jpg',
        alt: 'The fluting of the Conifer guest vanity close up, the brass bar pull and knobs catching across it'
      },
      {
        file: 'fluted-oak-hex-marble-floor-2577.jpg',
        alt: 'Where the Conifer guest vanity meets the floor, fluted white oak above large hexagonal marble tile'
      }
    ]
  },
  // Wachowicz
  {
    slug: 'martinez-kestwick-kitchen',
    assetKey: 'kestwick-kitchen',
    title: 'Kestwick Kitchen',
    location: 'Martinez, GA',
    year: '2022',
    builder: 'Southern State Builders',
    scope: 'Kitchen Renovation',
    intro: [
      'Removing the wall between the kitchen and living room completely changed how this Martinez, GA home lives. We reworked the kitchen layout and relocated every major appliance, creating better flow, generous work space around the range, and a much more open connection to the adjoining living area.',
      'Classic white custom cabinetry keeps the kitchen light and timeless, while quartzite countertops, oversized lantern pendants, and floating wood shelves bring in warmth and character. The result is a kitchen that feels brighter, larger, and far more functional without feeling overly new or trendy.'
    ],
    summary:
      'A Martinez, Georgia kitchen renovation with an open layout, custom white cabinetry, quartzite countertops, floating wood shelves, and improved flow.',
    updatedAt: '2026-09-12',
    galleryTemplate: 'masonry',
    // Portrait, and the frame that holds the cooking wall at tile size — the wall ovens at one end, the hood and cooktop at the other.
    cover: 'wall-ovens-and-cooktop-wall-6726.jpg',
    // Display order follows the lede: the island and the room it now opens into, then the wall that came out, then the
    // working walls and the run past them, and last the details — the stone, the hood, and the panelled fireplace wall
    // the kitchen now reads toward. File names carry the camera number, as at Heathwood House, Aiken Homestead,
    // Heatherstone and River Club, so a frame can be matched back to the photographer's original from the bucket
    // listing alone.
    //
    // The delivery is 40 frames, 34 of the kitchen and 6 of the living room. Twelve are left off: nine where another
    // frame says the same thing better, and three for their own reasons — two wides shot from the living room carry
    // painter's plastic on the floor and a muddy unlit ceiling, and four of the six fireplace frames repeat the two
    // kept here. The living room is in scope only as the space the kitchen now opens onto, which is what its two
    // plates are placed to show; the record's `scope` still reads Kitchen Renovation.
    //
    // 17 of the 28 run 201–350 KB at the default quality floor. Like Heatherstone and River Club, and unlike Aiken
    // Homestead, this shoot is NOT held at a raised floor: --min-quality=64 was measured against the default on the
    // three densest frames and buys ~5% on the 1200 px WebP derivative next/image actually serves (187/160/147 KB vs
    // 198/168/155 KB) while making each bucket object ~60% heavier (515–562 KB vs 319–350 KB), and at 100% the two
    // sources are indistinguishable. EXIF puts these on an iPhone 11 Pro — the same reason as those two shoots: the
    // capture is already smooth enough that the floor never bites.
    //
    // The four `feature` plates are the shoot's only landscape frames, and they split the masonry into runs of
    // 6, 4, 6, 4 and 4 — all even, so each run's two columns end level. `aspect` is set only on those four, the
    // frames that are not the 3/4 default.
    gallery: [
      {
        file: 'island-quartzite-lantern-pendants-6466.jpg',
        alt: 'The Kestwick kitchen in full — a quartzite-topped island beneath two oversized lantern pendants, the white cabinetry and tiled cooking wall beyond'
      },
      {
        file: 'island-toward-refrigerator-wall-6732.jpg',
        alt: 'Along the Kestwick island toward the refrigerator wall, an upholstered stool drawn up at the near end'
      },
      {
        file: 'kitchen-from-far-corner-stools-6705.jpg',
        alt: 'The Kestwick kitchen from its far corner, three grey stools along the island and the appliance wall running away to the right'
      },
      {
        file: 'island-end-on-quartzite-top-6481.jpg',
        alt: 'The Kestwick island end-on, its quartzite top reading the length of the room between the two lanterns'
      },
      {
        file: 'kitchen-from-living-room-side-6440.jpg',
        alt: 'The Kestwick kitchen from the living room side, floor-to-ceiling cabinetry on the left and the cooktop wall on the right'
      },
      {
        file: 'island-end-opening-to-living-room-6452.jpg',
        alt: 'The end of the Kestwick island and the cased opening beside it, the living room’s panelled fireplace wall visible through it'
      },
      {
        file: 'kitchen-wide-island-stools-6669.jpg',
        alt: 'The Kestwick kitchen seen whole from the living room, the island and its three stools centred under the lantern pendants where a wall used to stand',
        aspect: 4 / 3,
        feature: true
      },
      {
        file: 'island-sink-end-refrigerator-6700.jpg',
        alt: 'The sink end of the Kestwick island, the refrigerator and the back hall beyond it'
      },
      {
        file: 'island-toward-back-hall-6478.jpg',
        alt: 'Past the Kestwick island toward the back hall, the cooking wall running along the right'
      },
      {
        file: 'island-dishwasher-sink-run-6501.jpg',
        alt: 'The working side of the Kestwick island — sink, faucet and dishwasher set into the quartzite run'
      },
      {
        file: 'cooking-wall-across-island-sink-6685.jpg',
        alt: 'The Kestwick cooking wall across the island sink, the gas cooktop set below its painted hood and handmade-look tile'
      },
      {
        file: 'kitchen-wide-empty-island-run-6449.jpg',
        alt: 'The Kestwick kitchen unfurnished, the full run from the tall cabinets past the wall ovens to the cooktop',
        aspect: 4 / 3,
        feature: true
      },
      {
        file: 'refrigerator-wall-ovens-cooktop-6686.jpg',
        alt: 'The appliance wall of the Kestwick kitchen — refrigerator, double wall ovens and the cooktop beyond them'
      },
      {
        file: 'pantry-cabinets-refrigerator-run-6687.jpg',
        alt: 'Floor-to-ceiling pantry cabinetry beside the Kestwick refrigerator, brushed brass pulls the length of the run'
      },
      {
        file: 'wall-ovens-and-cooktop-wall-6726.jpg',
        alt: 'The Kestwick double wall ovens at one end of the cooking wall and the hood and cooktop at the other'
      },
      {
        file: 'wall-ovens-lantern-island-6667.jpg',
        alt: 'The Kestwick cooking wall from the island, one lantern pendant hanging in front of the wall ovens'
      },
      {
        file: 'cooktop-wall-straight-on-6684.jpg',
        alt: 'The Kestwick cooktop wall straight on — the painted hood between its floating wood shelves, tile carried the width of the wall'
      },
      {
        file: 'aisle-toward-window-nook-6442.jpg',
        alt: 'The working aisle of the Kestwick kitchen, wall ovens and cooktop on one side and the island on the other, the window at the end'
      },
      {
        file: 'kitchen-wide-from-refrigerator-corner-6730.jpg',
        alt: 'The Kestwick kitchen from the refrigerator corner, the island sink in front of the cooktop wall and both lanterns overhead',
        aspect: 4 / 3,
        feature: true
      },
      {
        file: 'aisle-from-back-hall-doorway-6631.jpg',
        alt: 'The Kestwick kitchen from the back hall doorway, the aisle running between the ovens and the island to the window'
      },
      {
        file: 'aisle-toward-window-pendants-6664.jpg',
        alt: 'Down the Kestwick aisle toward the window, the lantern pendants hanging over the island on the right'
      },
      {
        file: 'island-quartzite-close-up-6471.jpg',
        alt: 'The quartzite top of the Kestwick island close up, its grey and amber veining running under the faucet'
      },
      {
        file: 'cooktop-run-quartzite-counter-6661.jpg',
        alt: 'The Kestwick cooktop and the quartzite counter run beside it, tall cabinetry squared up to the hood'
      },
      {
        file: 'island-cooktop-wall-windows-6446.jpg',
        alt: 'The Kestwick island and cooking wall together, daylight from the window wall on the right',
        aspect: 4 / 3,
        feature: true
      },
      {
        file: 'cooktop-hood-floating-shelves-6657.jpg',
        alt: 'The painted hood of the Kestwick kitchen flanked by floating wood shelves, the cooktop and drawer run below it'
      },
      {
        file: 'hood-shelf-handmade-tile-6658.jpg',
        alt: 'Where the Kestwick hood meets its wood shelf, the handmade-look tile stepping up behind it'
      },
      {
        file: 'living-room-panelled-fireplace-wall-6709.jpg',
        alt: 'The living room the Kestwick kitchen now opens onto — a floor-to-ceiling panelled fireplace wall with a herringbone marble surround'
      },
      {
        file: 'fireplace-herringbone-marble-detail-6712.jpg',
        alt: 'The corner of the Kestwick fireplace, herringbone marble mosaic meeting the painted mantel and panelling'
      }
    ]
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

/**
 * Every authored record, newest first — placeholder projects included. Almost nothing should read this: it is here
 * for data guards and for tooling that has to see work the site is not publishing yet. Render from `PROJECTS`.
 *
 * The sort is stable (ES2019), so projects sharing a `year` keep their authored `PROJECT_META` order — the only
 * within-year ordering the data has. It runs *after* the map so the placeholder pool stays keyed to a record's
 * authored index: sorting first would re-deal the stock photographs whenever a project is added.
 */
export const ALL_PROJECTS: Project[] = PROJECT_META.map(buildProject).sort((a, b) => Number(b.year) - Number(a.year));

/**
 * What the site publishes: projects whose photography is real. A record with no `gallery` is still on the shared
 * Unsplash pool, so publishing it shows a stock interior under the studio's name and repeats the same photographs
 * across every unfinished project — authoring the shoot is what reveals it, exactly as `hasRealAssets` already
 * decided for structured data and alt text.
 *
 * Filtering here rather than per page is the point: this array is the single ordering source for the index, the home
 * hero and strip, and detail-page prev/next, and `getProject` reads it too — so a hidden project is absent from the
 * sitemap and `generateStaticParams`, and its URL 404s rather than serving an unlisted page full of stock photos.
 */
export const PROJECTS: Project[] = ALL_PROJECTS.filter(p => p.hasRealAssets);

/** Lookup by slug, across published projects only — an unpublished slug is `undefined`, which the route turns into a 404. */
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
