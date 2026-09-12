import { describe, expect, it } from 'vitest';
import { PROJECTS, formatLocationLong, getProject, splitLocation } from '../projects';

const KEBAB_KEY_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe('projects data', () => {
  it('has unique project slugs', () => {
    const slugs = PROJECTS.map(project => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has unique asset keys', () => {
    const assetKeys = PROJECTS.map(project => project.assetKey);
    expect(new Set(assetKeys).size).toBe(assetKeys.length);
  });

  it('uses lowercase kebab-case asset keys', () => {
    for (const project of PROJECTS) {
      expect(project.assetKey).toMatch(KEBAB_KEY_RE);
    }
  });

  it('gives every project a non-empty gallery, and exactly 3 while it is on placeholders', () => {
    for (const project of PROJECTS) {
      expect(project.gallery.length).toBeGreaterThan(0);
      // The placeholder pool is authored as threes; only a real shoot varies in length.
      if (!project.hasRealAssets) expect(project.gallery).toHaveLength(3);
    }
  });

  it('gives every gallery image a distinct src and a non-empty alt', () => {
    for (const project of PROJECTS) {
      const sources = project.gallery.map(image => image.src);
      // File names are authored per plate now, so a duplicate here means the same photograph was listed twice.
      expect(new Set(sources).size).toBe(sources.length);
      for (const image of project.gallery) expect(image.alt.trim()).not.toBe('');
    }
  });

  it('gives every project a known gallery template and a positive aspect on every plate', () => {
    for (const project of PROJECTS) {
      expect(['plates', 'masonry']).toContain(project.galleryTemplate);
      // A zero or negative aspect collapses the masonry tile to nothing, and `aspect-ratio` fails silently.
      for (const image of project.gallery) expect(image.aspect).toBeGreaterThan(0);
    }
  });

  it('names gallery files as lowercase kebab slugs', () => {
    // A format guard only. Whether a name is descriptive or a camera ID is an editorial call this cannot see —
    // `img-6260.jpg` passes — so it checks the one thing it can: casing and separators, per the bucket layout rule.
    for (const project of PROJECTS.filter(p => p.hasRealAssets)) {
      for (const image of project.gallery) {
        const file = image.src.split('/').pop() ?? '';
        expect(file).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|png|webp)$/);
      }
    }
  });

  it('resolves every cover inside its own project folder', () => {
    // `cover` is a hand-typed file name, and a wrong one breaks the index tile, the home hero and the strip at once.
    // It may legitimately name a file outside `gallery`, so the invariant is the folder, not membership.
    for (const project of PROJECTS.filter(p => p.hasRealAssets)) {
      expect(project.cover.src).toContain(`/projects/${project.assetKey}/`);
      expect(project.cover.src.split('/').pop()).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|png|webp)$/);
    }
  });

  it('lets a cover that names a gallery plate inherit that plate’s alt text', () => {
    for (const project of PROJECTS.filter(p => p.hasRealAssets)) {
      const plate = project.gallery.find(image => image.src === project.cover.src);
      // One photograph, one description — the cover must not restate it in different words.
      if (plate) expect(project.cover.alt).toBe(plate.alt);
    }
  });

  it('returns projects by slug and undefined for unknown slugs', () => {
    const sample = PROJECTS[0];
    expect(getProject(sample.slug)?.slug).toBe(sample.slug);
    expect(getProject('not-a-real-project')).toBeUndefined();
  });

  it('uses placeholder alt text while a project has placeholder assets', () => {
    const placeholderProjects = PROJECTS.filter(project => !project.hasRealAssets);

    if (placeholderProjects.length === 0) {
      expect(PROJECTS.every(project => project.hasRealAssets)).toBe(true);
      return;
    }

    for (const project of placeholderProjects) {
      expect(project.cover.alt).toContain('Placeholder interior photograph');
    }
  });
});

describe('splitLocation', () => {
  it('splits city/state pairs', () => {
    expect(splitLocation('Aiken, SC')).toEqual({ city: 'Aiken', region: 'SC' });
  });

  it('degrades to a city-only shape for non-paired locations', () => {
    expect(splitLocation('Augusta')).toEqual({ city: 'Augusta' });
  });
});

describe('formatLocationLong', () => {
  it('spells out the state for the project detail heading', () => {
    expect(formatLocationLong('Johnston, SC')).toBe('Johnston, South Carolina');
    expect(formatLocationLong('Evans, GA')).toBe('Evans, Georgia');
  });

  it('leaves the record itself short', () => {
    // The heading is the only surface that expands; tiles, titles and schema keep the authored form.
    const johnston = PROJECTS.find(project => project.slug === 'johnston-two-mile-house');
    expect(johnston?.location).toBe('Johnston, SC');
  });

  it('passes through anything that is not a known state code', () => {
    expect(formatLocationLong('Augusta')).toBe('Augusta');
    expect(formatLocationLong('Aiken, South Carolina')).toBe('Aiken, South Carolina');
    expect(formatLocationLong('Paris, ZZ')).toBe('Paris, ZZ');
  });
});
