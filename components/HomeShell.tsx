'use client';

import { useState } from 'react';
import { PROJECTS, type Project } from '@/lib/projects';
import { HeroGrid } from './HeroGrid';
import { StatementSection } from './StatementSection';
import { ProjectStrip } from './ProjectStrip';
import { ProjectOverlay } from './ProjectOverlay';

export function HomeShell() {
  const [openProject, setOpenProject] = useState<Project | null>(null);

  return (
    <>
      <HeroGrid projects={PROJECTS} onOpen={setOpenProject} />
      <StatementSection />
      <ProjectStrip projects={PROJECTS} onOpen={setOpenProject} />
      <ProjectOverlay key={openProject?.id ?? 'closed'} project={openProject} onClose={() => setOpenProject(null)} />
    </>
  );
}
