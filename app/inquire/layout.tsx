import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { pageOpenGraph } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Inquire',
  description:
    'Begin a conversation with Laurel Leaf Design Studio. Share your project scope, timeline, and priorities so we can determine the best way to work together.',
  alternates: { canonical: '/inquire' },
  openGraph: pageOpenGraph({
    title: 'Inquire — Laurel Leaf Design Studio',
    description: 'Begin a conversation about your project.',
    path: '/inquire'
  })
};

export default function InquireLayout({ children }: PropsWithChildren) {
  return children;
}
