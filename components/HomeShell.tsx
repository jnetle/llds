'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { PROJECTS, type Project } from '@/lib/projects';
import { CoverPanel } from './CoverPanel';
import { HeroGrid } from './HeroGrid';
import { StatementSection } from './StatementSection';
import { ProjectStrip } from './ProjectStrip';

/**
 * The cover panel is a splash: it belongs to arriving at the site, not to the
 * home route. Module scope is what makes that distinction — this binding
 * outlives every client-side navigation, so leaving for /projects and coming
 * back reads `true` and the panel never mounts again, while a hard reload gets
 * a fresh module and a fresh splash. That is the intended line: a reload is an
 * arrival, a logo click is not.
 *
 * Only ever written from the browser. The server's copy of this module is
 * per-process and shared across requests, so mutating it during render would
 * leak one visitor's splash state to the next.
 */
let coverSeen = false;

export function HomeShell() {
  const router = useRouter();
  const openProject = (p: Project) => router.push(`/projects/${p.id}`);

  // Server and first client render agree: on a full page load `coverSeen` is
  // false in both, so hydration matches. On a client-side navigation there is
  // no server pass at all and this first render already omits the panel — no
  // flash of a splash that is about to be removed.
  const [showCover, setShowCover] = useState(!coverSeen);

  // On mount, not on dismissal: someone who clicks a nav link while the splash
  // is still on screen has still seen it, and shouldn't get it again on return.
  useEffect(() => {
    coverSeen = true;
  }, []);

  const stageRef = useRef<HTMLDivElement>(null);
  const heightBefore = useRef(0);

  // Dropping the panel also drops the scroll room it rode up through, which
  // would yank everything below it up by a viewport. Measure first, correct
  // after: the lead is pinned across this whole range, so once scroll is moved
  // by the same delta the frames either side of the swap are identical.
  const dismissCover = useCallback(() => {
    heightBefore.current = stageRef.current?.offsetHeight ?? 0;
    setShowCover(false);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (showCover || !heightBefore.current) return;
    const delta = heightBefore.current - (stageRef.current?.offsetHeight ?? 0);
    heightBefore.current = 0;
    if (delta > 0) window.scrollTo(0, Math.max(0, window.scrollY - delta));
  }, [showCover]);

  return (
    <>
      {/* The reveal comes from relative motion, not from an animation. The cover
          panel is absolutely positioned at document 0 and rides up with the
          page; `pinnedLead` holds HeroGrid's first row still underneath it, so
          the panel slides off a stationary hero instead of the two scrolling
          away together. The panel paints no background of its own, so that same
          row is what shows through the arch — putting different content behind
          it later means changing what the pinned row is, not the panel.

          The panel is absolute, so this wrapper's height *is* the lead stage —
          which is what makes it the thing to measure across the swap. */}
      <div ref={stageRef} style={{ position: 'relative' }}>
        {showCover && <CoverPanel onDismiss={dismissCover} />}
        <HeroGrid projects={PROJECTS} onOpen={openProject} pinnedLead coverStage={showCover} interlude={<StatementSection />} />
      </div>
      <ProjectStrip projects={PROJECTS} onOpen={openProject} />
    </>
  );
}
