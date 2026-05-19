'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StripePaymentForm } from '@/components/payment/StripePaymentForm';
import {
  loadQuote, saveConfirmation, generateConfirmationNumber,
  fmtCAD, FINISH_LABELS, REGION_LABELS, type QuoteData,
} from '@/lib/payment-utils';

function LineItem({ label, value, highlight, negative }: {
  label: string; value: string; highlight?: boolean; negative?: boolean;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${highlight ? 'font-semibold' : ''}`}>
      <span className={`font-body text-body-sm ${highlight ? 'text-brand-white' : 'text-brand-smoke'}`}>{label}</span>
      <span className={`font-body text-body-sm whitespace-nowrap ${negative ? 'text-success' : highlight ? 'text-brand-white' : 'text-brand-white'}`}>{value}</span>
    </div>
  );
}

export default function QuoteCheckoutPage() {
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteData | null>(null);

  useEffect(() => { setQuote(loadQuote()); }, []);

  if (!quote) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brand-jet">
        <div className="text-center">
          <p className="font-display text-display-sm text-brand-white">No quote found</p>
          <p className="mt-2 font-body text-body-md text-brand-smoke">Please complete the estimator first.</p>
          <a href="/quote/estimate" className="mt-6 inline-block rounded-xl bg-brand-red px-6 py-3 font-body text-body-sm font-semibold text-white hover:bg-brand-red-hover">
            Back to Estimator
          </a>
        </div>
      </div>
    );
  }

  const { pricing, vehicle, finish } = quote;
  const deposit = pricing.total * 0.5;

  const handleSuccess = (paymentType: 'full' | 'deposit', customerName: string, customerEmail: string) => {
    const conf = generateConfirmationNumber('WWQ');
    saveConfirmation({
      confirmationNumber: conf,
      type: 'quote',
      paidAmount: paymentType === 'full' ? pricing.total : deposit,
      paymentType,
      customerName,
      customerEmail,
      createdAt: new Date().toISOString(),
      quoteData: quote,
    });
    router.push('/quote/success');
  };

  return (
    <div className="min-h-screen bg-brand-jet pb-24">
      {/* Header */}
      <div className="border-b border-brand-graphite/60 bg-brand-jet-light">
        <div className="section-container py-6">
          <a href="/quote/estimate" className="font-body text-body-sm text-brand-silver hover:text-brand-white transition-colors">
            ← Back to Estimator
          </a>
          <h1 className="mt-3 font-display text-display-md text-brand-white">Confirm & Pay</h1>
          <p className="font-body text-body-md text-brand-smoke">
            {vehicle.year} {vehicle.make} {vehicle.model} · {vehicle.wheelSize} wheels
          </p>
        </div>
      </div>

      <div className="section-container pt-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          {/* Payment form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <StripePaymentForm
              total={pricing.total}
              depositAmount={deposit}
              showDepositOption
              submitLabel="Complete Booking"
              onSuccess={handleSuccess}
            />
          </motion.div>

          {/* Order summary */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <div className="sticky top-28 rounded-3xl border border-brand-graphite bg-brand-graphite shadow-card">
              <div className="border-b border-brand-graphite-light px-6 py-5">
                <p className="font-display text-body-md text-brand-white">Order Summary</p>
              </div>

              <div className="px-6 py-5">
                {/* Service tags */}
                <div className="mb-5 flex flex-wrap gap-2">
                  {[
                    FINISH_LABELS[finish.type] ?? finish.type,
                    vehicle.wheelSize,
                    REGION_LABELS[vehicle.region] ?? vehicle.region,
                  ].map(tag => (
                    <span key={tag} className="rounded-full border border-brand-ash bg-brand-graphite-light px-3 py-1 font-body text-caption text-brand-smoke">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Line items */}
                <div className="flex flex-col gap-3">
                  {pricing.wheels.map((w, i) => (
                    <LineItem key={i} label={w.label} value={fmtCAD(w.base)} />
                  ))}
                  {pricing.sizePremium > 0 && (
                    <LineItem label={`Size premium (${vehicle.wheelSize}) ×${pricing.billableCount}`} value={`+${fmtCAD(pricing.sizePremium)}`} />
                  )}
                  {pricing.finishPremium > 0 && (
                    <LineItem label={`${FINISH_LABELS[finish.type]} premium ×${pricing.billableCount}`} value={`+${fmtCAD(pricing.finishPremium)}`} />
                  )}
                  {pricing.discountAmount > 0 && (
                    <LineItem label="4-wheel discount (10%)" value={`−${fmtCAD(pricing.discountAmount)}`} negative />
                  )}
                  {pricing.regionFee > 0 && (
                    <LineItem label="Region surcharge" value={`+${fmtCAD(pricing.regionFee)}`} />
                  )}
                </div>

                <div className="my-4 border-t border-brand-graphite-light" />

                <div className="flex flex-col gap-2">
                  <LineItem label="Subtotal" value={fmtCAD(pricing.subtotal)} />
                  <LineItem label="GST (5%)" value={fmtCAD(pricing.gst)} />
                </div>

                <div className="mt-4 flex items-baseline justify-between rounded-2xl bg-brand-graphite-light px-5 py-4">
                  <p className="font-display text-body-md text-brand-white">Total</p>
                  <p className="font-display text-display-sm text-brand-white">{fmtCAD(pricing.total)}</p>
                </div>

                {pricing.hasHeavy && (
                  <div className="mt-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
                    <p className="font-body text-caption text-brand-smoke">
                      <strong className="text-warning">Note:</strong> Heavy-damage wheels require technician assessment — included separately after inspection.
                    </p>
                  </div>
                )}
              </div>

              {/* Trust badges */}
              <div className="border-t border-brand-graphite-light px-6 py-4">
                <div className="flex flex-wrap gap-3">
                  {['🔒 Secure checkout', '✓ Lifetime warranty', '📋 ICBC accredited'].map(b => (
                    <span key={b} className="font-body text-caption text-brand-silver">{b}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
