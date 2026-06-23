import { fmtCAD } from '@/lib/payment-utils';

interface StripePaymentFormProps {
  total: number;
  depositAmount?: number;
  onSuccess?: (paymentType: 'full' | 'deposit', customerName: string, customerEmail: string) => void;
  submitLabel?: string;
  showDepositOption?: boolean;
}

export function StripePaymentForm({
  total,
  submitLabel = 'Pay Online',
}: StripePaymentFormProps) {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
      <p className="font-display text-body-md text-amber-100">Stripe checkout is not connected yet.</p>
      <p className="mt-2 font-body text-body-sm text-amber-100/80">
        Online card payments are disabled until the production Stripe integration is complete.
      </p>
      <div className="mt-4 rounded-xl border border-brand-ash bg-brand-graphite/60 px-4 py-3">
        <p className="font-body text-caption text-brand-silver">Amount shown for reference</p>
        <p className="font-display text-display-sm text-brand-white">{fmtCAD(total)}</p>
      </div>
      <button
        type="button"
        disabled
        className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-brand-graphite font-display text-body-sm text-brand-silver cursor-not-allowed"
      >
        {submitLabel} unavailable
      </button>
    </div>
  );
}
