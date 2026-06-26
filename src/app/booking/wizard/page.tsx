'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Hours: Mon–Sat 9am–5pm (last start 4pm), Sun 12pm–4:30pm (last start 4pm).
const SLOTS_WEEKDAY = ['9:00 AM','10:00 AM','11:00 AM','1:00 PM','2:00 PM','3:00 PM','4:00 PM'];
const SLOTS_SUNDAY = ['12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM'];

function slotsForDate(dateStr: string): string[] {
  if (!dateStr) return SLOTS_WEEKDAY;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).getDay() === 0 ? SLOTS_SUNDAY : SLOTS_WEEKDAY;
}

function to24(label: string): string {
  const m = label.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!m) return label;
  let h = Number(m[1]);
  if (m[3].toUpperCase() === 'PM' && h < 12) h += 12;
  if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}

const MOBILE_REGIONS = [
  { value: 'vi',       label: 'Vancouver Island', fee: 60 },
  { value: 'interior', label: 'Okanagan & Interior BC', fee: 80 },
  { value: 'lm-mobile',label: 'Lower Mainland — Mobile', fee: 40 },
];

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function maxDate() {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().split('T')[0];
}

export default function BookingWizardPage() {
  const router = useRouter();
  const [serviceType, setServiceType]   = useState<'shop' | 'mobile'>('shop');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate]                 = useState('');
  const [time, setTime]                 = useState('');
  const [vehicle, setVehicle]           = useState('');
  const [region, setRegion]             = useState('vi');
  const [notes, setNotes]               = useState('');
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [takenSlots, setTakenSlots] = useState<Set<string>>(new Set());

  // Load already-booked times whenever the date changes, to prevent double-booking.
  useEffect(() => {
    if (!date) { setTakenSlots(new Set()); return; }
    let active = true;
    fetch(`/api/bookings/availability?date=${date}`)
      .then((r) => (r.ok ? r.json() : { taken: [] }))
      .then((d: { taken?: string[] }) => { if (active) setTakenSlots(new Set(d.taken ?? [])); })
      .catch(() => { if (active) setTakenSlots(new Set()); });
    return () => { active = false; };
  }, [date]);

  const slots = slotsForDate(date);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!customerName.trim()) e.customerName = 'Please enter your name';
    if (!customerEmail.trim()) e.customerEmail = 'Please enter your email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) e.customerEmail = 'Please enter a valid email';
    if (!customerPhone.trim()) e.customerPhone = 'Please enter your phone number';
    else if (customerPhone.replace(/\D/g, '').length < 10) e.customerPhone = 'Please enter a 10-digit phone number';
    if (!date)    e.date    = 'Please select a date';
    if (!time)    e.time    = 'Please select a time';
    if (!vehicle) e.vehicle = 'Please enter your vehicle';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const proceed = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');

    const fee = serviceType === 'mobile'
      ? MOBILE_REGIONS.find(r => r.value === region)?.fee ?? 40
      : 0;

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          serviceType,
          scheduledDate: date,
          startTime: time,
          vehicleDescription: vehicle,
          region: serviceType === 'mobile' ? region : 'lm-shop',
          notes: notes || undefined,
          estimatedTotal: 350 + fee,
        }),
      });

      if (response.status === 409) {
        const data = await response.json().catch(() => ({}));
        setTakenSlots((prev) => new Set(prev).add(to24(time)));
        setTime('');
        setSubmitting(false);
        setSubmitError(data?.error || 'That time slot was just booked. Please pick another time.');
        return;
      }

      if (!response.ok) {
        throw new Error('Unable to save booking request.');
      }

      const result = await response.json() as { bookingNumber: string };
      router.push(`/booking/success?booking=${encodeURIComponent(result.bookingNumber)}`);
    } catch {
      setSubmitting(false);
      setSubmitError('We could not save your booking request. Please try again or call us directly.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-jet pb-24">
      <div className="border-b border-brand-graphite/60 bg-brand-jet-light">
        <div className="section-container py-6">
          <a href="/booking" className="font-body text-body-sm text-brand-silver hover:text-brand-white transition-colors">
            ← Back to Booking
          </a>
          <h1 className="mt-3 font-display text-display-md text-brand-white">Book Your Appointment</h1>
        </div>
      </div>

      <div className="section-container pt-10">
        <div className="mx-auto max-w-xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-7">
            {/* Contact */}
            <div>
              <p className="mb-3 font-display text-body-md text-brand-white">Your Details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="font-body text-body-sm font-semibold text-brand-white">Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => { setCustomerName(e.target.value); setErrors(s => ({ ...s, customerName: '' })); }}
                    placeholder="Jane Smith"
                    className="mt-1.5 w-full rounded-xl border border-brand-ash bg-brand-graphite px-4 py-3 font-body text-body-sm text-brand-white placeholder-brand-silver focus:border-brand-red focus:outline-none"
                  />
                  {errors.customerName && <p className="mt-1 font-body text-caption text-brand-red">{errors.customerName}</p>}
                </div>
                <div>
                  <label className="font-body text-body-sm font-semibold text-brand-white">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => { setCustomerEmail(e.target.value); setErrors(s => ({ ...s, customerEmail: '' })); }}
                    placeholder="jane@example.com"
                    className="mt-1.5 w-full rounded-xl border border-brand-ash bg-brand-graphite px-4 py-3 font-body text-body-sm text-brand-white placeholder-brand-silver focus:border-brand-red focus:outline-none"
                  />
                  {errors.customerEmail && <p className="mt-1 font-body text-caption text-brand-red">{errors.customerEmail}</p>}
                </div>
                <div>
                  <label className="font-body text-body-sm font-semibold text-brand-white">Phone</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => { setCustomerPhone(e.target.value); setErrors(s => ({ ...s, customerPhone: '' })); }}
                    placeholder="604.555.1234"
                    className="mt-1.5 w-full rounded-xl border border-brand-ash bg-brand-graphite px-4 py-3 font-body text-body-sm text-brand-white placeholder-brand-silver focus:border-brand-red focus:outline-none"
                  />
                  {errors.customerPhone && <p className="mt-1 font-body text-caption text-brand-red">{errors.customerPhone}</p>}
                </div>
              </div>
            </div>

            {/* Service type */}
            <div>
              <p className="mb-3 font-display text-body-md text-brand-white">Service Type</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'shop',   label: 'Shop Drop-Off', sub: 'Burnaby, Lower Mainland' },
                  { value: 'mobile', label: 'Mobile Fleet',  sub: 'Island & Interior BC' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setServiceType(opt.value)}
                    className={cn(
                      'flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200',
                      serviceType === opt.value
                        ? 'border-brand-red bg-brand-red/10'
                        : 'border-brand-ash bg-brand-graphite hover:border-brand-ash/80'
                    )}
                  >
                    <div className={cn(
                      'mb-2 flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors',
                      serviceType === opt.value ? 'border-brand-red bg-brand-red' : 'border-brand-ash'
                    )}>
                      {serviceType === opt.value && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <p className="font-display text-body-sm text-brand-white">{opt.label}</p>
                    <p className="font-body text-caption text-brand-silver">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile region selector */}
            <AnimatePresence>
              {serviceType === 'mobile' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="font-body text-body-sm font-semibold text-brand-white">Your Region</label>
                    <select
                      value={region}
                      onChange={e => setRegion(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-brand-ash bg-brand-graphite px-4 py-3 font-body text-body-sm text-brand-white focus:border-brand-red focus:outline-none"
                    >
                      {MOBILE_REGIONS.map(r => (
                        <option key={r.value} value={r.value}>
                          {r.label} (+${r.fee} surcharge)
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-body-sm font-semibold text-brand-white">Preferred Date</label>
              <input
                type="date"
                value={date}
                min={tomorrow()}
                max={maxDate()}
                onChange={e => { setDate(e.target.value); setTime(''); setErrors(s => ({ ...s, date: '' })); }}
                className="w-full rounded-xl border border-brand-ash bg-brand-graphite px-4 py-3 font-body text-body-sm text-brand-white focus:border-brand-red focus:outline-none [color-scheme:dark]"
              />
              {errors.date && <p className="font-body text-caption text-brand-red">{errors.date}</p>}
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-body-sm font-semibold text-brand-white">Preferred Time</label>
              <div className="grid grid-cols-4 gap-2">
                {slots.map(t => {
                  const booked = takenSlots.has(to24(t));
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={booked}
                      onClick={() => { if (booked) return; setTime(t); setErrors(s => ({ ...s, time: '' })); }}
                      className={cn(
                        'rounded-xl border py-2.5 font-body text-caption transition-all duration-200',
                        booked
                          ? 'cursor-not-allowed border-brand-ash/40 bg-brand-graphite/40 text-brand-silver/50 line-through'
                          : time === t
                            ? 'border-brand-red bg-brand-red/10 text-white'
                            : 'border-brand-ash bg-brand-graphite text-brand-smoke hover:border-brand-ash/80 hover:text-brand-white'
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              {!date && <p className="font-body text-caption text-brand-silver">Pick a date to see available times.</p>}
              {errors.time && <p className="font-body text-caption text-brand-red">{errors.time}</p>}
            </div>

            {/* Vehicle */}
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-body-sm font-semibold text-brand-white">Vehicle</label>
              <input
                type="text"
                value={vehicle}
                onChange={e => { setVehicle(e.target.value); setErrors(s => ({ ...s, vehicle: '' })); }}
                placeholder="e.g. 2021 BMW M3 — 19&quot; wheels"
                className="w-full rounded-xl border border-brand-ash bg-brand-graphite px-4 py-3 font-body text-body-sm text-brand-white placeholder-brand-silver focus:border-brand-red focus:outline-none"
              />
              {errors.vehicle && <p className="font-body text-caption text-brand-red">{errors.vehicle}</p>}
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-body-sm font-semibold text-brand-white">
                Additional Notes <span className="font-normal text-brand-silver">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Describe the damage, special requests, or any other details..."
                rows={3}
                className="w-full resize-none rounded-xl border border-brand-ash bg-brand-graphite px-4 py-3 font-body text-body-sm text-brand-white placeholder-brand-silver focus:border-brand-red focus:outline-none"
              />
            </div>

            <button
              onClick={proceed}
              disabled={submitting}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-red font-display text-body-md text-white hover:bg-brand-red-hover hover:shadow-red-glow transition-all duration-300"
            >
              {submitting ? 'Saving Request…' : 'Request Booking'}
              {!submitting && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            {submitError && (
              <p className="rounded-lg border border-brand-red/30 bg-brand-red/10 px-3 py-2 text-center font-body text-body-sm text-brand-red">
                {submitError}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
