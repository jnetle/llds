import { ImageResponse } from 'next/og';
import { OG_CONTENT_TYPE, OG_SIZE, OgCard, ogFonts } from '@/lib/og';
import { PROJECTS, getProject } from '@/lib/projects';

// Without this the route is server-rendered on demand, so the first social crawler to
// request a card pays a cold start — and crawlers time out. The page beside it already
// declares the same params.
export function generateStaticParams() {
  return PROJECTS.map(p => ({ slug: p.id }));
}

/**
 * A module-level `export const alt` is static, so all fifteen cards would share one
 * generic string. `generateImageMetadata` is the supported way to vary it per slug — it
 * feeds both `og:image:alt` and `twitter:image:alt`.
 */
export async function generateImageMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  return [
    {
      id: 'card',
      size,
      contentType,
      alt: project ? `${project.title}, ${project.location} — Laurel Leaf Design Studio` : 'Laurel Leaf Design Studio'
    }
  ];
}

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * A typographic card per project, built from the facts the data already has.
 *
 * Once real photography lands (see `assetsReady` in lib/projects.ts) this could render
 * the cover photograph instead — but only then: a share card showing an Unsplash stock
 * interior over a real project's name would misrepresent the work.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);

  return new ImageResponse(
    <OgCard
      eyebrow={project ? `${project.location} · ${project.year}` : 'Projects'}
      title={project?.title ?? 'Laurel Leaf Design Studio'}
    />,
    { ...size, fonts: await ogFonts() }
  );
}
