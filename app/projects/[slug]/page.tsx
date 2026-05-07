import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROJECTS } from '@/lib/projects';
import { ProjectDetail } from '@/components/ProjectDetail';

export function generateStaticParams() {
  return PROJECTS.map(p => ({ slug: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find(p => p.id === slug);
  if (!project) return {};
  return {
    title: `${project.title} — Laurel Leaf Design Studio`,
    description: project.intro
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = PROJECTS.find(p => p.id === slug);
  if (!project) notFound();
  return <ProjectDetail key={project.id} project={project} />;
}
