import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROJECTS, getProject } from '@/lib/projects';
import { ProjectDetail } from '@/components/ProjectDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema, projectSchema } from '@/lib/schema';
import { pageOpenGraph } from '@/lib/seo';

export function generateStaticParams() {
  return PROJECTS.map(p => ({ slug: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const url = `/projects/${project.id}`;

  return {
    // Bare title — app/layout.tsx's template appends the studio name.
    title: `${project.title}, ${project.location}`,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: pageOpenGraph({
      title: `${project.title} — Laurel Leaf Design Studio`,
      description: project.summary,
      path: url,
      type: 'article',
      // The sibling opengraph-image.tsx is this segment's own card.
      hasOwnImage: true
    })
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <>
      <JsonLd
        data={[
          projectSchema(project),
          breadcrumbSchema([
            ['Projects', '/projects'],
            [project.title, `/projects/${project.id}`]
          ])
        ]}
      />
      <ProjectDetail key={project.id} project={project} />
    </>
  );
}
