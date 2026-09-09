import { describe, expect, it } from 'vitest';
import { PROJECTS, getProject, splitLocation } from '../projects';

describe('projects data', () => {
  it('has unique project slugs', () => {
    const slugs = PROJECTS.map(project => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has unique asset keys', () => {
    const assetKeys = PROJECTS.map(project => project.assetKey);
    expect(new Set(assetKeys).size).toBe(assetKeys.length);
  });

  it('contains exactly 3 gallery images per project', () => {
    for (const project of PROJECTS) {
      expect(project.gallery).toHaveLength(3);
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
