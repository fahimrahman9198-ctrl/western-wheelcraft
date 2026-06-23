import type { Metadata } from 'next';
import Script from 'next/script';
import { FAQSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Wheel Refinishing Estimate',
  robots: { index: false, follow: false },
};

export default function EstimateLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQSchema) }}
      />
      {children}
    </>
  );
}
