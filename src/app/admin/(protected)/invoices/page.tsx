'use client';

import { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Eye,
  CheckCircle,
  X,
  Trash2,
  ChevronDown,
  Send,
  Download,
  RotateCcw,
} from 'lucide-react';
import { invoices as initialInvoices } from '@/lib/demo-data/invoices';
import { format, addDays, parseISO } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'draft';

interface LineItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  lineItems: LineItem[];
  subtotal: number;
  gst: number;
  total: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
  notes: string;
  internalNotes: string;
  bookingId: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-05-07T12:00:00.000Z');

const QUICK_ADD_ITEMS = [
  { label: 'OEM Refinish $300/wheel', description: 'OEM Color Match Refinish', unitPrice: 300 },
  { label: 'Curb Rash $200', description: 'Curb Rash Repair', unitPrice: 200 },
  { label: 'Diamond Cut $400', description: 'Diamond Cut', unitPrice: 400 },
  { label: 'Two-Tone $475', description: 'Two-Tone Custom Finish', unitPrice: 475 },
  { label: 'Mobile Fee $40', description: 'Mobile Service Fee', unitPrice: 40 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

function statusBadge(status: InvoiceStatus): string {
  switch (status) {
    case 'paid':
      return 'bg-green-500/15 text-green-400 border border-green-500/30';
    case 'unpaid':
      return 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30';
    case 'overdue':
      return 'bg-brand-red/15 text-brand-red border border-brand-red/30';
    case 'draft':
      return 'bg-brand-ash/30 text-brand-silver border border-brand-ash/40';
  }
}

function generateInvoiceNumber(list: Invoice[]): string {
  const max = list.reduce((acc, inv) => {
    const n = parseInt(inv.invoiceNumber.split('-')[2] ?? '0', 10);
    return Math.max(acc, n);
  }, 0);
  return `WW-2026-${String(max + 1).padStart(3, '0')}`;
}

// ─── Create Invoice Modal ─────────────────────────────────────────────────────

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice, send: boolean) => void;
  allInvoices: Invoice[];
}

function CreateInvoiceModal({ open, onClose, onSave, allInvoices }: CreateModalProps) {
  const defaultDue = format(addDays(TODAY, 7), "yyyy-MM-dd");

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [dueDate, setDueDate] = useState(defaultDue);
  const [emailInvoice, setEmailInvoice] = useState(true);
  const [sendSms, setSendSms] = useState(false);
  const [saveAsDraft, setSaveAsDraft] = useState(false);

  const subtotal = lineItems.reduce((s, i) => s + i.total, 0);
  const gst = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + gst;

  function reset() {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setCustomerAddress('');
    setLineItems([]);
    setNotes('');
    setInternalNotes('');
    setDueDate(defaultDue);
    setEmailInvoice(true);
    setSendSms(false);
    setSaveAsDraft(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function addQuickItem(item: { description: string; unitPrice: number }) {
    setLineItems((prev) => [
      ...prev,
      { description: item.description, qty: 1, unitPrice: item.unitPrice, total: item.unitPrice },
    ]);
  }

  function addBlankItem() {
    setLineItems((prev) => [
      ...prev,
      { description: '', qty: 1, unitPrice: 0, total: 0 },
    ]);
  }

  function updateLineItem(idx: number, field: keyof LineItem, value: string | number) {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: value };
        updated.total = updated.qty * updated.unitPrice;
        return updated;
      })
    );
  }

  function removeLineItem(idx: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function buildInvoice(status: InvoiceStatus): Invoice {
    const issuedAt = TODAY.toISOString();
    const dueAt = new Date(dueDate + 'T17:00:00.000Z').toISOString();
    return {
      id: `inv_new_${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(allInvoices),
      customerId: `cust_new_${Date.now()}`,
      customerName: customerName || 'New Customer',
      customerEmail: customerEmail,
      lineItems,
      subtotal,
      gst,
      total,
      status,
      issuedAt,
      dueAt,
      paidAt: null,
      notes,
      internalNotes,
      bookingId: null,
    };
  }

  function handleSaveDraft() {
    const inv = buildInvoice('draft');
    onSave(inv, false);
    toast.success('Draft saved');
    handleClose();
  }

  function handleSendNow() {
    const inv = buildInvoice('unpaid');
    onSave(inv, true);
    toast.success(`Invoice sent to ${customerEmail || customerName}`);
    handleClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-brand-graphite bg-brand-jet-light shadow-card">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-graphite bg-brand-jet-light px-6 py-4">
              <Dialog.Title className="font-display text-display-sm text-brand-white">
                Create Invoice
              </Dialog.Title>
              <button
                onClick={handleClose}
                className="rounded-lg p-2 text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Section 1 — Customer */}
              <section>
                <h3 className="mb-3 font-display text-body-sm font-semibold uppercase tracking-widest text-brand-silver">
                  Customer
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="mb-1 block text-caption text-brand-silver">Full Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. John Smith"
                      className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-2 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-caption text-brand-silver">Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-2 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-caption text-brand-silver">Phone</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="604-XXX-XXXX"
                      className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-2 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-caption text-brand-silver">Address</label>
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="123 Main St, Vancouver BC V5K 0A1"
                      rows={2}
                      className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-2 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Section 2 — Line Items */}
              <section>
                <h3 className="mb-3 font-display text-body-sm font-semibold uppercase tracking-widest text-brand-silver">
                  Line Items
                </h3>

                {/* Quick-add buttons */}
                <div className="mb-3 flex flex-wrap gap-2">
                  {QUICK_ADD_ITEMS.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => addQuickItem(item)}
                      className="rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-1.5 text-caption text-brand-smoke hover:border-brand-red/50 hover:text-brand-white transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={addBlankItem}
                    className="rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-1.5 text-caption text-brand-silver hover:border-brand-red/50 hover:text-brand-white transition-colors"
                  >
                    Custom…
                  </button>
                </div>

                {/* Line items table */}
                {lineItems.length > 0 && (
                  <div className="mb-3 overflow-x-auto rounded-lg border border-brand-graphite">
                    <table className="w-full text-body-sm">
                      <thead>
                        <tr className="border-b border-brand-graphite bg-brand-graphite/40">
                          <th className="py-2 pl-3 pr-2 text-left text-caption font-medium text-brand-silver">
                            Description
                          </th>
                          <th className="py-2 px-2 text-center text-caption font-medium text-brand-silver w-16">
                            Qty
                          </th>
                          <th className="py-2 px-2 text-right text-caption font-medium text-brand-silver w-28">
                            Unit Price
                          </th>
                          <th className="py-2 px-2 text-right text-caption font-medium text-brand-silver w-24">
                            Total
                          </th>
                          <th className="w-8 py-2 pr-2" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-graphite/60">
                        {lineItems.map((item, idx) => (
                          <tr key={idx} className="group">
                            <td className="py-2 pl-3 pr-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                                placeholder="Service description"
                                className="w-full bg-transparent text-brand-white placeholder:text-brand-ash focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                min={1}
                                value={item.qty}
                                onChange={(e) => updateLineItem(idx, 'qty', Number(e.target.value))}
                                className="w-full bg-transparent text-center text-brand-white focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                min={0}
                                value={item.unitPrice}
                                onChange={(e) =>
                                  updateLineItem(idx, 'unitPrice', Number(e.target.value))
                                }
                                className="w-full bg-transparent text-right text-brand-white focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-brand-smoke">
                              {formatCurrency(item.total)}
                            </td>
                            <td className="py-2 pr-2 text-center">
                              <button
                                onClick={() => removeLineItem(idx)}
                                className="text-brand-ash hover:text-brand-red transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <button
                  onClick={addBlankItem}
                  className="flex items-center gap-1.5 text-caption text-brand-silver hover:text-brand-red transition-colors"
                >
                  <Plus size={14} />
                  Add Line Item
                </button>
              </section>

              {/* Section 3 — Totals */}
              <section>
                <div className="ml-auto w-56 space-y-1.5 rounded-xl border border-brand-graphite bg-brand-graphite/30 px-4 py-3">
                  <div className="flex justify-between text-body-sm text-brand-silver">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-body-sm text-brand-silver">
                    <span>GST (5%)</span>
                    <span className="font-mono">{formatCurrency(gst)}</span>
                  </div>
                  <div className="flex justify-between border-t border-brand-graphite pt-1.5">
                    <span className="font-display font-semibold text-brand-white">TOTAL</span>
                    <span className="font-mono font-bold text-brand-red text-body-md">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </section>

              {/* Section 4 — Details */}
              <section>
                <h3 className="mb-3 font-display text-body-sm font-semibold uppercase tracking-widest text-brand-silver">
                  Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="mb-1 block text-caption text-brand-silver">
                      Notes <span className="text-brand-ash">(visible to customer)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Thank you for your business."
                      className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-2 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none resize-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-caption text-brand-silver">
                      Internal Notes <span className="text-brand-ash">(private)</span>
                    </label>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      rows={2}
                      placeholder="Internal team notes…"
                      className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-2 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-caption text-brand-silver">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-2 text-body-sm text-brand-white focus:border-brand-red/50 focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>
              </section>

              {/* Section 5 — Send Options */}
              <section>
                <h3 className="mb-3 font-display text-body-sm font-semibold uppercase tracking-widest text-brand-silver">
                  Send Options
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      id: 'emailInvoice',
                      label: 'Email invoice with payment link',
                      checked: emailInvoice,
                      set: setEmailInvoice,
                    },
                    {
                      id: 'sendSms',
                      label: 'Send SMS notification',
                      checked: sendSms,
                      set: setSendSms,
                    },
                    {
                      id: 'saveAsDraft',
                      label: 'Save as draft only',
                      checked: saveAsDraft,
                      set: setSaveAsDraft,
                    },
                  ].map(({ id, label, checked, set }) => (
                    <label key={id} className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => set(e.target.checked)}
                        className="h-4 w-4 rounded border-brand-graphite accent-brand-red"
                      />
                      <span className="text-body-sm text-brand-smoke">{label}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-brand-graphite bg-brand-jet-light px-6 py-4">
              <button
                onClick={handleClose}
                className="rounded-lg border border-brand-graphite px-4 py-2 text-body-sm text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDraft}
                className="rounded-lg border border-brand-graphite px-4 py-2 text-body-sm text-brand-smoke hover:bg-brand-graphite hover:text-brand-white transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={handleSendNow}
                className="flex items-center gap-2 rounded-lg bg-brand-red px-5 py-2 text-body-sm font-semibold text-white hover:bg-brand-red-hover transition-colors"
              >
                <Send size={14} />
                Send Now
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Invoice Preview Modal ────────────────────────────────────────────────────

interface PreviewModalProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  onMarkPaid: (id: string) => void;
}

function InvoicePreviewModal({ invoice, open, onClose, onMarkPaid }: PreviewModalProps) {
  if (!invoice) return null;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-brand-graphite bg-brand-jet-light shadow-card">
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-lg p-2 text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Invoice document */}
            <div className="px-8 pb-0 pt-8">
              {/* Invoice header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="font-display text-display-sm font-bold text-brand-white">INVOICE</p>
                  <p className="mt-1 font-mono text-body-sm text-brand-red">
                    {invoice.invoiceNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-body-sm font-bold text-brand-white">
                    Western Wheelcraft
                  </p>
                  <p className="text-caption text-brand-silver">3756 Napier St, Burnaby BC</p>
                  <p className="text-caption text-brand-silver">604.710.6174</p>
                  <p className="text-caption text-brand-silver">info@westernwheelcraft.ca</p>
                </div>
              </div>

              {/* Meta row */}
              <div className="mb-6 grid grid-cols-3 gap-4 rounded-xl border border-brand-graphite bg-brand-graphite/30 p-4">
                <div>
                  <p className="text-caption text-brand-silver">Issued</p>
                  <p className="text-body-sm text-brand-white">{formatDate(invoice.issuedAt)}</p>
                </div>
                <div>
                  <p className="text-caption text-brand-silver">Due</p>
                  <p className="text-body-sm text-brand-white">{formatDate(invoice.dueAt)}</p>
                </div>
                <div>
                  <p className="text-caption text-brand-silver">Status</p>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-caption font-medium ${statusBadge(invoice.status)}`}
                  >
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-6">
                <p className="mb-1 text-caption font-semibold uppercase tracking-wider text-brand-silver">
                  Bill To
                </p>
                <p className="text-body-sm font-semibold text-brand-white">{invoice.customerName}</p>
                <p className="text-caption text-brand-silver">{invoice.customerEmail}</p>
              </div>

              {/* Line items */}
              <div className="mb-6 overflow-hidden rounded-xl border border-brand-graphite">
                <table className="w-full text-body-sm">
                  <thead>
                    <tr className="border-b border-brand-graphite bg-brand-graphite/40">
                      <th className="py-2 pl-4 pr-2 text-left text-caption font-medium text-brand-silver">
                        Description
                      </th>
                      <th className="py-2 px-2 text-center text-caption font-medium text-brand-silver w-12">
                        Qty
                      </th>
                      <th className="py-2 px-2 text-right text-caption font-medium text-brand-silver w-24">
                        Unit Price
                      </th>
                      <th className="py-2 pl-2 pr-4 text-right text-caption font-medium text-brand-silver w-24">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-graphite/50">
                    {invoice.lineItems.map((item, i) => (
                      <tr key={i}>
                        <td className="py-2.5 pl-4 pr-2 text-brand-smoke">{item.description}</td>
                        <td className="py-2.5 px-2 text-center text-brand-silver">{item.qty}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-brand-silver">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-2.5 pl-2 pr-4 text-right font-mono text-brand-white">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mb-6 ml-auto w-52 space-y-1.5">
                <div className="flex justify-between text-body-sm text-brand-silver">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-body-sm text-brand-silver">
                  <span>GST (5%)</span>
                  <span className="font-mono">{formatCurrency(invoice.gst)}</span>
                </div>
                <div className="flex justify-between border-t border-brand-graphite pt-1.5">
                  <span className="font-display font-bold text-brand-white">TOTAL</span>
                  <span className="font-mono font-bold text-brand-red text-body-md">
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              </div>

              {/* Pay Now button */}
              {invoice.status !== 'paid' && invoice.status !== 'draft' && (
                <button
                  onClick={() => toast.info('Payment portal coming soon')}
                  className="mb-4 w-full rounded-xl bg-brand-red py-3 font-display font-bold text-white text-body-md hover:bg-brand-red-hover transition-colors"
                >
                  Pay Now
                </button>
              )}

              {/* Bank transfer */}
              <div className="mb-6 rounded-xl border border-brand-graphite bg-brand-graphite/20 px-4 py-3 text-center">
                <p className="text-caption text-brand-silver">Interac e-Transfer</p>
                <p className="font-mono text-body-sm text-brand-smoke">info@westernwheelcraft.ca</p>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mb-6">
                  <p className="mb-1 text-caption font-semibold uppercase tracking-wider text-brand-silver">
                    Notes
                  </p>
                  <p className="text-body-sm text-brand-smoke">{invoice.notes}</p>
                </div>
              )}
            </div>

            {/* Action bar */}
            <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-brand-graphite bg-brand-jet-light px-6 py-4">
              <button
                onClick={() => toast.success('Invoice resent to ' + invoice.customerEmail)}
                className="flex items-center gap-2 rounded-lg border border-brand-graphite px-3 py-2 text-body-sm text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
              >
                <RotateCcw size={14} />
                Resend
              </button>
              {invoice.status !== 'paid' && (
                <button
                  onClick={() => {
                    onMarkPaid(invoice.id);
                    toast.success('Invoice marked as paid');
                    onClose();
                  }}
                  className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-body-sm text-green-400 hover:bg-green-500/20 transition-colors"
                >
                  <CheckCircle size={14} />
                  Mark as Paid
                </button>
              )}
              <button
                onClick={() => toast.info('PDF download coming soon')}
                className="flex items-center gap-2 rounded-lg border border-brand-graphite px-3 py-2 text-body-sm text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
              >
                <Download size={14} />
                Download PDF
              </button>
              <button
                onClick={onClose}
                className="ml-auto rounded-lg border border-brand-graphite px-4 py-2 text-body-sm text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type FilterTab = 'all' | InvoiceStatus;

export default function InvoicesPage() {
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(
    initialInvoices as unknown as Invoice[]
  );
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Tab counts
  const counts = useMemo(
    () => ({
      all: invoiceList.length,
      paid: invoiceList.filter((i) => i.status === 'paid').length,
      unpaid: invoiceList.filter((i) => i.status === 'unpaid').length,
      overdue: invoiceList.filter((i) => i.status === 'overdue').length,
      draft: invoiceList.filter((i) => i.status === 'draft').length,
    }),
    [invoiceList]
  );

  // Filtered list
  const filtered = useMemo(() => {
    let list = invoiceList;
    if (activeTab !== 'all') {
      list = list.filter((i) => i.status === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.customerName.toLowerCase().includes(q) ||
          i.invoiceNumber.toLowerCase().includes(q)
      );
    }
    return list;
  }, [invoiceList, activeTab, search]);

  function handleMarkPaid(id: string) {
    setInvoiceList((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: 'paid' as InvoiceStatus, paidAt: new Date().toISOString() }
          : inv
      )
    );
    // Also update previewInvoice if it's the same one
    setPreviewInvoice((prev) =>
      prev && prev.id === id
        ? { ...prev, status: 'paid', paidAt: new Date().toISOString() }
        : prev
    );
  }

  function handleSaveInvoice(invoice: Invoice) {
    setInvoiceList((prev) => [invoice, ...prev]);
  }

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'paid', label: 'Paid' },
    { key: 'unpaid', label: 'Unpaid' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'draft', label: 'Draft' },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-brand-graphite bg-brand-jet-light px-6 py-4">
        <div>
          <h1 className="font-display text-display-sm text-brand-white">Invoices</h1>
          <p className="mt-0.5 text-body-sm text-brand-silver">
            {counts.all} total &mdash; {counts.overdue} overdue
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-red px-5 py-2.5 font-display font-semibold text-white hover:bg-brand-red-hover transition-colors shadow-red-glow"
        >
          <Plus size={16} />
          Create Invoice
        </button>
      </div>

      {/* Toolbar: tabs + search */}
      <div className="flex flex-col gap-3 border-b border-brand-graphite bg-brand-jet-light px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-body-sm transition-colors ${
                activeTab === key
                  ? 'bg-brand-graphite text-brand-white'
                  : 'text-brand-silver hover:bg-brand-graphite/50 hover:text-brand-white'
              }`}
            >
              {label}
              <span
                className={`rounded-full px-1.5 py-0.5 font-mono text-caption ${
                  activeTab === key
                    ? 'bg-brand-ash text-brand-smoke'
                    : 'bg-brand-graphite text-brand-silver'
                }`}
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ash pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer or invoice #"
            className="w-full rounded-lg border border-brand-graphite bg-brand-graphite py-2 pl-8 pr-3 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none sm:w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[720px] text-body-sm">
          <thead className="sticky top-0 z-10 border-b border-brand-graphite bg-brand-jet-light">
            <tr>
              <th className="py-3 pl-6 pr-3 text-left text-caption font-medium text-brand-silver">
                Invoice #
              </th>
              <th className="py-3 px-3 text-left text-caption font-medium text-brand-silver">
                Customer
              </th>
              <th className="py-3 px-3 text-right text-caption font-medium text-brand-silver">
                Amount
              </th>
              <th className="py-3 px-3 text-left text-caption font-medium text-brand-silver">
                Status
              </th>
              <th className="py-3 px-3 text-left text-caption font-medium text-brand-silver">
                Issued
              </th>
              <th className="py-3 px-3 text-left text-caption font-medium text-brand-silver">
                Due
              </th>
              <th className="py-3 pl-3 pr-6 text-right text-caption font-medium text-brand-silver">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-graphite/50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-brand-silver">
                  No invoices found
                </td>
              </tr>
            )}
            {filtered.map((inv) => (
              <tr
                key={inv.id}
                onClick={() => setPreviewInvoice(inv)}
                className="group cursor-pointer hover:bg-brand-graphite/30 transition-colors"
              >
                <td className="py-3.5 pl-6 pr-3">
                  <span className="font-mono text-brand-smoke group-hover:text-brand-white transition-colors">
                    {inv.invoiceNumber}
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <p className="font-medium text-brand-white">{inv.customerName}</p>
                  <p className="text-caption text-brand-silver">{inv.customerEmail}</p>
                </td>
                <td className="py-3.5 px-3 text-right font-mono font-semibold text-brand-white">
                  {formatCurrency(inv.total)}
                </td>
                <td className="py-3.5 px-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-caption font-medium ${statusBadge(inv.status)}`}
                  >
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-brand-silver">{formatDate(inv.issuedAt)}</td>
                <td className="py-3.5 px-3 text-brand-silver">{formatDate(inv.dueAt)}</td>
                <td className="py-3.5 pl-3 pr-6">
                  <div
                    className="flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setPreviewInvoice(inv)}
                      className="flex items-center gap-1.5 rounded-lg border border-brand-graphite px-2.5 py-1.5 text-caption text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
                    >
                      <Eye size={12} />
                      View
                    </button>
                    {(inv.status === 'unpaid' || inv.status === 'overdue') && (
                      <button
                        onClick={() => {
                          handleMarkPaid(inv.id);
                          toast.success('Invoice marked as paid');
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-2.5 py-1.5 text-caption text-green-400 hover:bg-green-500/20 transition-colors"
                      >
                        <CheckCircle size={12} />
                        Mark Paid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleSaveInvoice}
        allInvoices={invoiceList}
      />

      {/* Preview Modal */}
      <InvoicePreviewModal
        invoice={previewInvoice}
        open={previewInvoice !== null}
        onClose={() => setPreviewInvoice(null)}
        onMarkPaid={handleMarkPaid}
      />
    </div>
  );
}
