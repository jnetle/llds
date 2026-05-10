import type { Metadata } from 'next';
import AboutPage from './AboutPage';

export const metadata: Metadata = {
  title: 'About — Laurel Leaf Design Studio',
  description:
    'Laurel Leaf Design Studio, founded by Maria Rhinehart in 2020, is an interior design practice based in the Augusta, Georgia and Aiken, South Carolina area.',
  openGraph: {
    title: 'About — Laurel Leaf Design Studio',
    description: 'A measured, intentional approach to the spaces we call home.',
    type: 'website'
  }
};

export default function Page() {
  return <AboutPage />;
}
