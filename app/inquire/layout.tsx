import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: 'Inquire — Laurel Leaf Design Studio',
  description:
    'Begin a conversation with Laurel Leaf Design Studio. Share your project scope, timeline, and priorities so we can determine the best way to work together.',
  openGraph: {
    title: 'Inquire — Laurel Leaf Design Studio',
    description: 'Begin a conversation about your project.',
    type: 'website'
  }
};

export default function InquireLayout({ children }: PropsWithChildren) {
  return children;
}
