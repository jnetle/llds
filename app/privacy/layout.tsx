import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { pageOpenGraph } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What the Laurel Leaf Design Studio website collects, which services handle it, and how to opt out — including the cookies set by analytics.',
  alternates: { canonical: '/privacy' },
  openGraph: pageOpenGraph({
    title: 'Privacy — Laurel Leaf Design Studio',
    description: 'What this site collects, who handles it, and how to opt out.',
    path: '/privacy'
  })
};

export default function PrivacyLayout({ children }: PropsWithChildren) {
  return children;
}
