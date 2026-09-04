'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useTrackProgress } from '@/hooks/useTrackProgress';
import { color, motion } from '@/lib/tokens';

export type MagazinePage = {
  src: string;
  /** Folio label under the stage — 'Cover', 'Page 1'… */
  label: string;
  alt: string;
  /** Pull quote shown beside the stage while this page is the one on top. */
  quote?: string;
};

// The sticky stage is 100svh, so a track of `100svh + turns * TURN` pins for exactly one --mag-turn per page turned.
// LEAD_IN / LEAD_OUT hold the stack still at either end so the cover reads as a cover before it lifts.
const LEAD_IN = 0.08;
const LEAD_OUT = 0.1;

// Past this point a leaf is nearly edge-on; fading it out stops turned pages piling into a slab on the left, where
// there is no facing page for them to land on.
const FADE_FROM = 0.82;

// Leaves are opaque and exactly stacked, so five shadows would compound into a halo. Only the leaf mid-turn and the
// topmost resting leaf carry one.
const SHADOW_TURNING = '0 34px 70px -20px rgb(31 58 50 / 0.45), 0 8px 22px -10px rgb(31 58 50 / 0.32)';
const SHADOW_RESTING = '0 26px 54px -26px rgb(31 58 50 / 0.34), 0 4px 14px -8px rgb(31 58 50 / 0.2)';

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export function MagazineReader({ pages }: { pages: MagazinePage[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const leafRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bookRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const indexRef = useRef(0);

  const count = pages.length;
  // The last page is the bottom of the stack and never turns, so there is one fewer turn than leaves.
  const turns = Math.max(1, count - 1);

  useTrackProgress(
    trackRef,
    useCallback(
      p => {
        const q = clamp01((p - LEAD_IN) / (1 - LEAD_IN - LEAD_OUT));

        // Resolve every turn first — the shadow rule needs to know whether the leaf above has finished turning.
        const turned: number[] = [];
        for (let i = 0; i < count; i++) turned.push(i >= turns ? 0 : clamp01(q * turns - i));

        for (let i = 0; i < count; i++) {
          const leaf = leafRefs.current[i];
          if (!leaf) continue;
          const t = turned[i];

          leaf.style.transform = `rotateY(${-t * 180}deg)`;
          leaf.style.opacity = String(t > FADE_FROM ? 1 - (t - FADE_FROM) / (1 - FADE_FROM) : 1);
          // Face-up leaves paint above turned ones: untouched get the top band (2N-i), turned the bottom (i).
          // A single `N - i` vs `i` split collides in the middle of the stack.
          leaf.style.zIndex = String(t < 0.5 ? 2 * count - i : i);
          leaf.style.boxShadow = t > 0 && t < 1 ? SHADOW_TURNING : t === 0 && (i === 0 || turned[i - 1] === 1) ? SHADOW_RESTING : 'none';

          const shade = shadeRefs.current[i];
          if (shade) shade.style.opacity = String(t * 0.55);
        }

        const next = Math.min(count - 1, Math.round(q * turns));
        if (next !== indexRef.current) {
          indexRef.current = next;
          setIndex(next);
        }
      },
      [count, turns]
    )
  );

  // Jump to the scroll position that puts leaf `i` on top. Reads the track geometry on click, not per frame.
  const goTo = useCallback(
    (i: number) => {
      const el = trackRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const range = Math.max(1, el.offsetHeight - window.innerHeight);
      const q = i / turns;
      window.scrollTo({ top: top + (LEAD_IN + q * (1 - LEAD_IN - LEAD_OUT)) * range, behavior: 'smooth' });
    },
    [turns]
  );

  const close = useCallback(() => {
    setLightbox(null);
    bookRef.current?.focus();
  }, []);

  useEffect(() => {
    if (lightbox === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') setLightbox(v => (v === null ? v : Math.min(count - 1, v + 1)));
      if (e.key === 'ArrowLeft') setLightbox(v => (v === null ? v : Math.max(0, v - 1)));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // No body scroll lock: `body { overflow: hidden }` is rejected by check-css.mjs — it would create a scroll
    // container and kill position: sticky sitewide. The overlay is fixed and opaque, so scrolling behind is harmless.
  }, [lightbox, close, count]);

  return (
    <>
      <div ref={trackRef} className="mag-track">
        <div className="mag-stage">
          <div className="mag-stage__book">
            <button
              ref={bookRef}
              type="button"
              className="mag-book"
              onClick={() => setLightbox(indexRef.current)}
              aria-label={`Read ${pages[index]?.label ?? 'the feature'} full screen`}>
              {pages.map((page, i) => (
                <div
                  key={page.src}
                  ref={el => {
                    leafRefs.current[i] = el;
                  }}
                  className="mag-leaf"
                  style={{ zIndex: 2 * count - i }}>
                  <div className="mag-leaf__face">
                    <Image
                      src={page.src}
                      alt={page.alt}
                      fill
                      sizes="(max-width: 1024px) 92vw, 42vw"
                      style={{ objectFit: 'cover' }}
                      draggable={false}
                    />
                    <div
                      ref={el => {
                        shadeRefs.current[i] = el;
                      }}
                      className="mag-leaf__shade"
                    />
                  </div>
                  {/* The reverse of page 8 is page 7, which is not ours to show — a plain warm
                      stock is the honest back of the leaf. */}
                  <div className="mag-leaf__back" />
                </div>
              ))}
              <span className="mag-book__hint" aria-hidden>
                <Eyebrow size="sm" opacity={0.9} as="span" style={{ letterSpacing: '0.24em' }}>
                  Click to read
                </Eyebrow>
              </span>
            </button>
          </div>

          <div className="mag-stage__aside">
            <Eyebrow size="sm" opacity={0.55} style={{ letterSpacing: '0.26em', marginBottom: 26 }}>
              Aiken Hound &amp; Home · Winter 2024
            </Eyebrow>
            <div className="mag-quotes">
              {pages.map((page, i) =>
                page.quote ? (
                  <p
                    key={page.src}
                    className="serif mag-quote"
                    aria-hidden={i !== index}
                    style={{
                      opacity: i === index ? 1 : 0,
                      transform: i === index ? 'translateY(0)' : 'translateY(10px)',
                      // Asymmetric on purpose: the quotes share a grid cell, so a symmetric crossfade would stack
                      // both sets of words mid-swap. The outgoing line clears first.
                      transition:
                        i === index
                          ? `opacity 380ms ${motion.ease} 170ms, transform 380ms ${motion.ease} 170ms`
                          : `opacity 190ms ${motion.ease}, transform 190ms ${motion.ease}`
                    }}>
                    {page.quote}
                  </p>
                ) : null
              )}
            </div>

            <nav className="mag-dots" aria-label="Magazine pages">
              {pages.map((page, i) => (
                <button
                  key={page.src}
                  type="button"
                  className="mag-dot"
                  data-active={i === index ? '' : undefined}
                  onClick={() => goTo(i)}
                  aria-label={`Go to ${page.label}`}
                  aria-current={i === index ? 'true' : undefined}
                />
              ))}
            </nav>
          </div>
        </div>
      </div>

      {lightbox !== null && (
        <div className="mag-lightbox" role="dialog" aria-modal="true" aria-label={pages[lightbox].alt} onClick={close}>
          <div className="mag-lightbox__frame" onClick={e => e.stopPropagation()}>
            <Image src={pages[lightbox].src} alt={pages[lightbox].alt} fill sizes="90vw" style={{ objectFit: 'contain' }} priority />
          </div>
          <div className="mag-lightbox__bar" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="mag-lightbox__btn"
              onClick={() => setLightbox(v => Math.max(0, (v ?? 0) - 1))}
              disabled={lightbox === 0}
              aria-label="Previous page">
              ‹
            </button>
            <Eyebrow size="sm" as="span" opacity={0.8} style={{ letterSpacing: '0.26em', color: color.bg }}>
              {pages[lightbox].label}
            </Eyebrow>
            <button
              type="button"
              className="mag-lightbox__btn"
              onClick={() => setLightbox(v => Math.min(count - 1, (v ?? 0) + 1))}
              disabled={lightbox === count - 1}
              aria-label="Next page">
              ›
            </button>
          </div>
          <button ref={closeRef} type="button" className="mag-lightbox__close" onClick={close} aria-label="Close">
            ✕
          </button>
        </div>
      )}
    </>
  );
}
