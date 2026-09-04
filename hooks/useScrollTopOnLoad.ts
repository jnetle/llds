'use client';

import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/** Module scope, so this runs once per document. A client-side navigation keeps the module and is left alone. */
let handled = false;

/**
 * Suppress the browser's restored scroll offset for this document load.
 *
 * The App Router doesn't manage scroll restoration, so a reload lands where the reader left off — fine on prose, wrong
 * on the home page, where the cover panel is `position: absolute; top: 0` and is only whole if the document is at 0
 * when it mounts. Both mechanisms are needed: `scrollRestoration = 'manual'` stops the browser re-applying the offset
 * as the document grows, but on an SSR'd page the first restore has usually already landed, so the explicit scroll is
 * what undoes it.
 */
export function useScrollTopOnLoad() {
  useIsomorphicLayoutEffect(() => {
    if (handled) return;
    handled = true;

    const canControl = 'scrollRestoration' in history;
    if (canControl) history.scrollRestoration = 'manual';
    if (window.scrollY !== 0) window.scrollTo(0, 0);
    if (!canControl) return;

    // A pushState entry inherits the current entry's mode, so leaving this on 'manual' would kill back/forward
    // restoration site-wide. Waiting for load keeps the window in which the browser would still have acted covered.
    let raf: number | null = null;
    const release = () => {
      raf = requestAnimationFrame(() => {
        history.scrollRestoration = 'auto';
        raf = null;
      });
    };

    if (document.readyState === 'complete') {
      release();
      return () => {
        if (raf) cancelAnimationFrame(raf);
      };
    }

    window.addEventListener('load', release, { once: true });
    return () => {
      window.removeEventListener('load', release);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}
