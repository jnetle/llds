import type { Metadata } from 'next';
import { ProjectsGrid } from '@/components/ProjectsGrid';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/schema';
import { pageOpenGraph } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Selected residential interior design projects by Laurel Leaf Design Studio across Augusta, Georgia and Aiken, South Carolina.',
  alternates: { canonical: '/projects' },
  openGraph: pageOpenGraph({
    title: 'Projects — Laurel Leaf Design Studio',
    description: 'Selected residential interior design projects across the Augusta and Aiken region.',
    path: '/projects'
  })
};

export default function ProjectsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([['Projects', '/projects']])} />
      <ProjectsGrid />
    </>
  );
}
