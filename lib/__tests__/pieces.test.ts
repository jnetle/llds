import { describe, expect, it } from 'vitest';
import { PIECES, getPiece, piecesByMaker } from '../pieces';

const KEBAB_KEY_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Vacuous while nothing is authored, and deliberately shipped that way: these are the guards that start earning
// their keep the moment the first credit lands, and writing them after the data is how a catalogue picks up two
// spellings of one maker.
describe('pieces data', () => {
  it('has unique, kebab-case slugs', () => {
    const slugs = PIECES.map(piece => piece.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(KEBAB_KEY_RE);
  });

  it('names a maker, a category and a summary on every piece', () => {
    for (const piece of PIECES) {
      // The brand is the text a credit line turns into a link; an empty one renders a link with no label.
      expect(piece.brand.trim()).not.toBe('');
      expect(piece.category.trim()).not.toBe('');
      expect(piece.summary.trim()).not.toBe('');
      expect(piece.story.length).toBeGreaterThan(0);
    }
  });

  it('keeps every summary short enough to be a meta description', () => {
    for (const piece of PIECES) expect(piece.summary.length).toBeLessThanOrEqual(160);
  });

  it('uses absolute https URLs for a maker’s own site', () => {
    // These are outbound and open in a new tab; a bare `visualcomfort.com` would resolve against this origin.
    for (const piece of PIECES) {
      if (piece.brandUrl) expect(piece.brandUrl).toMatch(/^https:\/\//);
    }
  });

  it('returns pieces by slug and undefined for unknown slugs', () => {
    expect(getPiece('definitely-not-a-piece')).toBeUndefined();
    for (const piece of PIECES) expect(getPiece(piece.slug)?.slug).toBe(piece.slug);
  });

  it('groups by maker without losing or duplicating a piece', () => {
    const grouped = piecesByMaker();
    expect(grouped.flatMap(maker => maker.pieces)).toHaveLength(PIECES.length);
    // One maker, one group — a brand spelled two ways would show up here as two.
    const brands = grouped.map(maker => maker.brand);
    expect(new Set(brands).size).toBe(brands.length);
  });
});
