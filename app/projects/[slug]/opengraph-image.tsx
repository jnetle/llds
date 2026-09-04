import { ImageResponse } from 'next/og';
import { OG_CONTENT_TYPE, OG_SIZE, OgCard, ogFonts } from '@/lib/og';
import { PROJECTS, getProject } from '@/lib/projects';

// Without this the route is rendered on demand, so the first social crawler pays a cold start — and crawlers time out.
export function generateStaticParams() {
  return PROJECTS.map(p => ({ slug: p.id }));
}

/**
 /** A module-level `export const alt` would give all fifteen cards one generic string; this varies it per slug. */
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
 /**
  * A typographic card per project. Once real photography lands (`assetsReady` in lib/projects.ts) this could render
  * the cover photo — but only then: a card showing stock over a real project's name would misrepresent the work.
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
