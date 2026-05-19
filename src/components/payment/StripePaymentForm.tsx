'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  detectBrand, formatCardNumber, formatExpiry, validateExpiry,
  processDemoPayment, type CardBrand,
} from '@/lib/stripe-demo';
import { fmtCAD } from '@/lib/payment-utils';

// ── Schema ────────────────────────────────────────────────────────────────────

const customerSchema = z.object({
  name:       z.string().min(2, 'Full name required'),
  email:      z.string().email('Valid email required'),
  phone:      z.string().min(10, 'Phone number required'),
  address:    z.string().min(5, 'Address required'),
  city:       z.string().min(2, 'City required'),
  postalCode: z.string()
    .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, 'Valid Canadian postal code required'),
});

type CustomerFields = z.infer<typeof customerSchema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface StripePaymentFormProps {
  total: number;
  depositAmount?: number;
  onSuccess: (paymentType: 'full' | 'deposit', customerName: string, customerEmail: string) => void;
  submitLabel?: string;
  showDepositOption?: boolean;
}

// ── Card brand icons ──────────────────────────────────────────────────────────

function CardBrandIcon({ brand }: { brand: CardBrand }) {
  if (brand === 'visa') return (
    <svg viewBox="0 0 48 16" width="38" height="13" aria-label="Visa">
      <text x="0" y="13" fontFamily="Arial Black, sans-serif" fontSize="14" fontWeight="900" fill="#1A1F71">VISA</text>
    </svg>
  );
  if (brand === 'mastercard') return (
    <svg viewBox="0 0 38 24" width="34" height="22" aria-label="Mastercard">
      <circle cx="14" cy="12" r="12" fill="#EB001B" />
      <circle cx="24" cy="12" r="12" fill="#F79E1B" />
      <path d="M19 6.8a12 12 0 010 10.4A12 12 0 0119 6.8z" fill="#FF5F00" />
    </svg>
  );
  if (brand === 'amex') return (
    <svg viewBox="0 0 48 16" width="38" height="13" aria-label="American Express">
      <text x="0" y="13" fontFamily="Arial Black, sans-serif" fontSize="11" fontWeight="900" fill="#2E77BC">AMEX</text>
    </svg>
  );
  return (
    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="23" height="15" rx="1.5" stroke="#3A3A42" />
      <rect x="0" y="5" width="24" height="4" fill="#3A3A42" />
    </svg>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-body-sm font-semibold text-brand-white">{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="font-body text-caption text-brand-red"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls = (err?: string) => cn(
  'w-full rounded-xl border bg-brand-graphite px-4 py-3 font-body text-body-sm text-brand-white placeholder-brand-silver transition-colors duration-200 focus:outline-none focus:ring-1',
  err
    ? 'border-brand-red focus:border-brand-red focus:ring-brand-red'
    : 'border-brand-ash focus:border-brand-red focus:ring-brand-red'
);

// ── Main component ────────────────────────────────────────────────────────────

export function StripePaymentForm({
  total, depositAmount, onSuccess,
  submitLabel = 'Complete Booking',
  showDepositOption = true,
}: StripePaymentFormProps) {
  const [paymentType, setPaymentType] = useState<'full' | 'deposit'>('full');
  const [cardNumber, setCardNumber]   = useState('');
  const [expiry, setExpiry]           = useState('');
  const [cvc, setCvc]                 = useState('');
  const [cardName, setCardName]       = useState('');
  const [cardErrors, setCardErrors]   = useState<Record<string, string>>({});
  const [processing, setProcessing]   = useState(false);
  const [payError, setPayError]       = useState('');
  const brand = detectBrand(cardNumber);

  const chargeAmount = paymentType === 'deposit' && depositAmount ? depositAmount : total;

  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFields>({
    resolver: zodResolver(customerSchema),
  });

  const validateCard = (): boolean => {
    const errs: Record<string, string> = {};
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.length < 15) errs.number = 'Enter a valid card number';
    const expiryErr = validateExpiry(expiry);
    if (expiryErr) errs.expiry = expiryErr;
    if (cvc.length < 3) errs.cvc = 'CVC required';
    if (!cardName.trim()) errs.name = 'Name on card required';
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (customer: CustomerFields) => {
    if (!validateCard()) return;
    setPayError('');
    setProcessing(true);
    const result = await processDemoPayment(cardNumber, chargeAmount);
    setProcessing(false);
    if (result.success) {
      onSuccess(paymentType, customer.name, customer.email);
    } else {
      setPayError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
      {/* Payment type toggle */}
      {showDepositOption && depositAmount && (
        <div>
          <p className="mb-3 font-display text-body-md text-brand-white">Payment Option</p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'full',    label: 'Pay Full Amount', amount: total },
              { value: 'deposit', label: '50% Deposit',     amount: depositAmount },
            ] as const).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPaymentType(opt.value)}
                className={cn(
                  'flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200',
                  paymentType === opt.value
                    ? 'border-brand-red bg-brand-red/10 shadow-red-glow/20'
                    : 'border-brand-ash bg-brand-graphite hover:border-brand-ash'
                )}
              >
                <div className={cn(
                  'mb-2 flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors',
                  paymentType === opt.value ? 'border-brand-red bg-brand-red' : 'border-brand-ash'
                )}>
                  {paymentType === opt.value && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <p className="font-display text-body-sm text-brand-white">{opt.label}</p>
                <p className="font-display text-display-sm text-brand-white">{fmtCAD(opt.amount)}</p>
                {opt.value === 'deposit' && (
                  <p className="mt-1 font-body text-caption text-brand-silver">Balance due at service</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Customer info */}
      <div>
        <p className="mb-4 font-display text-body-md text-brand-white">Contact Information</p>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" error={errors.name?.message}>
              <input {...register('name')} placeholder="Jane Smith" className={inputCls(errors.name?.message)} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input {...register('email')} type="email" placeholder="jane@example.com" className={inputCls(errors.email?.message)} />
            </Field>
          </div>
          <Field label="Phone" error={errors.phone?.message}>
            <input {...register('phone')} type="tel" placeholder="604-555-0100" className={inputCls(errors.phone?.message)} />
          </Field>
          <Field label="Street Address" error={errors.address?.message}>
            <input {...register('address')} placeholder="123 Main St" className={inputCls(errors.address?.message)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City" error={errors.city?.message}>
              <input {...register('city')} placeholder="Vancouver" className={inputCls(errors.city?.message)} />
            </Field>
            <Field label="Postal Code" error={errors.postalCode?.message}>
              <input {...register('postalCode')} placeholder="V6B 1A1" className={inputCls(errors.postalCode?.message)} />
            </Field>
          </div>
        </div>
      </div>

      {/* Card input — Stripe-style */}
      <div>
        <p className="mb-4 font-display text-body-md text-brand-white">Payment Details</p>
        <div className="overflow-hidden rounded-2xl border border-brand-ash bg-brand-graphite">
          {/* Card number */}
          <div className="relative border-b border-brand-graphite-light">
            <input
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              autoComplete="cc-number"
              inputMode="numeric"
              className={cn(
                'w-full bg-transparent px-4 py-3.5 font-mono text-body-md text-brand-white placeholder-brand-silver focus:outline-none',
                cardErrors.number && 'text-brand-red'
              )}
            />
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <CardBrandIcon brand={brand} />
            </div>
          </div>

          {/* Expiry + CVC */}
          <div className="grid grid-cols-2 divide-x divide-brand-graphite-light">
            <input
              value={expiry}
              onChange={e => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM / YY"
              maxLength={7}
              autoComplete="cc-exp"
              inputMode="numeric"
              className={cn(
                'bg-transparent px-4 py-3.5 font-mono text-body-md text-brand-white placeholder-brand-silver focus:outline-none',
                cardErrors.expiry && 'text-brand-red'
              )}
            />
            <input
              value={cvc}
              onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, brand === 'amex' ? 4 : 3))}
              placeholder={brand === 'amex' ? 'XXXX' : 'CVC'}
              maxLength={brand === 'amex' ? 4 : 3}
              autoComplete="cc-csc"
              inputMode="numeric"
              className={cn(
                'bg-transparent px-4 py-3.5 font-mono text-body-md text-brand-white placeholder-brand-silver focus:outline-none',
                cardErrors.cvc && 'text-brand-red'
              )}
            />
          </div>

          {/* Name on card */}
          <div className="border-t border-brand-graphite-light">
            <input
              value={cardName}
              onChange={e => setCardName(e.target.value)}
              placeholder="Name on card"
              autoComplete="cc-name"
              className={cn(
                'w-full bg-transparent px-4 py-3.5 font-body text-body-md text-brand-white placeholder-brand-silver focus:outline-none',
                cardErrors.name && 'text-brand-red'
              )}
            />
          </div>
        </div>

        {/* Card field errors */}
        <AnimatePresence>
          {Object.values(cardErrors).filter(Boolean).slice(0, 1).map(err => (
            <motion.p
              key={err}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 font-body text-caption text-brand-red"
            >
              {err}
            </motion.p>
          ))}
        </AnimatePresence>

        {/* Test cards hint */}
        <div className="mt-3 rounded-xl bg-brand-graphite-light px-4 py-3">
          <p className="font-body text-caption text-brand-silver">
            <strong className="text-brand-smoke">Demo mode</strong> ·{' '}
            Success: <code className="font-mono text-success">4242 4242 4242 4242</code> ·{' '}
            Decline: <code className="font-mono text-brand-red">4000 0000 0000 0002</code>
          </p>
        </div>
      </div>

      {/* Security badges */}
      <div className="flex flex-wrap items-center gap-4">
        {[
          { icon: '🔒', label: 'SSL Encrypted' },
          { icon: '🛡️', label: 'PCI DSS Compliant' },
          { icon: '✓',  label: '3D Secure' },
        ].map(b => (
          <div key={b.label} className="flex items-center gap-1.5 font-body text-caption text-brand-silver">
            <span>{b.icon}</span>
            <span>{b.label}</span>
          </div>
        ))}
      </div>

      {/* Payment error */}
      <AnimatePresence>
        {payError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-2xl border border-brand-red/30 bg-brand-red/10 p-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-brand-red" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            <div>
              <p className="font-display text-body-sm text-brand-white">Payment Declined</p>
              <p className="font-body text-caption text-brand-smoke">{payError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        type="submit"
        disabled={processing}
        className={cn(
          'relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl font-display text-body-md text-brand-white transition-all duration-300',
          processing
            ? 'bg-brand-graphite cursor-not-allowed'
            : 'bg-brand-red hover:bg-brand-red-hover hover:shadow-red-glow hover:-translate-y-0.5 active:translate-y-0'
        )}
      >
        {processing ? (
          <>
            <motion.div
              className="h-5 w-5 rounded-full border-2 border-brand-smoke/30 border-t-brand-smoke"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span className="text-brand-smoke">Processing payment…</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
              <path d="M1 10h22" stroke="currentColor" strokeWidth="1.75" />
            </svg>
            {submitLabel} · {fmtCAD(chargeAmount)}
          </>
        )}
      </button>
    </form>
  );
}
