'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * Reports 0 → 1 across a track's *pinned* range — `trackHeight - viewportHeight`.
 *
 * Callback-based, not state-based: `useScrollY` re-renders its whole subtree once per scroll frame, so anything
 * driving more than a couple of properties should write to the DOM through refs and re-render only on a discrete
 * change. `onProgress` is held in a ref, so callers need not memoize it.
 */
export function useTrackProgress(trackRef: RefObject<HTMLElement | null>, onProgress: (progress: number) => void) {
  const cb = useRef(onProgress);
  useEffect(() => {
    cb.current = onProgress;
  });

  useEffect(() => {
    let raf: number | null = null;
    // Measured once — getBoundingClientRect in the scroll handler would force layout every frame.
    let top = 0;
    let range = 1;

    const measure = () => {
      const el = trackRef.current;
      if (!el) return;
      top = el.getBoundingClientRect().top + window.scrollY;
      // A track shorter than the viewport (the reduced-motion / no-JS fallback) would divide by zero.
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
