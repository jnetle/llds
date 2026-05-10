import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: 'Services — Laurel Leaf Design Studio',
  description:
    'A considered, full-service interior design practice — from planning and design direction through selections, documentation, and installation.',
  openGraph: {
    title: 'Services — Laurel Leaf Design Studio',
    description: 'A considered, full-service interior design practice.',
    type: 'website'
  }
};

export default function ServicesLayout({ children }: PropsWithChildren) {
  return children;
}
