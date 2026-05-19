'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { loadConfirmation, fmtCAD, REGION_LABELS, FINISH_LABELS, type ConfirmationRecord } from '@/lib/payment-utils';

function Step({ n, label, done }: { n: number; label: string; done?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done ? 'bg-success text-white' : 'bg-brand-graphite-light text-brand-silver'}`}>
        {done ? '✓' : n}
      </div>
      <p className={`pt-0.5 font-body text-body-sm ${done ? 'text-brand-smoke' : 'text-brand-silver'}`}>{label}</p>
    </div>
  );
}

export default function QuoteSuccessPage() {
  const [conf, setConf] = useState<ConfirmationRecord | null>(null);

  useEffect(() => { setConf(loadConfirmation()); }, []);

  if (!conf || conf.type !== 'quote') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brand-jet">
        <div className="text-center">
          <p className="font-display text-display-sm text-brand-white">No confirmation found</p>
          <a href="/" className="mt-6 inline-block rounded-xl bg-brand-red px-6 py-3 font-body text-body-sm font-semibold text-white hover:bg-brand-red-hover">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  const q = conf.quoteData;
  const isDeposit = conf.paymentType === 'deposit';
  const balance   = isDeposit && q ? q.pricing.total - conf.paidAmount : 0;

  return (
    <div className="min-h-screen bg-brand-jet pb-24">
      <div className="section-container pt-16">
        <div className="mx-auto max-w-2xl">
          {/* Success animation */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="mb-8 flex flex-col items-center text-center"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-success"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </div>
            <h1 className="mb-2 font-display text-display-md text-brand-white">Booking Confirmed!</h1>
            <p className="font-body text-body-lg text-brand-smoke">
              {isDeposit
                ? `Your deposit of ${fmtCAD(conf.paidAmount)} has been received.`
                : `Payment of ${fmtCAD(conf.paidAmount)} processed successfully.`}
            </p>
          </motion.div>

          {/* Confirmation card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 overflow-hidden rounded-3xl border border-brand-graphite bg-brand-graphite shadow-card"
          >
            <div className="border-b border-brand-graphite-light bg-brand-graphite-light px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="font-body text-caption uppercase tracking-widest text-brand-red font-semibold">Confirmation</p>
                <p className="font-mono text-body-sm font-bold text-brand-white">{conf.confirmationNumber}</p>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-body text-caption text-brand-silver">Customer</p>
                  <p className="font-display text-body-md text-brand-white">{conf.customerName}</p>
                  <p className="font-body text-body-sm text-brand-smoke">{conf.customerEmail}</p>
                </div>
                <div>
                  <p className="font-body text-caption text-brand-silver">Booked</p>
                  <p className="font-display text-body-md text-brand-white">
                    {new Date(conf.createdAt).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                {q && (
                  <>
                    <div>
                      <p className="font-body text-caption text-brand-silver">Vehicle</p>
                      <p className="font-display text-body-md text-brand-white">
                        {q.vehicle.year} {q.vehicle.make} {q.vehicle.model}
                      </p>
                      <p className="font-body text-body-sm text-brand-smoke">{q.vehicle.wheelSize} · {FINISH_LABELS[q.finish.type]}</p>
                    </div>
                    <div>
                      <p className="font-body text-caption text-brand-silver">Service Region</p>
                      <p className="font-display text-body-md text-brand-white">{REGION_LABELS[q.vehicle.region]}</p>
                    </div>
                  </>
                )}
              </div>

              {isDeposit && balance > 0 && (
                <div className="mt-5 rounded-2xl border border-warning/30 bg-warning/10 px-5 py-4">
                  <p className="font-display text-body-sm text-brand-white">Balance due at service: {fmtCAD(balance)}</p>
                  <p className="mt-1 font-body text-caption text-brand-smoke">
                    Payable by card or e-transfer on the day of service.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Next steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-6 rounded-3xl border border-brand-graphite bg-brand-graphite p-6 shadow-card"
          >
            <p className="mb-5 font-display text-body-md text-brand-white">What Happens Next</p>
            <div className="flex flex-col gap-4">
              <Step n={1} label="Confirmation email sent to your inbox with all details." done />
              <Step n={2} label="Our team will contact you within 2 hours to confirm your appointment time." />
              <Step n={3} label="Drop off your wheels or vehicle (or our fleet comes to you)." />
              <Step n={4} label="Pick up your refinished wheels — looking factory-new or better." />
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <a
              href={`data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:Western Wheelcraft Appointment%0ADTSTART:${new Date(conf.createdAt).toISOString().replace(/[-:]/g, '').split('.')[0]}Z%0AEND:VEVENT%0AEND:VCALENDAR`}
              download="appointment.ics"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-brand-ash bg-brand-graphite py-3.5 font-body text-body-sm font-semibold text-brand-white hover:border-brand-red hover:text-brand-red transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              Add to Calendar
            </a>
            <a
              href="tel:+16047106174"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-brand-ash bg-brand-graphite py-3.5 font-body text-body-sm font-semibold text-brand-white hover:border-brand-red hover:text-brand-red transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.41 2 2 0 013.6 1.22h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.8a16 16 0 006.29 6.29l.96-.96a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
              </svg>
              Call 604.710.6174
            </a>
            <a
              href="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-red py-3.5 font-body text-body-sm font-semibold text-white hover:bg-brand-red-hover transition-colors"
            >
              Return Home
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
