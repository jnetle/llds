import type { Metadata } from 'next';
import { ProjectsGrid } from '@/components/ProjectsGrid';

export const metadata: Metadata = {
  title: 'Projects — Laurel Leaf Design Studio',
  description: 'Selected interior projects by Laurel Leaf Design Studio.'
};

export default function ProjectsPage() {
  return <ProjectsGrid />;
}
