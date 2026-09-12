import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { brand } from '@/lib/tokens';

/** TEMPORARY — the query parameter that switches the badges on: `?files=1`, or a bare `?files`. */
const FLAG = 'files';

// TEMPORARY — the flag as an external store. Module scope so the three functions keep stable identities across
// renders, which is what `useSyncExternalStore` needs to avoid resubscribing on every pass.
const subscribeToFlag = (onChange: () => void) => {
  // Only back/forward changes the query without remounting this component; Next's own navigations push a new URL and
  // rebuild the tree, which re-reads the snapshot anyway.
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
};
const readFlag = () => {
  const value = new URLSearchParams(window.location.search).get(FLAG);
  return value !== null && value !== '0' && value !== 'false';
};
/** Off on the server, always — there is no URL to read there, and the HTML must match the first client render. */
const flagOffOnServer = () => false;

/**
 * TEMPORARY — stamps a photograph with its file name so a shoot can be reviewed by name ("drop 6664", "move this
 * up") against the live page. The name is selectable, and the button beside it copies it to the clipboard.
 *
 * **Off unless the URL asks for it.** Add `?files=1` to any project page to switch every badge on; without it this
 * renders nothing, so the aid can sit in the tree through a deploy without a visitor ever meeting it. The flag is
 * read from `window.location` rather than `useSearchParams` on purpose: every detail page is statically prerendered,
 * and a static page that calls `useSearchParams` from a Client Component fails the production build unless each call
 * site is wrapped in a Suspense boundary (`use-search-params.md` in the Next docs). Reading it here keeps the whole
 * feature inside this file and leaves the route's rendering strategy untouched — no Suspense, no dynamic opt-out.
 * The cost is that badges appear on hydration rather than in the HTML, which is invisible: they are positioned
 * absolutely, so nothing moves when they arrive.
 *
 * It sits on the masonry tiles and on the hero of both detail-page templates — the banner is a frame like any other
 * and gets discussed the same way, and since the gallery no longer repeats it there is nowhere else to read its name
 * off the page. Positioned absolutely, so every call site must be inside a positioned wrapper; all four already are.
 *
 * Not part of the design. To remove it: delete this file and its four call sites (`MasonryTile` in GalleryMasonry,
 * and the hero wrapper in HeroBanner and HeroSplit). Nothing else changes.
 */
export function FileBadge({ src, placement = 'bottom' }: { src: string; placement?: 'bottom' | 'top' }) {
  const file = src.split('/').pop() ?? src;
  // Not `useState` + `useEffect`: setting state straight out of an effect is a cascading render, and the lint rule
  // says so. This is exactly what `useSyncExternalStore` is for — a value that lives outside React, is read rather
  // than owned, and has a different answer on the server than in the browser.
  const enabled = useSyncExternalStore(subscribeToFlag, readFlag, flagOffOnServer);
  const [copied, setCopied] = useState(false);

  // The timer is cleared on unmount, and on a second click before the first has elapsed — otherwise a stale timeout
  // would flip the icon back while the newer copy is still being acknowledged.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(file);
    } catch {
      // Clipboard access can be refused (an insecure origin, or a denied permission). The name stays selectable, so
      // failing silently still leaves a way to copy it by hand.
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1400);
  };

  // Below every hook above, deliberately: an early return placed higher would make the hook order conditional.
  if (!enabled) return null;

  return (
    <span
      style={{
        position: 'absolute',
        left: 8,
        // A masonry tile is small enough that its foot is on screen whenever the tile is, so the badge sits out of
        // the way at the bottom. A hero is not: it runs to the fold or past it, so a badge at its foot is never seen
        // beside the photograph it names — which is the whole use. `top` puts it in view with the frame. It clears
        // the fixed header at every tier because the hero starts below the detail page's own top bar.
        ...(placement === 'top' ? { top: 8 } : { bottom: 8 }),
        zIndex: 2,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        maxWidth: 'calc(100% - 16px)',
        padding: '4px 4px 4px 7px',
        background: brand.navyInk,
        color: brand.boneWhite,
        font: '500 11px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace',
        letterSpacing: '0.02em'
      }}>
      <span
        style={{
          // Filenames are long and the columns are narrow on a phone; wrapping keeps the whole name readable, which
          // truncating it would defeat.
          overflowWrap: 'anywhere',
          userSelect: 'text',
          cursor: 'text'
        }}>
        {file}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? `Copied ${file}` : `Copy ${file}`}
        title={copied ? 'Copied' : 'Copy file name'}
        style={{
          flex: 'none',
          display: 'inline-flex',
          padding: 3,
          border: 'none',
          borderRadius: 2,
          background: 'none',
          color: 'inherit',
          cursor: 'pointer',
          opacity: copied ? 1 : 0.75
        }}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </span>
  );
}

/** TEMPORARY — goes with FileBadge. */
function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="5.75" y="5.75" width="8.5" height="8.5" rx="1.5" />
      <path d="M10.5 3.75A1.75 1.75 0 0 0 8.75 2h-5A1.75 1.75 0 0 0 2 3.75v5c0 .966.784 1.75 1.75 1.75" />
    </svg>
  );
}

/** TEMPORARY — goes with FileBadge. */
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M3 8.5 6.25 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
