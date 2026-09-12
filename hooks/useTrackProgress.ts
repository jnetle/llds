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

    const update = () => {
      const el = trackRef.current;
      if (!el) return;
      // Read live, not from geometry cached at mount. A track's document offset moves whenever anything above it
      // changes height, and on the home page something does: the cover panel unmounts and takes a viewport of lead
      // stage with it, sliding the project strip's track ~100svh up the page. A cached offset then places the pinned
      // range where the reader has already scrolled past, and the scrub never runs at all — the strip sat still for
      // its whole pass. A ResizeObserver is not the fix either: `html` here is viewport-height, so observing the
      // document element never fires. One rect read at the top of the frame, before any of the writes the callback
      // goes on to make, is a layout read and not a thrash.
      const rect = el.getBoundingClientRect();
      // A track shorter than the viewport (the reduced-motion / no-JS fallback) would divide by zero.
      const range = Math.max(1, rect.height - window.innerHeight);
      const p = -rect.top / range;
      cb.current(p < 0 ? 0 : p > 1 ? 1 : p);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        update();
        raf = null;
      });
    };

    // Seed on a frame so layout has settled.
    const first = requestAnimationFrame(update);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(first);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [trackRef]);
}
