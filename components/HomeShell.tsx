'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useScrollTopOnLoad } from '@/hooks/useScrollTopOnLoad';
import { PROJECTS, type Project } from '@/lib/projects';
import { CoverPanel } from './CoverPanel';
import { HeroGrid } from './HeroGrid';
import { StatementSection } from './StatementSection';
import { ProjectStrip } from './ProjectStrip';
import { TestimonialsGrid } from './testimonials/TestimonialsGrid';

/**
 * The cover panel belongs to arriving at the site, not to the home route. Module scope draws that line: the binding
 * outlives client-side navigation, so returning from /projects skips the panel while a hard reload gets a fresh one.
 *
 * Only ever written from the browser — the server's copy is per-process, so mutating it during render would leak one
 * visitor's splash state to the next.
 */
let coverSeen = false;

export function HomeShell() {
  const router = useRouter();
  const openProject = (p: Project) => router.push(`/projects/${p.id}`);

  // An arrival has to arrive at the top: the panel is absolutely positioned at document 0, so a restored scroll
  // offset would mount it already half gone, and an offset past a viewport trips the dismissal on the first frame.
  // A layout effect is early enough — every layout effect runs before any passive one, and CoverPanel's dismissal
  // check is passive.
  useScrollTopOnLoad();

  // Server and first client render agree, so hydration matches; a client-side navigation has no server pass and
  // already omits the panel, so there is no flash of a splash about to be removed.
  const [showCover, setShowCover] = useState(!coverSeen);

  // On mount, not on dismissal — leaving mid-splash still counts as having seen it.
  useEffect(() => {
    coverSeen = true;
  }, []);

  const stageRef = useRef<HTMLDivElement>(null);
  const heightBefore = useRef(0);

  // Dropping the panel drops the scroll room it rode up through, which would yank everything up by a viewport.
  // Measure first, correct after: the lead is pinned across this range, so the frames either side of the swap match.
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
      <TestimonialsGrid />
    </>
  );
}
