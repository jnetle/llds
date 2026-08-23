import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { pageOpenGraph } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'A considered, full-service interior design practice — from planning and design direction through selections, documentation, and installation.',
  alternates: { canonical: '/services' },
  openGraph: pageOpenGraph({
    title: 'Services — Laurel Leaf Design Studio',
    description: 'A considered, full-service interior design practice.',
    path: '/services'
  })
};

export default function ServicesLayout({ children }: PropsWithChildren) {
  return children;
}
