import { notFound } from 'next/navigation';
import { PROJECTS } from '@/lib/projects';
import { ProjectDetail } from '@/components/ProjectDetail';

export function generateStaticParams() {
  return PROJECTS.map(p => ({ slug: p.id }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = PROJECTS.find(p => p.id === slug);
  if (!project) notFound();
  return <ProjectDetail key={project.id} project={project} />;
}
