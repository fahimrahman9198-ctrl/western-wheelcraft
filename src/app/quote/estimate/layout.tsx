import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wheel Refinishing Estimate',
  robots: { index: false, follow: false },
};

export default function EstimateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
