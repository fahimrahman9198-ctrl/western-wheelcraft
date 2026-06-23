import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Your Appointment',
  robots: { index: false, follow: false },
};

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
