import type { ProjectImage } from '@/lib/projects';

/**
 * What every hero template receives. Shared rather than declared per file so the dispatch in `ProjectDetail` type-
 * checks against one contract: a template that quietly wanted an extra prop would make the branch the only place
 * that knows the difference, and the branch is the one thing that must stay dumb.
 *
 * Note what is *not* here: the selected index and its setter. Promoting a plate is the gallery's affordance, and the
 * hero only ever renders whatever image it is handed — so a template never has to care which one it is.
 */
export type ProjectHeroProps = {
  /**
   * The photograph currently promoted to the hero — `gallery[selected]`, resolved by the caller. Only src and alt:
   * every hero template sizes its own box and lets `objectFit: cover` fit the frame to it, so none of them needs
   * the plate's `aspect`. The masonry gallery is still the one place that does.
   */
  image: ProjectImage;
  title: string;
  /** The pre-composed `Place · Year | Scope` line. Built once in `ProjectDetail` so both templates read the same. */
  meta: string;
  /** The lede, one entry per paragraph. */
  intro: string[];
  /** True for the first frame after mount, so the hero can scale out of its opening state with the page fade. */
  opening: boolean;
};
