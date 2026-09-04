'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useCompact } from '@/hooks/useCompact';
import { useCoverReady } from '@/hooks/useCoverReady';
import { useScrollY } from '@/hooks/useScrollY';
import { brand } from '@/lib/tokens';
import { ArchGlyphDefs, LL_GLYPH_ID } from './ArchGlyph';
import logoLongNavy from '@/public/logo-long-navy.png';

// A full-viewport plane pierced by an arch-shaped window, scrolled away by ordinary document flow — no scroll-driven
// transform, the panel is `position: absolute; top: 0` and rides up because the document does. It paints no
// background of its own; the color comes entirely from the cutout path below, so whatever is pinned behind shows through.

// ── Arch geometry, in the artwork's own coordinate space ──────────────────────
const VB = '0 0 1159 1500';

// The inner arch. Used twice: as the hole in the flood fill, and as the clip keeping the monogram inside the window.
const ARCH = 'M256 1390.5 V499 A323 323 0 0 1 902 499 V1390.5 Z';

// One `fill-rule="evenodd"` path: an oversized rect that floods the panel, minus ARCH, so the arch is a genuine hole
// rather than a lighter patch. The panel's `overflow: hidden` stops the bleed at the edge — load-bearing, not cosmetic.
const CUTOUT = `M-9000 -9000 H10000 V10000 H-9000 Z ${ARCH}`;

// The six self-drawing strokes, outward-in: baselines, then the outer arch, then the inner one.
const STROKES: { d: string; delay: string; dur: string }[] = [
  { d: 'M579 1390.5 H 109', delay: '0s', dur: '.6s' },
  { d: 'M579 1390.5 H 1049', delay: '0s', dur: '.6s' },
  { d: 'M190.5 1390.5 V 497 A 388.5 388.5 0 0 1 579 108.5', delay: '.16s', dur: '.98s' },
  { d: 'M967.5 1390.5 V 497 A 388.5 388.5 0 0 0 579 108.5', delay: '.16s', dur: '.98s' },
  { d: 'M256 1390.5 V 499 A 323 323 0 0 1 579 176', delay: '.29s', dur: '.98s' },
  { d: 'M902 1390.5 V 499 A 323 323 0 0 0 579 176', delay: '.29s', dur: '.98s' }
];

// ── Logo lockup crop ──────────────────────────────────────────────────────────
// logo-long-navy.png is 1691×386 and leads with the arch monogram, cropped off here so it doesn't double up with the
// big arch beside it. Measured from the alpha channel: the wordmark occupies x 325–1690, rows 82–350.
const CROP = { x: 325, y: 82, w: 1691 - 325, h: 350 - 82 + 1 };
const pct = (n: number) => `${(n * 100).toFixed(4)}%`;

type CoverPanelProps = {
  /** Called once the panel is entirely off the top. There is no scrolling back — HomeShell unmounts it here. */
  onDismiss: () => void;
};

export function CoverPanel({ onDismiss }: CoverPanelProps) {
  // The hero layout switches at 860px.
  const narrow = useCompact(860);
  const scrollY = useScrollY();
  const hiddenRef = useRef<boolean | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Held paused until the panel can be seen playing it — see useCoverReady for why CSS delays alone get skipped.
  const playing = useCoverReady(sectionRef);

  // Hide the global header while the panel owns the viewport — its own lockup stands in — and release it once the
  // panel has nearly cleared, via the same `globalHeader:setHidden` event the Services page uses.
  //
  // The dismissal check rides along here rather than subscribing to scroll twice, and reads the panel's own rect:
  // the panel is sized in svh, which parts company with innerHeight whenever a mobile URL bar retracts.
  useEffect(() => {
    const next = scrollY < window.innerHeight * 0.92;
    if (hiddenRef.current !== next) {
      hiddenRef.current = next;
      window.dispatchEvent(new CustomEvent('globalHeader:setHidden', { detail: { hidden: next } }));
    }

    const rect = sectionRef.current?.getBoundingClientRect();
    if (rect && rect.bottom <= 0) onDismiss();
  }, [scrollY, onDismiss]);

  // Unmounting with the header stranded off-screen would break every other route.
  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('globalHeader:setHidden', { detail: { hidden: false } }));
    };
  }, []);

  const onNext = () => {
    window.scrollTo({ top: window.scrollY + window.innerHeight * 1.05, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className={playing ? 'cover-panel is-playing' : 'cover-panel'}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        // svh, never vh — on mobile vh measures past the browser chrome and the kicker would sit off-screen.
        height: '100svh',
        overflow: 'hidden',
        zIndex: 45,
        display: 'grid',
        placeItems: 'center',
        background: 'transparent',
        color: brand.navyInk,
        boxShadow: '0 24px 48px -30px rgba(15, 26, 43, 0.55)',
        // Navy ink at 24% — an alpha of a palette color, not a new one.
        ['--cover-divider' as string]: 'rgba(15, 26, 43, 0.24)'
      }}>
      <ArchGlyphDefs />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: narrow ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: narrow ? 'clamp(14px,2.4vh,24px)' : 'clamp(8px,1.6vw,28px)',
          padding: narrow
            ? 'clamp(28px,4vh,44px) 22px clamp(56px,7vh,72px)'
            : 'clamp(56px,7vh,80px) clamp(20px,4vw,56px) clamp(40px,5vh,56px)'
        }}>
        {/* ── The arch ──
            z-index is declared on all three children rather than left to paint
            order. The cutout's flood fill bleeds ±9000 units past the SVG box, so
            it covers the lockup's slot too; being `position: relative` it would
            paint over any static sibling. That is normally masked — cover-rise-in
            puts a transform on the lockup and kicker, which promotes them past it
            — but under prefers-reduced-motion there is no transform, and the
            kicker would vanish behind the fill. */}
        <div
          className="cover-arch"
          style={{
            position: 'relative',
            zIndex: 0,
            flex: narrow ? '0 1 auto' : 'none',
            minHeight: 0,
            height: narrow ? 'min(42svh,380px)' : 'min(96svh,900px,calc(100svh - 120px))',
            maxHeight: narrow ? 'calc(100svh - 300px)' : 'none',
            width: 'auto',
            aspectRatio: '1159 / 1500'
          }}>
          {/* The pane behind the window, inset to the arch. Sits under the SVG, so
              it fills the hole the cutout leaves and lightens whatever is behind
              the panel — which is what gives the navy monogram drawn on top of it
              something to read against.

              A plain translucent fill, deliberately *no* `backdrop-filter`. The
              filter cannot survive this element's own entrance: `cover-glass-in`
              animates transform and opacity on .cover-arch, and either one makes
              it a backdrop root, which suppresses the whole pane — no blur and no
              veil — for the animation's full 1.4s. It then snapped back in at the
              end, so the window visibly changed appearance after settling. A
              plain background has no such dependency: it paints identically from
              the first frame to the last. */}
          <div
            style={{
              position: 'absolute',
              left: '22.09%',
              right: '22.17%',
              top: '11.73%',
              bottom: '7.3%',
              borderRadius: '999px 999px 0 0',
              // Bone white rather than the reference's #f3f2f2, which is outside the brand palette.
              background: 'rgba(244, 241, 234, 0.3)',
              pointerEvents: 'none'
            }}
          />

          <svg
            viewBox={VB}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
            <defs>
              <clipPath id="ll-glass">
                <path d={ARCH} />
              </clipPath>
            </defs>

            <path d={CUTOUT} fill={brand.warmStone} fillRule="evenodd" />

            <g clipPath="url(#ll-glass)">
              <g
                className="seat"
                style={{ ['--seat' as string]: 'cover-seat-out', ['--delay' as string]: '1.02s' }}
                fill={brand.navyInk}
                opacity=".55">
                <g transform="translate(117,173)">
                  <use href={`#${LL_GLYPH_ID}`} />
                </g>
              </g>
              <g className="seat" style={{ ['--seat' as string]: 'cover-seat-in', ['--delay' as string]: '.92s' }} fill={brand.navyInk}>
                <use href={`#${LL_GLYPH_ID}`} />
              </g>
            </g>

            <g fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="butt">
              {STROKES.map(s => (
                <path
                  key={s.d}
                  className="draw"
                  pathLength={1}
                  d={s.d}
                  style={{ ['--delay' as string]: s.delay, ['--dur' as string]: s.dur }}
                />
              ))}
            </g>
          </svg>
        </div>

        {/* ── Lockup + kicker ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            flex: 'none',
            display: 'flex',
            flexDirection: 'column',
            width: narrow ? 'min(84vw,420px)' : 'min(38vw,560px)'
          }}>
          <div
            className="cover-lockup"
            style={{ position: 'relative', width: '100%', aspectRatio: `${CROP.w} / ${CROP.h}`, overflow: 'hidden' }}>
            <Image
              src={logoLongNavy}
              alt="Laurel Leaf Design Studio"
              priority
              style={{
                position: 'absolute',
                width: pct(1691 / CROP.w),
                height: 'auto',
                maxWidth: 'none',
                left: `-${pct(CROP.x / CROP.w)}`,
                top: `-${pct(CROP.y / CROP.h)}`
              }}
            />
          </div>

          <div
            className="cover-kicker"
            style={{
              display: 'grid',
              gridTemplateColumns: narrow ? '1fr' : '1fr 1fr',
              gap: narrow ? '14px' : 'clamp(18px,2.4vw,34px)',
              marginTop: 'clamp(18px,3vh,40px)',
              borderTop: '1px solid var(--cover-divider)',
              paddingTop: 'clamp(14px,2vh,20px)',
              fontSize: 12,
              lineHeight: 1.75,
              letterSpacing: '0.14em',
              textTransform: 'uppercase'
            }}>
            <p style={{ margin: 0, ['--delay' as string]: '1s' }}>
              <span style={{ display: 'block', color: brand.boneWhite, fontVariantNumeric: 'tabular-nums' }}>Est. 2020</span>
              Interior renovations
              <br />
              &amp; new builds
            </p>
            <p
              style={{
                margin: 0,
                borderLeft: narrow ? 'none' : '1px solid var(--cover-divider)',
                paddingLeft: narrow ? 0 : 'clamp(18px,2.4vw,34px)',
                ['--delay' as string]: '1.1s'
              }}>
              <span style={{ display: 'block', color: brand.boneWhite }}>Serving</span>
              Augusta, GA · Aiken, SC
              <br />
              &amp; surrounding areas
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="cover-scroll"
          style={{
            position: 'absolute',
            zIndex: 2,
            right: 'clamp(20px,4vw,56px)',
            bottom: 'clamp(40px,7vh,72px)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 18px 10px 20px',
            background: 'none',
            border: '1px solid var(--cover-divider)',
            borderRadius: 999,
            cursor: 'pointer',
            fontSize: 12,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: brand.boneWhite
          }}>
          Scroll
          <span className="cover-nudge" aria-hidden="true" style={{ display: 'inline-block' }}>
            ↓
          </span>
        </button>
      </div>
    </section>
  );
}
