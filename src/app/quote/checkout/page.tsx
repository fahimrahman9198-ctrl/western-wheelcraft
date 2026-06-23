import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function QuoteCheckoutPage() {
  return (
    <div className="min-h-screen bg-brand-jet pb-24">
      <div className="border-b border-brand-graphite/60 bg-brand-jet-light">
        <div className="section-container py-6">
          <Link
            href="/quote/estimate"
            className="font-body text-body-sm text-brand-silver hover:text-brand-white transition-colors"
          >
            Back to Estimator
          </Link>
          <h1 className="mt-3 font-display text-display-md text-brand-white">Quote Submitted</h1>
          <p className="font-body text-body-md text-brand-smoke">
            Your quote request has been received and saved. Our team will review your details and confirm final pricing.
          </p>
        </div>
      </div>

      <div className="section-container pt-10">
        <div className="max-w-2xl rounded-2xl border border-brand-graphite bg-brand-graphite/50 p-6">
          <p className="font-display text-body-md text-brand-white">What happens next?</p>
          <p className="mt-3 font-body text-body-sm text-brand-silver">
            You should receive a confirmation email shortly. Our team will review your quote and contact you to discuss final pricing and payment options.
          </p>
          <p className="mt-4 font-body text-body-sm text-brand-smoke">
            No payment is due at this time. We'll reach out within 24 hours with a final quote.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/quote/estimate"
              className="rounded-xl bg-brand-red px-5 py-2.5 font-body text-body-sm font-semibold text-white hover:bg-brand-red-hover transition-colors"
            >
              Return to Quote
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
