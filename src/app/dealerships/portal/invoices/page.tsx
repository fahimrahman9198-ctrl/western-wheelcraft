'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  saveConfirmation, generateConfirmationNumber, fmtCAD,
} from '@/lib/payment-utils';
import { processDemoPayment } from '@/lib/stripe-demo';
import { StripePaymentForm } from '@/components/payment/StripePaymentForm';
import { cn } from '@/lib/utils';

// ── Mock invoice data ─────────────────────────────────────────────────────────

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  description: string;
  wheels: number;
  amount: number;
  status: 'outstanding' | 'overdue' | 'paid';
}

const MOCK_INVOICES: Invoice[] = [
  { id: '1', number: 'INV-2026-0142', date: '2026-04-15', dueDate: '2026-05-15', description: 'Fleet refinishing — 12 wheels (4× BMW M5, 4× Porsche Cayenne, 4× Audi Q8)', wheels: 12, amount: 4_320.00, status: 'outstanding' },
  { id: '2', number: 'INV-2026-0138', date: '2026-04-01', dueDate: '2026-05-01', description: 'OEM colour match — 4 wheels (Mercedes-Benz GLE)', wheels: 4,  amount: 1_512.75, status: 'overdue' },
  { id: '3', number: 'INV-2026-0131', date: '2026-03-22', dueDate: '2026-04-21', description: 'Diamond cut refinishing — 4 wheels (Range Rover)', wheels: 4,  amount: 1_890.00, status: 'paid' },
  { id: '4', number: 'INV-2026-0129', date: '2026-03-15', dueDate: '2026-04-14', description: 'Powder coat — 8 wheels (fleet vehicles)', wheels: 8,  amount: 2_100.00, status: 'paid' },
];

export default function DealershipInvoicesPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showPayment, setShowPayment] = useState(false);
  const [paid, setPaid] = useState<Set<string>>(new Set(['3', '4']));

  const outstanding = MOCK_INVOICES.filter(i => !paid.has(i.id));
  const paidInvoices = MOCK_INVOICES.filter(i => paid.has(i.id));
  const selectedInvoices = outstanding.filter(i => selected.has(i.id));
  const payTotal = selectedInvoices.reduce((s, i) => s + i.amount, 0);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const ids = outstanding.map(i => i.id);
    setSelected(prev => prev.size === ids.length ? new Set() : new Set(ids));
  };

  const handleSuccess = (_pt: 'full' | 'deposit', customerName: string, customerEmail: string) => {
    const conf = generateConfirmationNumber('WWI');
    saveConfirmation({
      confirmationNumber: conf,
      type: 'invoice',
      paidAmount: payTotal,
      paymentType: 'full',
      customerName,
      customerEmail,
      createdAt: new Date().toISOString(),
    });
    setPaid(prev => new Set([...prev, ...selected]));
    setSelected(new Set());
    setShowPayment(false);
  };

  const statusPill = (status: Invoice['status'], id: string) => {
    if (paid.has(id)) return (
      <span className="rounded-full bg-success/15 px-2.5 py-1 font-body text-caption font-semibold text-success">Paid</span>
    );
    return status === 'overdue'
      ? <span className="rounded-full bg-brand-red/15 px-2.5 py-1 font-body text-caption font-semibold text-brand-red">Overdue</span>
      : <span className="rounded-full bg-warning/15 px-2.5 py-1 font-body text-caption font-semibold text-warning">Outstanding</span>;
  };

  return (
    <div className="min-h-screen bg-brand-jet pb-24">
      {/* Header */}
      <div className="border-b border-brand-graphite/60 bg-brand-jet-light">
        <div className="section-container py-6">
          <a href="/dealerships" className="font-body text-body-sm text-brand-silver hover:text-brand-white transition-colors">
            ← Dealership Portal
          </a>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-display-md text-brand-white">Invoice Portal</h1>
              <p className="font-body text-body-md text-brand-smoke">Ferrari Maserati Vancouver · Trade Account</p>
            </div>
            <div className="text-right">
              <p className="font-body text-caption text-brand-silver">Payment Terms</p>
              <p className="font-display text-body-md text-brand-white">NET 30</p>
            </div>
          </div>

          {/* Account summary strip */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: 'Outstanding', value: fmtCAD(outstanding.reduce((s, i) => s + i.amount, 0)), color: 'text-warning' },
              { label: 'Overdue',     value: fmtCAD(outstanding.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)), color: 'text-brand-red' },
              { label: 'Paid YTD',   value: fmtCAD(paidInvoices.reduce((s, i) => s + i.amount, 0)), color: 'text-success' },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl border border-brand-graphite bg-brand-graphite px-4 py-3 text-center">
                <p className={`font-display text-display-sm ${stat.color}`}>{stat.value}</p>
                <p className="font-body text-caption text-brand-silver">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-container pt-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Invoice list */}
          <div>
            {/* Toolbar */}
            {outstanding.length > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={selectAll}
                  className="font-body text-body-sm text-brand-silver hover:text-brand-white transition-colors"
                >
                  {selected.size === outstanding.length ? 'Deselect all' : 'Select all outstanding'}
                </button>
                {selected.size > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setShowPayment(true)}
                    className="rounded-xl bg-brand-red px-5 py-2.5 font-body text-body-sm font-semibold text-white hover:bg-brand-red-hover transition-colors"
                  >
                    Pay {selected.size} invoice{selected.size !== 1 ? 's' : ''} · {fmtCAD(payTotal)}
                  </motion.button>
                )}
              </div>
            )}

            {/* Outstanding invoices */}
            {outstanding.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 font-body text-body-sm font-semibold uppercase tracking-widest text-brand-silver">Outstanding</p>
                <div className="flex flex-col gap-3">
                  {outstanding.map(invoice => (
                    <motion.div
                      key={invoice.id}
                      layout
                      onClick={() => toggleSelect(invoice.id)}
                      className={cn(
                        'cursor-pointer rounded-2xl border p-5 transition-all duration-200',
                        selected.has(invoice.id)
                          ? 'border-brand-red bg-brand-red/8'
                          : 'border-brand-graphite bg-brand-graphite hover:border-brand-ash'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div className={cn(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                          selected.has(invoice.id)
                            ? 'border-brand-red bg-brand-red'
                            : 'border-brand-ash bg-transparent'
                        )}>
                          {selected.has(invoice.id) && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="mb-1 flex items-center gap-2">
                              <p className="font-mono text-body-sm font-bold text-brand-white">{invoice.number}</p>
                              {statusPill(invoice.status, invoice.id)}
                            </div>
                            <p className="font-body text-body-sm text-brand-smoke">{invoice.description}</p>
                            <p className="mt-1 font-body text-caption text-brand-silver">
                              Issued {new Date(invoice.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })} ·
                              Due {new Date(invoice.dueDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-display text-display-sm text-brand-white">{fmtCAD(invoice.amount)}</p>
                            <p className="font-body text-caption text-brand-silver">{invoice.wheels} wheels</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {outstanding.length === 0 && (
              <div className="flex flex-col items-center gap-4 rounded-3xl border border-brand-graphite bg-brand-graphite py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-display text-body-md text-brand-white">All caught up!</p>
                  <p className="font-body text-body-sm text-brand-silver">No outstanding invoices.</p>
                </div>
              </div>
            )}

            {/* Paid invoices */}
            {paidInvoices.length > 0 && (
              <div>
                <p className="mb-3 font-body text-body-sm font-semibold uppercase tracking-widest text-brand-silver">Paid</p>
                <div className="flex flex-col gap-2">
                  {paidInvoices.map(invoice => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between rounded-2xl border border-brand-graphite bg-brand-graphite/50 px-5 py-4 opacity-70"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-body-sm text-brand-smoke">{invoice.number}</p>
                          {statusPill(invoice.status, invoice.id)}
                        </div>
                        <p className="font-body text-caption text-brand-silver">{invoice.description.split('—')[0]}</p>
                      </div>
                      <p className="font-display text-body-md text-brand-smoke">{fmtCAD(invoice.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment panel — sticky */}
          <div>
            <div className="sticky top-8">
              <AnimatePresence mode="wait">
                {showPayment ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="rounded-3xl border border-brand-graphite bg-brand-graphite p-6 shadow-card"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <p className="font-display text-body-md text-brand-white">Payment</p>
                      <button
                        onClick={() => setShowPayment(false)}
                        className="font-body text-body-sm text-brand-silver hover:text-brand-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="mb-5 rounded-2xl bg-brand-graphite-light px-5 py-4">
                      <p className="font-body text-body-sm text-brand-smoke">{selectedInvoices.length} invoice{selectedInvoices.length !== 1 ? 's' : ''}</p>
                      <p className="font-display text-display-sm text-brand-white">{fmtCAD(payTotal)}</p>
                    </div>
                    <StripePaymentForm
                      total={payTotal}
                      showDepositOption={false}
                      submitLabel="Pay Invoices"
                      onSuccess={handleSuccess}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-3xl border border-brand-graphite bg-brand-graphite p-6 shadow-card"
                  >
                    <p className="mb-4 font-display text-body-md text-brand-white">Account Info</p>
                    <div className="flex flex-col gap-3 font-body text-body-sm text-brand-smoke">
                      <div className="flex justify-between">
                        <span>Account Type</span>
                        <span className="font-semibold text-brand-white">Trade Partner</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Terms</span>
                        <span className="font-semibold text-brand-white">NET 30</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volume Discount</span>
                        <span className="font-semibold text-success">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Account Manager</span>
                        <span className="font-semibold text-brand-white">Direct Line</span>
                      </div>
                    </div>

                    <div className="my-4 border-t border-brand-graphite-light" />

                    <div className="flex flex-col gap-2 font-body text-caption text-brand-silver">
                      <p>Payments accepted: Visa, Mastercard, AMEX, e-transfer</p>
                      <p>For wire transfer or cheque: call your account manager</p>
                    </div>

                    <a
                      href="tel:+16047106174"
                      className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-brand-ash py-2.5 font-body text-body-sm text-brand-smoke hover:border-brand-red hover:text-brand-red transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12 19.79 19.79 0 011.61 3.41 2 2 0 013.6 1.22h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.8a16 16 0 006.29 6.29l.96-.96a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
                      </svg>
                      604.710.6174
                    </a>

                    {selected.size > 0 && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowPayment(true)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red py-3 font-body text-body-sm font-semibold text-white hover:bg-brand-red-hover transition-colors"
                      >
                        Pay {selected.size} Invoice{selected.size !== 1 ? 's' : ''} · {fmtCAD(payTotal)}
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
