'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PROJECTS, formatLocationLong, type Project } from '@/lib/projects';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Grid } from '@/components/ui/Grid';
import { GalleryMasonry } from '@/components/project/GalleryMasonry';
import { GalleryPlates } from '@/components/project/GalleryPlates';
import { HeroBanner } from '@/components/project/HeroBanner';
import { HeroSplit } from '@/components/project/HeroSplit';
import { Section } from '@/components/ui/Section';
import { color, motion } from '@/lib/tokens';

type Props = {
  project: Project;
};

export function ProjectDetail({ project }: Props) {
  // `null` means "showing the project's own hero frame", which is the state the page loads in. It is not the same as
  // index 0: `hero` may name a file that is not in `gallery` at all, and even when it is a plate, nothing in the
  // gallery is *selected* until the reader picks one — so no plate should render as pressed on arrival.
  const [selected, setSelected] = useState<number | null>(null);
  const [opening, setOpening] = useState(true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpening(false));
    return () => cancelAnimationFrame(raf);
  }, []);

  const meta = [`${formatLocationLong(project.location)} · ${project.year}`, project.scope].filter(Boolean).join(' | ');

  // The shoot as the gallery shows it: everything except the frame already standing at the top of the page. `hero`
  // normally names a plate (that is what lets it inherit the plate's alt text and cost no second object on R2), so
  // without this the reader meets the same photograph twice — once as the banner, then again a scroll later as the
  // first tile. The record keeps the whole shoot; this is a rendering decision, and `lib/schema.ts` still publishes
  // every frame. Matched on `src` because that is what identifies a photograph — two records could name one file.
  const galleryImages = project.gallery.filter(image => image.src !== project.hero.src);

  // The authored hero until a plate is promoted over it. `cover` deliberately does not appear here — that frame
  // belongs to the tile on /projects, and picking one has never implied the other. Indices are into `galleryImages`,
  // not the authored array: the gallery is what the reader is clicking, so the two must count the same plates.
  const heroImage = selected === null ? project.hero : galleryImages[selected];

  const idx = PROJECTS.findIndex(p => p.slug === project.slug);
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  return (
    <div
      style={{
        opacity: opening ? 0 : 1,
        transition: `opacity ${motion.durMed} ease`
      }}>
      {/* Top bar. Bespoke gutter to align with the global header — 18px on a phone, 36px above it — and clearance of
          the header's own height plus a beat: it is ~68px on a phone and ~74px above. One row at every width; the
          phone tier drops the next project's title to keep it that way, which is `.project-topbar__*` in
          globals.css. Layout lives there rather than inline, or the media query could not reach it. */}
      <div
        className="project-topbar flex items-center justify-between gap-[16px] px-[18px] pt-[78px] pb-[14px] sm:px-[36px] sm:pt-[110px] sm:pb-[24px]"
        style={{ borderBottom: `1px solid ${color.hairline}` }}>
        <Link href="/projects" className="micro project-topbar__link" style={{ color: 'inherit' }}>
          <span className="project-topbar__arrow" aria-hidden>
            ←
          </span>
          All Projects
        </Link>

        <Link
          href={`/projects/${next.slug}`}
          aria-label={`Next project: ${next.title}`}
          className="micro project-topbar__link"
          style={{ color: 'inherit' }}>
          <span className="project-topbar__label">Next</span>
          <span className="project-topbar__title serif">{next.title}</span>
          <span className="project-topbar__arrow" aria-hidden>
            →
          </span>
        </Link>
      </div>

      {/* Hero. Which layout renders is per-project data, exactly like the gallery below — a landscape opening frame
          wants the full-bleed banner, a portrait one wants the split. This branch stays dumb on purpose: both
          templates take the same props, and each owns the photograph *and* the title block, because the split is
          precisely the arrangement where those two stop being stacked siblings. `components/project/Hero*.tsx`.
          The meta line is built above rather than in either template so they cannot word it differently. */}
      {project.heroTemplate === 'split' ? (
        <HeroSplit image={heroImage} title={project.title} meta={meta} intro={project.intro} opening={opening} />
      ) : (
        <HeroBanner image={heroImage} title={project.title} meta={meta} intro={project.intro} opening={opening} />
      )}

      {/* Gallery. The layout is per-project data, not a decision this component makes — a shoot cut to a few frames
          wants the full-bleed plates, a full one wants the masonry. `components/project/Gallery*.tsx`. */}
      <Section padTop="none" padBottom="sm">
        {/* Empty only for a one-frame shoot whose single plate is the hero — there is genuinely nothing left to show,
            and rendering the template anyway would leave an empty grid above the `Built by` line. */}
        {galleryImages.length > 0 &&
          (project.galleryTemplate === 'masonry' ? (
            // Masonry tiles are inert, so they neither read nor set the hero index — see the note in GalleryMasonry.
            <GalleryMasonry gallery={galleryImages} />
          ) : (
            <GalleryPlates gallery={galleryImages} selected={selected} onSelect={setSelected} title={project.title} />
          ))}
        <Eyebrow opacity={0.6} style={{ marginTop: 24 }}>
          Built by {project.builder}
        </Eyebrow>
      </Section>

      {/* Footer nav between projects. Bespoke gutter, to align with the top bar. Three across at every tier — on a
          phone the outer tracks shrink to the arrows alone and the titles drop out (globals.css `.project-nav__*`),
          so the whole thing is one 44px row instead of three stacked links. Layout and alignment live there rather
          than inline: an inline `display` or `justifySelf` would outrank the phone tier's media query.
          The titles stay in each link's `aria-label`, which is also why it is set at every width — the visible
          `Previous <title>` and the accessible name then say the same thing wherever both exist. */}
      <Grid
        cols={{ d: '1fr 1fr 1fr', t: '1fr 1fr 1fr', m: 'auto 1fr auto' }}
        gap={{ d: 32, t: 28, m: 12 }}
        alignItems="center"
        className="px-[18px] py-[28px] sm:px-[36px] sm:py-[44px] lg:py-[60px]"
        style={{ borderTop: `1px solid ${color.hairline}` }}>
        <Link
          href={`/projects/${prev.slug}`}
          aria-label={`Previous project: ${prev.title}`}
          className="micro project-nav__link project-nav__link--prev"
          style={{ color: 'inherit' }}>
          <span className="project-nav__arrow" aria-hidden>
            ←
          </span>
          <span className="project-nav__stack">
            <span style={{ opacity: 0.5 }}>Previous</span>
            <span className="serif" style={{ fontSize: 18, opacity: 0.95, textTransform: 'none', letterSpacing: 0 }}>
              {prev.title}
            </span>
          </span>
        </Link>
        <Link
          href="/projects"
          className="micro project-nav__link project-nav__link--all"
          style={{ borderBottom: `1px solid ${color.ink}`, paddingBottom: 4, color: 'inherit' }}>
          All Projects
        </Link>
        <Link
          href={`/projects/${next.slug}`}
          aria-label={`Next project: ${next.title}`}
          className="micro project-nav__link project-nav__link--next"
          style={{ color: 'inherit' }}>
          <span className="project-nav__stack">
            <span style={{ opacity: 0.5 }}>Next</span>
            <span className="serif" style={{ fontSize: 18, opacity: 0.95, textTransform: 'none', letterSpacing: 0 }}>
              {next.title}
            </span>
          </span>
          <span className="project-nav__arrow" aria-hidden>
            →
          </span>
        </Link>
      </Grid>
    </div>
  );
}
