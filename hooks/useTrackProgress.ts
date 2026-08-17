'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * Reports 0 → 1 progress across a tall track element's *pinned* range — the distance a
 * `position: sticky` child of height 100svh stays stuck, which is `trackHeight - viewportHeight`.
 *
 * Callback-based rather than state-based on purpose. `useScrollY` re-renders its whole consuming
 * subtree once per scroll frame (ProjectStrip pays that today); a magazine reader driving five
 * 3D transforms wants to write straight to the DOM through refs and re-render only when a
 * discrete value — the current page index — actually changes.
 *
 * `onProgress` is held in a ref, so callers don't have to memoize it to avoid re-subscribing.
 */
export function useTrackProgress(trackRef: RefObject<HTMLElement | null>, onProgress: (progress: number) => void) {
  const cb = useRef(onProgress);
  useEffect(() => {
    cb.current = onProgress;
  });

  useEffect(() => {
    let raf: number | null = null;
    // Measured rather than read per frame: getBoundingClientRect in the scroll handler would
    // force layout on every frame. Same measure-once approach as ProjectStrip.
    let top = 0;
    let range = 1;

    const measure = () => {
      const el = trackRef.current;
      if (!el) return;
      top = el.getBoundingClientRect().top + window.scrollY;
      // Guard against 0 — a track shorter than the viewport (the reduced-motion / no-JS
      // fallback collapses it to auto height) would otherwise divide by zero.
      range = Math.max(1, el.offsetHeight - window.innerHeight);
    };

    const update = () => {
      const p = (window.scrollY - top) / range;
      cb.current(p < 0 ? 0 : p > 1 ? 1 : p);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        update();
        raf = null;
      });
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    // Measure on a frame so layout has settled, then seed the first value.
    const first = requestAnimationFrame(onResize);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(first);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [trackRef]);
}
