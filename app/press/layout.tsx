import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { pageOpenGraph } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Press',
  description: 'Recognition, collaboration, and published work from Laurel Leaf Design Studio.',
  alternates: { canonical: '/press' },
  openGraph: pageOpenGraph({
    title: 'Press — Laurel Leaf Design Studio',
    description: 'Recognition, collaboration, and published work.',
    path: '/press'
  })
};

export default function PressLayout({ children }: PropsWithChildren) {
  return children;
}
