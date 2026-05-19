'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { loadConfirmation, fmtCAD, REGION_LABELS, type ConfirmationRecord } from '@/lib/payment-utils';

export default function BookingSuccessPage() {
  const [conf, setConf] = useState<ConfirmationRecord | null>(null);

  useEffect(() => { setConf(loadConfirmation()); }, []);

  if (!conf || conf.type !== 'booking') {
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

  const b = conf.bookingData!;
  const isDeposit = conf.paymentType === 'deposit';
  const balance   = isDeposit ? b.estimatedTotal - conf.paidAmount : 0;
  const dateFormatted = b.date
    ? new Date(b.date + 'T00:00:00').toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-brand-jet pb-24">
      <div className="section-container pt-16">
        <div className="mx-auto max-w-2xl">
          {/* Success check */}
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
            <h1 className="mb-2 font-display text-display-md text-brand-white">Appointment Booked!</h1>
            <p className="font-body text-body-lg text-brand-smoke">
              {isDeposit
                ? `Deposit of ${fmtCAD(conf.paidAmount)} received.`
                : `Payment of ${fmtCAD(conf.paidAmount)} confirmed.`}
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
                  <p className="font-body text-caption text-brand-silver">Date & Time</p>
                  <p className="font-display text-body-md text-brand-white">{dateFormatted}</p>
                  <p className="font-body text-body-sm text-brand-smoke">{b.time}</p>
                </div>
                <div>
                  <p className="font-body text-caption text-brand-silver">Service</p>
                  <p className="font-display text-body-md text-brand-white">
                    {b.serviceType === 'shop' ? 'Shop Drop-Off' : 'Mobile Fleet'}
                  </p>
                  {b.serviceType === 'mobile' && (
                    <p className="font-body text-body-sm text-brand-smoke">{REGION_LABELS[b.region]}</p>
                  )}
                </div>
                <div>
                  <p className="font-body text-caption text-brand-silver">Vehicle</p>
                  <p className="font-display text-body-md text-brand-white">{b.vehicle}</p>
                </div>
              </div>

              {isDeposit && balance > 0 && (
                <div className="mt-5 rounded-2xl border border-warning/30 bg-warning/10 px-5 py-4">
                  <p className="font-display text-body-sm text-brand-white">Balance due at service: {fmtCAD(balance)}</p>
                  <p className="mt-1 font-body text-caption text-brand-smoke">Payable by card or e-transfer.</p>
                </div>
              )}

              {b.serviceType === 'shop' && (
                <div className="mt-5 rounded-2xl border border-brand-graphite-light bg-brand-graphite-light px-5 py-4">
                  <p className="font-display text-body-sm text-brand-white">Drop-Off Address</p>
                  <p className="mt-1 font-body text-body-sm text-brand-smoke">3756 Napier St, Burnaby BC V5C 3E5</p>
                  <p className="font-body text-caption text-brand-silver">Mon–Fri 8am–5pm · Sat 9am–2pm</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <a
              href={`https://maps.google.com/?q=3756+Napier+St+Burnaby+BC`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-brand-ash bg-brand-graphite py-3.5 font-body text-body-sm font-semibold text-brand-white hover:border-brand-red hover:text-brand-red transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.75" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.75" />
              </svg>
              Get Directions
            </a>
            <a
              href="tel:+16047106174"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-brand-ash bg-brand-graphite py-3.5 font-body text-body-sm font-semibold text-brand-white hover:border-brand-red hover:text-brand-red transition-colors"
            >
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
