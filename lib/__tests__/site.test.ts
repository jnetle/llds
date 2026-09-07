import { describe, expect, it } from 'vitest';
import { SITE, absoluteUrl } from '../site';

describe('absoluteUrl', () => {
  it('resolves site-relative paths against SITE.url', () => {
    expect(absoluteUrl('/projects')).toBe(new URL('/projects', SITE.url).toString());
  });

  it('accepts paths without a leading slash', () => {
    expect(absoluteUrl('about')).toBe(new URL('about', SITE.url).toString());
  });

  it('preserves query strings and hashes', () => {
    expect(absoluteUrl('/projects?year=2026#featured')).toBe(new URL('/projects?year=2026#featured', SITE.url).toString());
  });
});
