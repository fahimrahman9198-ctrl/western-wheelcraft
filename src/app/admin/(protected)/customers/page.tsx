'use client';

import { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { toast } from 'sonner';
import { format, parseISO, subDays } from 'date-fns';
import {
  X,
  Plus,
  Search,
  FileText,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Car,
  MessageSquare,
  PhoneCall,
  StickyNote,
  Send,
  Receipt,
  Quote,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

import { customers } from '@/lib/demo-data/customers';
import { bookings } from '@/lib/demo-data/bookings';
import { invoices } from '@/lib/demo-data/invoices';
import { communications } from '@/lib/demo-data/communications';

// ─── Types ──────────────────────────────────────────────────────────────────

type Customer = (typeof customers)[number];
type Booking = (typeof bookings)[number];
type Communication = (typeof communications)[number];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPhone(digits: string): string {
  // digits like '6041234567' → '604.123.4567'
  const d = digits.replace(/\D/g, '');
  if (d.length === 10) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return digits;
}

function formatMoney(n: number): string {
  return `$${n.toLocaleString()}`;
}

function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

const TODAY = new Date('2026-05-07T00:00:00.000Z');
const THIRTY_DAYS_AGO = subDays(TODAY, 30);

// ─── Status badge colors ─────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-brand-ash/40 text-brand-silver border-brand-ash/50',
  confirmed: 'bg-green-500/15 text-green-400 border-green-500/30',
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  paid: 'bg-green-500/15 text-green-400 border-green-500/30',
  unpaid: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  overdue: 'bg-red-500/15 text-red-400 border-red-500/30',
  draft: 'bg-brand-ash/40 text-brand-silver border-brand-ash/50',
};

// ─── Communication icon ──────────────────────────────────────────────────────

function CommIcon({ type }: { type: string }) {
  switch (type) {
    case 'email': return <Mail size={14} />;
    case 'sms': return <MessageSquare size={14} />;
    case 'call': return <PhoneCall size={14} />;
    case 'note': return <StickyNote size={14} />;
    default: return <MessageSquare size={14} />;
  }
}

// ─── Customer initial circle ─────────────────────────────────────────────────

function InitialCircle({ name, type, size = 'md' }: { name: string; type: string; size?: 'sm' | 'md' | 'lg' }) {
  const letter = name.trim().charAt(0).toUpperCase();
  const color = type === 'trade' ? 'bg-brand-red/20 text-brand-red' : 'bg-blue-500/20 text-blue-400';
  const sizeClass = size === 'lg' ? 'h-14 w-14 text-xl' : size === 'sm' ? 'h-8 w-8 text-sm' : 'h-10 w-10 text-base';
  return (
    <div className={`shrink-0 flex items-center justify-center rounded-full font-display font-bold ${color} ${sizeClass}`}>
      {letter}
    </div>
  );
}

// ─── Add Customer Modal ──────────────────────────────────────────────────────

function AddCustomerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', type: 'individual', notes: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success('Customer added!');
    onClose();
    setForm({ name: '', email: '', phone: '', address: '', city: '', type: 'individual', notes: '' });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-brand-graphite bg-brand-jet-light shadow-card animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-graphite px-6 py-5">
              <Dialog.Title className="font-display text-body-md font-semibold text-brand-white">
                Add Customer
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="rounded-lg p-1.5 text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors">
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-caption text-brand-silver mb-1.5">Full Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="BMW Vancouver"
                    className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-2 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-caption text-brand-silver mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-2 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-caption text-brand-silver mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="6041234567"
                    className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-2 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-caption text-brand-silver mb-1.5">Address</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="123 Main St"
                    className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-2 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-caption text-brand-silver mb-1.5">City</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Vancouver"
                    className="w-full rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-2 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-caption text-brand-silver mb-1.5">Customer Type</label>
                  <div className="flex gap-3">
                    {(['individual', 'trade'] as const).map((t) => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value={t}
                          checked={form.type === t}
                          onChange={() => setForm({ ...form, type: t })}
                          className="accent-brand-red"
                        />
                        <span className="text-body-sm text-brand-smoke capitalize">
                          {t === 'trade' ? 'Trade Partner' : 'Individual'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-caption text-brand-silver mb-1.5">Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Internal notes about this customer..."
                    className="w-full resize-none rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-2 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-1">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-lg border border-brand-graphite px-4 py-2 text-body-sm text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-red px-4 py-2 text-body-sm font-semibold text-white hover:bg-brand-red-hover transition-colors"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Customer Detail Modal ───────────────────────────────────────────────────

function CustomerDetailModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const customerBookings = useMemo(
    () => bookings.filter((b) => b.customerId === customer.id),
    [customer.id]
  );
  const customerComms = useMemo(
    () => communications.filter((c) => c.customerId === customer.id),
    [customer.id]
  );

  const avgOrder = customer.jobCount > 0 ? Math.round(customer.totalSpent / customer.jobCount) : 0;

  return (
    <Dialog.Root open onOpenChange={(v) => { if (!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-8">
          <div className="relative w-full max-w-3xl rounded-2xl border border-brand-graphite bg-brand-jet-light shadow-card animate-fade-in-up my-auto">

            {/* Header */}
            <div className="border-b border-brand-graphite px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <InitialCircle name={customer.name} type={customer.type} size="lg" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Dialog.Title className="font-display text-display-sm text-brand-white">
                        {customer.name}
                      </Dialog.Title>
                      {customer.type === 'trade' && (
                        <span className="rounded-full border border-brand-red/40 bg-brand-red/10 px-2.5 py-0.5 text-caption font-semibold text-brand-red">
                          Trade Partner
                        </span>
                      )}
                      {customer.type === 'individual' && (
                        <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-0.5 text-caption font-semibold text-blue-400">
                          Individual
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-brand-silver">
                      <span className="flex items-center gap-1"><Mail size={11} /> {customer.email}</span>
                      <span className="flex items-center gap-1"><Phone size={11} /> {formatPhone(customer.phone)}</span>
                      {customer.city && (
                        <span className="flex items-center gap-1"><MapPin size={11} /> {customer.city}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toast.info('Opening edit form...')}
                    className="rounded-lg border border-brand-graphite px-3 py-1.5 text-body-sm text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
                  >
                    Edit
                  </button>
                  <Dialog.Close asChild>
                    <button className="rounded-lg p-1.5 text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors">
                      <X size={16} />
                    </button>
                  </Dialog.Close>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 border-b border-brand-graphite px-6 py-4 sm:grid-cols-4">
              {[
                { label: 'Customer since', value: formatDate(customer.createdAt) },
                { label: 'Total spent', value: formatMoney(customer.totalSpent) },
                { label: 'Jobs', value: String(customer.jobCount) },
                { label: 'Avg order', value: formatMoney(avgOrder) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-brand-graphite bg-brand-graphite/40 px-3 py-2.5">
                  <p className="text-caption text-brand-silver">{stat.label}</p>
                  <p className="mt-0.5 font-mono text-body-md font-semibold text-brand-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs.Root defaultValue="history" className="flex flex-col">
              <Tabs.List className="flex border-b border-brand-graphite px-6">
                {[
                  { value: 'history', label: 'Service History' },
                  { value: 'vehicles', label: 'Vehicles' },
                  { value: 'comms', label: 'Communications' },
                  { value: 'notes', label: 'Notes' },
                ].map((tab) => (
                  <Tabs.Trigger
                    key={tab.value}
                    value={tab.value}
                    className="relative -mb-px px-4 py-3.5 text-body-sm text-brand-silver transition-colors hover:text-brand-smoke data-[state=active]:text-brand-white data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-brand-red"
                  >
                    {tab.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              {/* Service History */}
              <Tabs.Content value="history" className="min-h-[200px] p-6">
                {customerBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FileText size={32} className="text-brand-ash mb-3" />
                    <p className="text-body-sm text-brand-silver">No service history yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-brand-graphite/60 rounded-xl border border-brand-graphite overflow-hidden">
                    {customerBookings.map((b) => (
                      <div key={b.id} className="flex items-center gap-4 px-4 py-3">
                        <div className="w-24 shrink-0">
                          <p className="font-mono text-caption text-brand-silver">
                            {format(new Date(b.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-body-sm text-brand-smoke">{b.service}</p>
                        </div>
                        <div className="shrink-0 font-mono text-body-sm text-brand-white">
                          {formatMoney(b.amount)}
                        </div>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-caption font-medium ${STATUS_COLORS[b.status] ?? ''}`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Tabs.Content>

              {/* Vehicles */}
              <Tabs.Content value="vehicles" className="min-h-[200px] p-6">
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => toast.info('Opening add vehicle form...')}
                    className="flex items-center gap-1.5 rounded-lg border border-brand-graphite px-3 py-1.5 text-body-sm text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
                  >
                    <Plus size={14} /> Add Vehicle
                  </button>
                </div>
                {((customer.vehicles as unknown) as { make: string; model: string; year: number; wheelSize: string; color: string }[]).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Car size={32} className="text-brand-ash mb-3" />
                    <p className="text-body-sm text-brand-silver">No vehicles on file</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {customer.vehicles.map((v, i) => (
                      <div key={i} className="rounded-xl border border-brand-graphite bg-brand-graphite/40 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Car size={16} className="text-brand-red shrink-0" />
                          <p className="font-semibold text-body-sm text-brand-white">
                            {v.year} {v.make} {v.model}
                          </p>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                          <span className="text-caption text-brand-silver">Wheels: {v.wheelSize}</span>
                          <span className="text-caption text-brand-silver">Color: {v.color}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Tabs.Content>

              {/* Communications */}
              <Tabs.Content value="comms" className="min-h-[200px] p-6">
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => toast.info('Opening log form...')}
                    className="flex items-center gap-1.5 rounded-lg border border-brand-graphite px-3 py-1.5 text-body-sm text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
                  >
                    <Plus size={14} /> Log Call / Note
                  </button>
                </div>
                {customerComms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <MessageSquare size={32} className="text-brand-ash mb-3" />
                    <p className="text-body-sm text-brand-silver">No communications logged</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerComms.map((c) => (
                      <div key={c.id} className="flex gap-3">
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-graphite bg-brand-graphite text-brand-silver">
                            <CommIcon type={c.type} />
                          </div>
                          <div className="mt-1 w-px flex-1 bg-brand-graphite/60" />
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-body-sm font-medium text-brand-smoke">{c.subject}</p>
                            {c.direction === 'inbound' ? (
                              <span className="flex items-center gap-0.5 text-caption text-green-400">
                                <ArrowDownLeft size={11} /> In
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-caption text-blue-400">
                                <ArrowUpRight size={11} /> Out
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-caption text-brand-silver">{formatDate(c.createdAt)} · {c.createdBy}</p>
                          {c.body && (
                            <p className="mt-1 text-caption text-brand-ash leading-relaxed line-clamp-2">{c.body}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Tabs.Content>

              {/* Notes */}
              <Tabs.Content value="notes" className="min-h-[200px] p-6">
                <div className="space-y-3">
                  <textarea
                    rows={6}
                    defaultValue={customer.notes}
                    placeholder="Add internal notes about this customer..."
                    className="w-full resize-y rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-2.5 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none transition-colors"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => toast.success('Notes saved')}
                      className="rounded-lg bg-brand-red px-4 py-2 text-body-sm font-semibold text-white hover:bg-brand-red-hover transition-colors"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              </Tabs.Content>
            </Tabs.Root>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 border-t border-brand-graphite px-6 py-4">
              <button
                onClick={() => toast.info('Opening quote form...')}
                className="flex items-center gap-1.5 rounded-lg border border-brand-graphite px-3 py-2 text-body-sm text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
              >
                <Quote size={14} /> New Quote
              </button>
              <button
                onClick={() => toast.info('Opening invoice form...')}
                className="flex items-center gap-1.5 rounded-lg border border-brand-graphite px-3 py-2 text-body-sm text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
              >
                <Receipt size={14} /> New Invoice
              </button>
              <button
                onClick={() => toast.success('Email sent!')}
                className="flex items-center gap-1.5 rounded-lg border border-brand-graphite px-3 py-2 text-body-sm text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
              >
                <Mail size={14} /> Send Email
              </button>
              <button
                onClick={() => toast.success('SMS sent!')}
                className="flex items-center gap-1.5 rounded-lg border border-brand-graphite px-3 py-2 text-body-sm text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
              >
                <Send size={14} /> Send SMS
              </button>
              <button
                onClick={() => toast.info('Opening call log...')}
                className="flex items-center gap-1.5 rounded-lg border border-brand-graphite px-3 py-2 text-body-sm text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
              >
                <PhoneCall size={14} /> Log Call
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Customer Card ───────────────────────────────────────────────────────────

function CustomerCard({ customer, onView }: { customer: Customer; onView: () => void }) {
  return (
    <div
      className="group flex flex-col rounded-xl border border-brand-graphite bg-brand-jet-light p-4 hover:border-brand-graphite-light transition-all duration-200 cursor-default"
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <InitialCircle name={customer.name} type={customer.type} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-body-sm text-brand-white truncate">{customer.name}</p>
            {customer.type === 'trade' && (
              <span className="shrink-0 rounded-full border border-brand-red/40 bg-brand-red/10 px-2 py-0.5 text-caption font-semibold text-brand-red">
                Trade Partner
              </span>
            )}
          </div>
          <p className="mt-0.5 text-caption text-brand-silver font-mono">{formatPhone(customer.phone)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 flex items-center gap-2 text-caption text-brand-silver">
        <span className="font-mono">{customer.jobCount} jobs</span>
        <span className="text-brand-ash">·</span>
        <span className="font-mono">{formatMoney(customer.totalSpent)} lifetime</span>
      </div>

      {/* Last service */}
      <p className="mt-1 text-caption text-brand-ash">
        Last service: {customer.lastServiceAt ? formatDate(customer.lastServiceAt) : 'Never'}
      </p>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => toast.info('Opening invoice form...')}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-graphite px-3 py-1.5 text-caption text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
        >
          <Receipt size={12} /> New Invoice
        </button>
        <button
          onClick={onView}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-graphite px-3 py-1.5 text-caption text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
        >
          View <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Filter tabs ─────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'trade' | 'repeat' | 'new';

function getFilteredCustomers(tab: FilterTab, query: string): Customer[] {
  let list = [...customers] as Customer[];

  // Tab filter
  if (tab === 'trade') {
    list = list.filter((c) => c.type === 'trade');
  } else if (tab === 'repeat') {
    list = list.filter((c) => c.jobCount >= 3);
  } else if (tab === 'new') {
    list = list.filter((c) => new Date(c.createdAt) >= THIRTY_DAYS_AGO);
  }

  // Search filter
  if (query.trim()) {
    const q = query.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }

  return list;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [query, setQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const allCustomers = (customers as unknown) as Customer[];

  const tabCounts = useMemo(() => ({
    all: allCustomers.length,
    trade: allCustomers.filter((c) => c.type === 'trade').length,
    repeat: allCustomers.filter((c) => c.jobCount >= 3).length,
    new: allCustomers.filter((c) => new Date(c.createdAt) >= THIRTY_DAYS_AGO).length,
  }), [allCustomers]);

  const filtered = useMemo(() => getFilteredCustomers(activeTab, query), [activeTab, query]);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: `All (${tabCounts.all})` },
    { key: 'trade', label: `Trade Partners (${tabCounts.trade})` },
    { key: 'repeat', label: `Repeat (≥3 jobs) (${tabCounts.repeat})` },
    { key: 'new', label: `New (last 30d) (${tabCounts.new})` },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-sm text-brand-white">Customers</h1>
          <p className="mt-1 text-body-sm text-brand-silver">{allCustomers.length} customers total</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-body-sm font-semibold text-white hover:bg-brand-red-hover transition-colors"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ash" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full rounded-lg border border-brand-graphite bg-brand-jet-light pl-9 pr-3 py-2 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 border-b border-brand-graphite">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative -mb-px px-4 py-2.5 text-body-sm transition-colors ${
              activeTab === tab.key
                ? 'text-brand-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-red'
                : 'text-brand-silver hover:text-brand-smoke'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Customer grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search size={40} className="text-brand-ash mb-4" />
          <p className="text-body-md text-brand-silver">No customers found</p>
          {query && (
            <p className="mt-1 text-body-sm text-brand-ash">
              Try a different search term
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onView={() => setSelectedCustomer(customer)}
            />
          ))}
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {/* Add Customer Modal */}
      <AddCustomerModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
}
