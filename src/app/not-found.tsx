import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
};

function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.41 2 2 0 013.6 1.22h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.8a16 16 0 006.29 6.29l.96-.96a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

export default function NotFound() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-brand-jet py-24">
      <div className="section-container text-center">
        <p className="mb-3 font-display text-display-sm text-brand-red">404</p>
        <h1 className="mb-4 font-display text-display-md md:text-display-lg text-brand-white">
          Page Not Found
        </h1>
        <p className="mx-auto mb-10 max-w-md font-body text-body-lg text-brand-smoke">
          That page doesn&rsquo;t exist — but if you&rsquo;re here about wheel repair or refinishing, we can still help.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button href="/services" variant="primary" size="lg" rightIcon={<IconArrowRight />}>
            View Our Services
          </Button>
          <Button href="/quote/estimate" variant="secondary" size="lg">
            Get a Free Quote
          </Button>
          <Button href="tel:+16047106174" variant="outline" size="lg" leftIcon={<IconPhone />}>
            604.710.6174
          </Button>
        </div>
      </div>
    </section>
  );
}
