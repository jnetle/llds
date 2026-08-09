'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * However long the assets take, the panel plays. A font that never arrives or an
 * image that 404s must not strand the entrance in its paused first frame.
 */
const MAX_WAIT = 2500;

/**
 * True once the cover panel is ready to play its entrance.
 *
 * The choreography is pure CSS `animation-delay`, so its clock starts at first
 * paint of the SSR'd markup — before hydration, before `next/font` swaps, before
 * the logo decodes. CSS animations advance on wall-clock time rather than on
 * frames, so a main thread busy parsing the bundle doesn't *delay* the stagger,
 * it *skips* it: the first frame the browser manages to paint lands wherever the
 * clock already is, and the reader sees only the tail. Holding every animation
 * paused until this returns true is what makes the timeline start when there is
 * someone to watch it.
 *
 * Ready means fonts settled and the logo decoded, then two frames' grace. The
 * gate doubles as a fix for `useCompact`, which initialises to `false` and so
 * re-lays-out the arch at hydration; by the time this flips, `narrow` is right.
 *
 * @param rootRef the panel root — the logo is found inside it, not threaded
 *   through `next/image`. `onLoad` would be the obvious hook and is the wrong
 *   one: with a static import plus `priority` the image is routinely complete
 *   before hydration, and React never fires `onLoad` for an `<img>` that
 *   finished loading before it was hydrated.
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
      // Two frames, not one. The frame immediately after readiness is often the
      // one that lands final layout; starting on the next keeps the opening
      // frames of the draw from being spent on a reflow.
      outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setReady(true));
      });
    };

    const timeout = setTimeout(play, MAX_WAIT);

    const img = rootRef.current?.querySelector('img');
    // decode() waits for load *and* decode, and resolves straight away if both
    // already happened. It rejects for an image with no usable source, which is
    // not a reason to hold the panel.
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
