'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StripePaymentForm } from '@/components/payment/StripePaymentForm';
import {
  loadBooking, saveConfirmation, generateConfirmationNumber,
  fmtCAD, REGION_LABELS, type BookingData,
} from '@/lib/payment-utils';

export default function BookingCheckoutPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);

  useEffect(() => { setBooking(loadBooking()); }, []);

  if (!booking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brand-jet">
        <div className="text-center">
          <p className="font-display text-display-sm text-brand-white">No booking found</p>
          <p className="mt-2 font-body text-body-md text-brand-smoke">Please complete the booking wizard first.</p>
          <a href="/booking/wizard" className="mt-6 inline-block rounded-xl bg-brand-red px-6 py-3 font-body text-body-sm font-semibold text-white hover:bg-brand-red-hover">
            Start Booking
          </a>
        </div>
      </div>
    );
  }

  const isMobile    = booking.serviceType === 'mobile';
  const depositAmt  = booking.estimatedTotal * 0.5;

  const handleSuccess = (paymentType: 'full' | 'deposit', customerName: string, customerEmail: string) => {
    const conf = generateConfirmationNumber('WWB');
    saveConfirmation({
      confirmationNumber: conf,
      type: 'booking',
      paidAmount: paymentType === 'full' ? booking.estimatedTotal : depositAmt,
      paymentType,
      customerName,
      customerEmail,
      createdAt: new Date().toISOString(),
      bookingData: booking,
    });
    router.push('/booking/success');
  };

  const dateFormatted = booking.date
    ? new Date(booking.date + 'T00:00:00').toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-brand-jet pb-24">
      <div className="border-b border-brand-graphite/60 bg-brand-jet-light">
        <div className="section-container py-6">
          <a href="/booking/wizard" className="font-body text-body-sm text-brand-silver hover:text-brand-white transition-colors">
            ← Back to Booking
          </a>
          <h1 className="mt-3 font-display text-display-md text-brand-white">Complete Your Booking</h1>
          <p className="font-body text-body-md text-brand-smoke">
            {booking.serviceType === 'shop' ? 'Shop Drop-Off' : 'Mobile Fleet Service'}
          </p>
        </div>
      </div>

      <div className="section-container pt-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <StripePaymentForm
              total={booking.estimatedTotal}
              depositAmount={depositAmt}
              showDepositOption={isMobile}
              submitLabel="Confirm Appointment"
              onSuccess={handleSuccess}
            />
          </motion.div>

          {/* Booking summary */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <div className="sticky top-28 rounded-3xl border border-brand-graphite bg-brand-graphite shadow-card">
              <div className="border-b border-brand-graphite-light px-6 py-5">
                <p className="font-display text-body-md text-brand-white">Appointment Summary</p>
              </div>

              <div className="px-6 py-5">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="font-body text-caption text-brand-silver">Service</p>
                    <p className="font-display text-body-md text-brand-white">
                      {booking.serviceType === 'shop' ? 'Shop Drop-Off — Burnaby' : 'Mobile Fleet Service'}
                    </p>
                    {isMobile && (
                      <p className="font-body text-body-sm text-brand-smoke">{REGION_LABELS[booking.region]}</p>
                    )}
                  </div>
                  <div>
                    <p className="font-body text-caption text-brand-silver">Date & Time</p>
                    <p className="font-display text-body-md text-brand-white">{dateFormatted}</p>
                    <p className="font-body text-body-sm text-brand-smoke">{booking.time}</p>
                  </div>
                  <div>
                    <p className="font-body text-caption text-brand-silver">Vehicle</p>
                    <p className="font-display text-body-md text-brand-white">{booking.vehicle}</p>
                  </div>
                  {booking.notes && (
                    <div>
                      <p className="font-body text-caption text-brand-silver">Notes</p>
                      <p className="font-body text-body-sm text-brand-smoke">{booking.notes}</p>
                    </div>
                  )}
                </div>

                <div className="my-5 border-t border-brand-graphite-light" />

                <div className="flex items-baseline justify-between">
                  <p className="font-body text-body-sm text-brand-smoke">Estimated Total</p>
                  <p className="font-display text-display-sm text-brand-white">{fmtCAD(booking.estimatedTotal)}</p>
                </div>

                {isMobile && (
                  <p className="mt-2 font-body text-caption text-brand-silver">
                    Deposit required for mobile bookings. Balance due at service.
                  </p>
                )}

                {!isMobile && (
                  <p className="mt-2 font-body text-caption text-brand-silver">
                    Pay in full now or bring payment to the shop.
                  </p>
                )}
              </div>

              <div className="border-t border-brand-graphite-light px-6 py-4">
                <div className="flex items-center gap-2 font-body text-caption text-brand-silver">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
                  </svg>
                  Lifetime workmanship warranty on all work
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
