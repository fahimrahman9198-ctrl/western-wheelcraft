import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface BookingSuccessPageProps {
  searchParams: Promise<{
    booking?: string;
  }>;
}

export default async function BookingSuccessPage({ searchParams }: BookingSuccessPageProps) {
  const { booking } = await searchParams;

  if (!booking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brand-jet">
        <div className="text-center">
          <p className="font-display text-display-sm text-brand-white">No booking request found</p>
          <Link href="/booking/wizard" className="mt-6 inline-block rounded-xl bg-brand-red px-6 py-3 font-body text-body-sm font-semibold text-white hover:bg-brand-red-hover">
            Start Booking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-jet pb-24">
      <div className="section-container pt-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h1 className="mb-2 font-display text-display-md text-brand-white">Booking Request Received</h1>
            <p className="font-body text-body-lg text-brand-smoke">
              We saved your appointment request. Our team will review availability and follow up.
            </p>
          </div>

          <div className="mb-6 overflow-hidden rounded-3xl border border-brand-ash bg-brand-graphite shadow-card">
            <div className="border-b border-brand-graphite-light bg-brand-graphite-light px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="font-body text-caption uppercase tracking-widest text-brand-red font-semibold">Request Number</p>
                <p className="font-mono text-body-sm font-bold text-brand-white">{booking}</p>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-2xl border border-warning/30 bg-warning/10 px-5 py-4">
                <p className="font-display text-body-sm text-brand-white">Payment is not collected yet</p>
                <p className="mt-1 font-body text-caption text-brand-smoke">
                  Stripe deposits will be enabled in a later production phase. This request is stored in the admin dashboard now.
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-brand-graphite-light bg-brand-graphite-light px-5 py-4">
                <p className="font-display text-body-sm text-brand-white">Shop Drop-Off Address</p>
                <p className="mt-1 font-body text-body-sm text-brand-smoke">3756 Napier St, Burnaby BC V5C 3E5</p>
                <p className="font-body text-caption text-brand-silver">Mon–Sat 9am–5pm · Sun 12–4:30pm</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="https://maps.google.com/?q=3756+Napier+St+Burnaby+BC"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-brand-ash bg-brand-graphite py-3.5 font-body text-body-sm font-semibold text-brand-white hover:border-brand-red hover:text-brand-red transition-colors"
            >
              Get Directions
            </a>
            <a
              href="tel:+16047106174"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-brand-ash bg-brand-graphite py-3.5 font-body text-body-sm font-semibold text-brand-white hover:border-brand-red hover:text-brand-red transition-colors"
            >
              Call 604.710.6174
            </a>
            <Link
              href="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-red py-3.5 font-body text-body-sm font-semibold text-white hover:bg-brand-red-hover transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
