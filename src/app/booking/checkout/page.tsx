import Link from 'next/link';

export default function BookingCheckoutPage() {
  return (
    <div className="min-h-screen bg-brand-jet pb-24">
      <div className="border-b border-brand-graphite/60 bg-brand-jet-light">
        <div className="section-container py-6">
          <Link
            href="/booking/wizard"
            className="font-body text-body-sm text-brand-silver hover:text-brand-white transition-colors"
          >
            Back to Booking
          </Link>
          <h1 className="mt-3 font-display text-display-md text-brand-white">Online Payment Pending</h1>
          <p className="font-body text-body-md text-brand-smoke">
            Stripe checkout is not connected yet. Booking requests are saved without collecting payment.
          </p>
        </div>
      </div>

      <div className="section-container pt-10">
        <div className="max-w-2xl rounded-2xl border border-brand-graphite bg-brand-graphite/50 p-6">
          <p className="font-display text-body-md text-brand-white">No card details are collected here.</p>
          <p className="mt-3 font-body text-body-sm text-brand-silver">
            Submit the booking request and Western Wheelcraft will confirm scheduling and payment directly.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/booking/wizard"
              className="rounded-xl bg-brand-red px-5 py-2.5 font-body text-body-sm font-semibold text-white hover:bg-brand-red-hover transition-colors"
            >
              Return to Booking
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-brand-graphite-light px-5 py-2.5 font-body text-body-sm font-semibold text-brand-smoke hover:text-brand-white transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
