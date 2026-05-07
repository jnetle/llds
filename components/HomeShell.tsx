'use client';

import { useRouter } from 'next/navigation';
import { PROJECTS, type Project } from '@/lib/projects';
import { HeroGrid } from './HeroGrid';
import { StatementSection } from './StatementSection';
import { ProjectStrip } from './ProjectStrip';

export function HomeShell() {
  const router = useRouter();
  const openProject = (p: Project) => router.push(`/projects/${p.id}`);

  return (
    <>
      <HeroGrid projects={PROJECTS} onOpen={openProject} />
      <StatementSection />
      <ProjectStrip projects={PROJECTS} onOpen={openProject} />
    </>
  );
}
