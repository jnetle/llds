import { describe, expect, it } from 'vitest';
import { pageOpenGraph } from '../seo';
import { SITE } from '../site';

describe('pageOpenGraph', () => {
  it('includes shared OG defaults for regular pages', () => {
    const og = pageOpenGraph({
      title: 'Services — Laurel Leaf Design Studio',
      description: 'Services page description',
      path: '/services'
    });

    expect(og).toMatchObject({
      type: 'website',
      siteName: SITE.name,
      locale: 'en_US',
      url: '/services',
      title: 'Services — Laurel Leaf Design Studio',
      description: 'Services page description',
      images: ['/opengraph-image']
    });
  });

  it('omits shared image when a route provides its own opengraph-image file', () => {
    const og = pageOpenGraph({
      title: 'Yucca Ave — Laurel Leaf Design Studio',
      description: 'Project description',
      path: '/projects/yucca-ave',
      type: 'article',
      hasOwnImage: true
    });

    expect(og).toMatchObject({
      type: 'article',
      siteName: SITE.name,
      locale: 'en_US',
      url: '/projects/yucca-ave'
    });
    expect(og).not.toHaveProperty('images');
  });
});
