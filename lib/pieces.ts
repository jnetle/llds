/**
 * The objects a photograph can credit — a light fixture, a faucet, a chair.
 *
 * A piece exists so a credit line on a project frame has somewhere to point. It is *not* a product listing: there is
 * no price here, no stock, and nothing to check out. A visitor asks for it, the studio quotes it, and the order is
 * placed on the trade account — see `app/pieces/actions.ts`.
 *
 * **Do not add a `price` field.** Trade pricing is confidential under the studio's trade agreement, and many of the
 * brands carried enforce a minimum advertised price. Naming a brand is ordinary editorial practice; publishing a
 * number is where the policies bite. If prices ever become publishable, `lib/schema.ts` has to grow an `offers` node
 * in the same change — markup that omits a price the page shows is as wrong as markup that invents one.
 *
 * **This module must never import `lib/projects.ts`.** The dependency runs one way, `projects` → `pieces`, which is
 * what lets `framesCreditingPiece` live over there without a cycle.
 */

/** A piece as the site consumes it. `PieceRecord` below is what you actually author. */
export type Piece = {
  slug: string;
  /** The object itself, as the maker names it, e.g. `Ashby Plaster Sconce`. */
  name: string;
  /** The maker. This is the text a credit line turns into a link, so it is written the way the brand writes it. */
  brand: string;
  /** The maker's own site. Optional, and outbound — showcasing them is half the point of a credit. */
  brandUrl?: string;
  /** `Lighting`, `Plumbing`, `Furniture`. Shown on the piece page; deliberately not in the credit line. */
  category: string;
  /** The maker and the object, one entry per paragraph. */
  story: string[];
  /** <=160 chars — this is the meta description and the OG description. */
  summary: string;
  materials?: string;
  finish?: string;
  dimensions?: string;
  /** Free text, e.g. `10–12 weeks`. Never a promise — quoted lead times move, so the page words it as typical. */
  leadTime?: string;
  /** ISO date. Feeds `lastModified` in app/sitemap.ts; falls back to build time. */
  updatedAt?: string;
};

/**
 * What you author. Only the identifying fields are required: a piece can be published on its name, maker and
 * category alone, because its photograph comes from the project frame that credits it rather than from a shoot of
 * its own. That is the whole reason this needs no asset pipeline.
 */
type PieceRecord = {
  slug: string;
  name: string;
  brand: string;
  brandUrl?: string;
  category: string;
  story?: string[];
  summary?: string;
  materials?: string;
  finish?: string;
  dimensions?: string;
  leadTime?: string;
  updatedAt?: string;
};

/**
 * Authored pieces. Empty until a frame credits one — nothing here should be invented, because every field is a
 * factual claim about a third party's product.
 *
 * A worked example, for when the first one lands:
 *
 * ```ts
 * {
 *   slug: 'ashby-plaster-sconce',
 *   name: 'Ashby Plaster Sconce',
 *   brand: 'Visual Comfort & Co.',
 *   brandUrl: 'https://www.visualcomfort.com',
 *   category: 'Lighting',
 *   story: [
 *     'Hand-cast in plaster and finished by hand, so no two carry quite the same surface.',
 *     'Specified in the primary bath for the way it throws light up a wall rather than across a mirror.'
 *   ],
 *   materials: 'Cast plaster, antique brass',
 *   finish: 'Plaster white',
 *   dimensions: '6"W x 14"H x 4"D',
 *   leadTime: 'Typically 8–10 weeks',
 *   updatedAt: '2026-09-16'
 * }
 * ```
 */
const PIECE_META: PieceRecord[] = [];

// ── Derivation ──────────────────────────────────────────────────────────────
// Same posture as lib/projects.ts: each fallback reads as provisional, so a page rendering derived copy looks
// unfinished rather than deliberate.

/** A floor, not a finish. A piece worth crediting is worth a sentence about its maker. */
const deriveStory = (m: PieceRecord): string[] => [`${m.name}, by ${m.brand}.`];

const buildPiece = (m: PieceRecord): Piece => {
  const story = m.story ?? deriveStory(m);

  return {
    slug: m.slug,
    name: m.name,
    brand: m.brand,
    brandUrl: m.brandUrl,
    category: m.category,
    story,
    summary: m.summary ?? story[0],
    materials: m.materials,
    finish: m.finish,
    dimensions: m.dimensions,
    leadTime: m.leadTime,
    updatedAt: m.updatedAt
  };
};

/** Every piece, in authored order. There is no unpublished tier here — authoring a record publishes it. */
export const PIECES: Piece[] = PIECE_META.map(buildPiece);

/** Lookup by slug. `undefined` is what the route turns into a 404, and what `lib/projects.ts` drops a credit on. */
export const getPiece = (slug: string): Piece | undefined => PIECES.find(p => p.slug === slug);

/**
 * Pieces grouped by maker, makers in first-appearance order. The index page reads this; it is derived rather than
 * authored so a maker cannot exist with no pieces under it, or be spelled two ways across two records.
 */
export const piecesByMaker = (): { brand: string; brandUrl?: string; pieces: Piece[] }[] => {
  const makers = new Map<string, { brand: string; brandUrl?: string; pieces: Piece[] }>();

  for (const piece of PIECES) {
    const existing = makers.get(piece.brand);
    if (existing) {
      // First non-empty `brandUrl` wins, so one record omitting it does not blank the maker's link.
      existing.brandUrl ??= piece.brandUrl;
      existing.pieces.push(piece);
    } else {
      makers.set(piece.brand, { brand: piece.brand, brandUrl: piece.brandUrl, pieces: [piece] });
    }
  }

  return [...makers.values()];
};
