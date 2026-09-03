'use client';

import { useEffect, useState } from 'react';

// How far down the page the button appears, in viewports. 1.5 is the point where
// "scroll back up" stops being a flick and starts being a trip: the visitor has
// passed a full screen of content and the top is no longer in recent memory.
// Anything shorter (a 300px trigger, say) puts a control on screen for a journey
// the scrollbar already handles.
const SHOW_AT_VIEWPORTS = 1.5;

// Hidden again slightly higher up than it appeared, so scrolling around the
// threshold doesn't flicker the button in and out.
const HIDE_AT_VIEWPORTS = 1.2;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf: number | null = null;

    const measure = () => {
      raf = null;
      const vh = window.innerHeight;
      setVisible(prev => (prev ? window.scrollY > vh * HIDE_AT_VIEWPORTS : window.scrollY > vh * SHOW_AT_VIEWPORTS));
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const toTop = () => {
    // Read the preference at click time rather than through a hook: a hook
    // initialises `false` and would render the wrong branch before hydration,
    // and here the value is only ever needed inside the handler.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  // Always rendered; `data-visible` drives the fade in globals.css, the same way
  // the header's fill rides `data-solid`. Kept out of the tab order and off the
  // accessibility tree while it is invisible.
  return (
    <button
      type="button"
      className="scroll-top"
      data-visible={visible ? '' : undefined}
      onClick={toTop}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <path d="M7.5 12.5V2.5M7.5 2.5L2.75 7.25M7.5 2.5l4.75 4.75" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </button>
  );
}
