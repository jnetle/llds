import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: 'Press — Laurel Leaf Design Studio',
  description: 'Awards, recognition, and published work from Laurel Leaf Design Studio.',
  openGraph: {
    title: 'Press — Laurel Leaf Design Studio',
    description: 'Awards, recognition, and published work.',
    type: 'website'
  }
};

export default function PressLayout({ children }: PropsWithChildren) {
  return children;
}
