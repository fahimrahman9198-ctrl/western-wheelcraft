'use client';

import { useState } from 'react';
import { Eye, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { InvoicePreviewModal } from './InvoicePreviewModal';
import type { AdminInvoice, CompanyInfo } from '@/lib/admin-types';

interface InvoiceCardClientProps {
  invoice: AdminInvoice;
  company: CompanyInfo;
}

function money(value: string | null): string {
  if (!value) return '$0';
  return Number(value).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
}

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function customerLine(invoice: AdminInvoice): string {
  const email = invoice.customer?.email;
  return email ? email : 'No email on file';
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-brand-ash/30 text-brand-smoke border border-brand-ash/40',
  unpaid: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  paid: 'bg-green-500/15 text-green-400 border border-green-500/30',
  overdue: 'bg-brand-red/15 text-brand-red border border-brand-red/30',
  void: 'bg-brand-ash/20 text-brand-silver border border-brand-ash/30',
};

export function InvoiceCardClient({ invoice, company }: InvoiceCardClientProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const succeededPayments = invoice.payments?.filter((payment) => payment.status === 'succeeded') || [];
  const paymentTotal = succeededPayments.reduce((sum: number, payment) => sum + Number(payment.amount || 0), 0);

  const handleMarkAsPaid = async () => {
    setIsMarkingPaid(true);
    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          status: 'paid',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as paid');
      }

      toast.success('Invoice marked as paid');
      // Trigger page refresh
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to mark as paid');
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/admin/invoices/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend invoice');
      }

      toast.success('Invoice sent to customer');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend invoice');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <article className="rounded-xl border border-brand-ash bg-brand-graphite p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-mono text-body-md text-brand-white">{invoice.invoiceNumber}</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-caption font-medium ${STATUS_STYLES[invoice.status]}`}>
                {statusLabel(invoice.status)}
              </span>
              {invoice.quote?.quoteNumber && (
                <span className="rounded-full border border-brand-ash bg-brand-graphite-light px-2.5 py-0.5 text-caption text-brand-smoke">
                  Quote {invoice.quote.quoteNumber}
                </span>
              )}
            </div>
            <p className="mt-1 text-body-sm text-brand-white">{invoice.customer?.name}</p>
            <p className="font-mono text-caption text-brand-smoke">{customerLine(invoice)}</p>
          </div>

          <div className="text-left lg:text-right">
            <p className="font-display text-display-sm text-brand-white">{money(invoice.total)}</p>
            <p className="text-caption text-brand-smoke">
              Paid {paymentTotal.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}
            </p>
          </div>
        </div>

        {/* Line items preview */}
        <div className="mt-4 max-h-40 overflow-hidden rounded-lg border border-brand-ash">
          <div className="bg-brand-graphite-light/30 px-3 py-2">
            <table className="w-full text-body-xs">
              <thead>
                <tr className="border-b border-brand-ash">
                  <th className="text-left px-2 py-1 text-brand-silver">Description</th>
                  <th className="text-right px-2 py-1 text-brand-silver">Qty</th>
                  <th className="text-right px-2 py-1 text-brand-silver">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems?.slice(0, 4).map((item) => (
                  <tr key={item.id} className="border-b border-brand-ash/50 last:border-0">
                    <td className="px-3 py-2 text-brand-smoke">{item.description}</td>
                    <td className="px-3 py-2 text-right font-mono text-brand-smoke">{Number(item.quantity)}</td>
                    <td className="px-3 py-2 text-right font-mono text-brand-white">{money(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-brand-ash bg-brand-graphite-light/40 hover:bg-brand-graphite-light px-3 py-2 text-caption text-brand-smoke hover:text-brand-white transition-colors"
          >
            <Eye size={13} />
            Preview & Download
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="flex items-center gap-1.5 rounded-lg border border-brand-ash bg-brand-graphite-light/40 hover:bg-brand-graphite-light px-3 py-2 text-caption text-brand-smoke hover:text-brand-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Lock size={13} />
                Resend
              </>
            )}
          </button>

          {invoice.status !== 'paid' && (
            <button
              type="button"
              onClick={handleMarkAsPaid}
              disabled={isMarkingPaid}
              className="flex items-center gap-1.5 rounded-lg border border-brand-ash bg-brand-graphite-light/40 hover:bg-green-500/20 hover:border-green-500/30 px-3 py-2 text-caption text-brand-smoke hover:text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMarkingPaid ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle size={13} />
                  Mark Paid
                </>
              )}
            </button>
          )}
        </div>
      </article>

      {/* Preview Modal */}
      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        invoice={invoice}
        company={company}
      />
    </>
  );
}
