'use client';

import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/**
 * Module scope, so this runs once per document and then never again — the same
 * distinction `coverSeen` in HomeShell draws. A client-side navigation keeps the
 * module and is left alone; only a fresh document gets the reset.
 */
let handled = false;

/**
 * Suppress the browser's restored scroll offset for this document load.
 *
 * Nothing else in the app touches scroll restoration, and the App Router (unlike
 * the Pages Router) doesn't either, so a reload lands wherever the reader last
 * was. That is fine on a page of prose and wrong on the home page: the cover
 * panel is `position: absolute; top: 0` with no scroll transform of its own, so
 * it is only whole if the document is at 0 when it mounts.
 *
 * Two mechanisms, because one isn't enough on its own. `scrollRestoration =
 * 'manual'` stops the browser re-applying the offset as the document grows, but
 * for an SSR'd page the height is known immediately and the first restore has
 * usually already landed by the time hydration runs — so the explicit scroll is
 * what actually undoes it.
 */
export function useScrollTopOnLoad() {
  useIsomorphicLayoutEffect(() => {
    if (handled) return;
    handled = true;

    const canControl = 'scrollRestoration' in history;
    if (canControl) history.scrollRestoration = 'manual';
    if (window.scrollY !== 0) window.scrollTo(0, 0);
    if (!canControl) return;

    // Hand restoration straight back. A pushState entry inherits the current
    // entry's mode, so leaving this on 'manual' would follow the reader into
    // every route they open next and kill back/forward restoration site-wide.
    // Waiting for load keeps the window in which the browser would still have
    // acted covered.
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
