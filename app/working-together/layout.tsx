import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { pageOpenGraph } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Working Together',
  description:
    'How a Laurel Leaf project runs — communication, meetings, response times, site visits, revisions, and keeping the build on schedule.',
  alternates: { canonical: '/working-together' },
  openGraph: pageOpenGraph({
    title: 'Working Together — Laurel Leaf Design Studio',
    description: 'A clear and structured approach, aligned between client, builder, and design.',
    path: '/working-together'
  })
};

export default function WorkingTogetherLayout({ children }: PropsWithChildren) {
  return children;
}
