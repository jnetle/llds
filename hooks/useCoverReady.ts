'use client';

import { useEffect, useState, type RefObject } from 'react';

/** However long the assets take, the panel plays — a font that never arrives must not strand the entrance. */
const MAX_WAIT = 2500;

/**
 * True once the cover panel is ready to play its entrance.
 *
 * The choreography is pure CSS `animation-delay`, whose clock starts at first paint of the SSR'd markup. CSS
 * animations advance on wall-clock time, so a busy main thread doesn't delay the stagger, it *skips* it — the first
 * painted frame lands wherever the clock already is and the reader sees only the tail. Holding every animation paused
 * until this flips is what makes the timeline start when there is someone to watch it. It also covers `useCompact`,
 * which initialises `false` and would otherwise re-lay-out the arch at hydration.
 *
 * @param rootRef the panel root — the logo is found inside it rather than threaded through `next/image`. `onLoad` is
 *   the obvious hook and the wrong one: with a static import plus `priority` the image is routinely complete before
 *   hydration, and React never fires `onLoad` for an `<img>` that finished loading before it was hydrated.
 */
export function useCoverReady(rootRef: RefObject<HTMLElement | null>): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;
    let outer = 0;
    let inner = 0;

    const play = () => {
      if (done) return;
      done = true;
      // Two frames: the one immediately after readiness often lands final layout, and the opening frames of the draw
      // should not be spent on a reflow.
      outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setReady(true));
      });
    };

    const timeout = setTimeout(play, MAX_WAIT);

    const img = rootRef.current?.querySelector('img');
    // decode() waits for load *and* decode and resolves immediately if both already happened. It rejects for an image
    // with no usable source, which is not a reason to hold the panel.
    const decoded = img ? img.decode().catch(() => {}) : Promise.resolve();

    Promise.all([document.fonts.ready, decoded]).then(play);

    return () => {
      done = true;
      clearTimeout(timeout);
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [rootRef]);

  return ready;
}
