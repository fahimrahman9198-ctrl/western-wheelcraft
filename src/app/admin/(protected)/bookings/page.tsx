'use client';

import { useState, useMemo, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  CheckCircle2,
  XCircle,
  Bell,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Clock,
  User,
  Phone,
  Mail,
  Car,
  Wrench,
  CreditCard,
  FileText,
  Image,
} from 'lucide-react';
import {
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  format,
  parseISO,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfDay,
} from 'date-fns';
import { bookings } from '@/lib/demo-data/bookings';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Booking = (typeof bookings)[number];
type ViewMode = 'day' | 'week' | 'month';
type StatusFilter = 'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled';
type SortField = 'date' | 'startTime' | 'customerName' | 'service' | 'amount' | 'status';
type SortDir = 'asc' | 'desc';
type Slot = 'shop' | 'mobile_1' | 'mobile_2';

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-05-07T00:00:00');

const STATUS_CLASSES: Record<string, string> = {
  confirmed: 'bg-green-500/15 text-green-400 border-green-500/30',
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  completed: 'bg-brand-ash/40 text-brand-silver border-brand-ash/50',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const STATUS_BLOCK_CLASSES: Record<string, string> = {
  confirmed: 'bg-green-500/20 border-l-2 border-green-500 text-green-300',
  pending: 'bg-yellow-500/20 border-l-2 border-yellow-500 text-yellow-300',
  completed: 'bg-blue-500/10 border-l-2 border-blue-500/60 text-blue-300/80',
  cancelled: 'bg-red-500/10 border-l-2 border-red-500 text-red-300/70',
};

const SLOT_LABELS: Record<Slot, string> = {
  shop: 'Shop',
  mobile_1: 'Mobile Truck 1',
  mobile_2: 'Mobile Truck 2',
};

const SLOT_ROW_LABELS: Record<Slot, string> = {
  shop: 'Shop Bay',
  mobile_1: 'Mobile 1',
  mobile_2: 'Mobile 2',
};

const SERVICES = [
  'OEM Color Match',
  'Curb Rash Repair',
  'Diamond Cut',
  'Two-Tone Custom',
  'Powder Coat',
];

const TIMES_30MIN = Array.from({ length: 19 }, (_, i) => {
  const totalMins = 8 * 60 + i * 30;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const label = `${h % 12 === 0 ? 12 : h % 12}:${m === 0 ? '00' : m} ${h < 12 ? 'AM' : 'PM'}`;
  const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return { label, value };
});

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-caption font-medium capitalize',
        STATUS_CLASSES[status] ?? 'bg-brand-ash/30 text-brand-silver border-brand-ash/40'
      )}
    >
      {status}
    </span>
  );
}

// ─── Booking Detail Modal ─────────────────────────────────────────────────────

function BookingDetailModal({
  booking,
  open,
  onClose,
}: {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!booking) return null;

  const slotLabel = SLOT_LABELS[booking.slot as Slot] ?? booking.slot;

  const handleAction = (action: string) => {
    toast.success(action);
    if (action.startsWith('Booking cancelled')) onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-brand-graphite bg-brand-jet-light p-0 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-brand-graphite px-6 py-4">
            <div>
              <Dialog.Title className="font-display text-body-md text-brand-white">
                Booking #{booking.id.replace('book_', '')}
              </Dialog.Title>
              <p className="mt-0.5 text-caption text-brand-silver">
                {format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')} · {booking.startTime}–{booking.endTime}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={booking.status} />
              <Dialog.Close className="rounded-lg p-1.5 text-brand-ash hover:bg-brand-graphite hover:text-brand-white transition-colors">
                <X size={16} />
              </Dialog.Close>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Customer */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-brand-ash">
                <User size={13} /> Customer
              </h3>
              <div className="rounded-xl border border-brand-graphite bg-brand-graphite/30 p-4 space-y-2">
                <p className="text-body-md font-medium text-brand-white">{booking.customerName}</p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href={`tel:${booking.customerPhone}`}
                    className="flex items-center gap-1.5 text-body-sm text-brand-silver hover:text-brand-red transition-colors"
                  >
                    <Phone size={13} /> {booking.customerPhone}
                  </a>
                  <a
                    href={`mailto:${booking.customerEmail}`}
                    className="flex items-center gap-1.5 text-body-sm text-brand-silver hover:text-brand-red transition-colors"
                  >
                    <Mail size={13} /> {booking.customerEmail}
                  </a>
                </div>
              </div>
            </section>

            {/* Vehicle + Service */}
            <div className="grid grid-cols-2 gap-4">
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-brand-ash">
                  <Car size={13} /> Vehicle
                </h3>
                <div className="rounded-xl border border-brand-graphite bg-brand-graphite/30 p-4 space-y-1">
                  <p className="text-body-sm text-brand-white font-medium">
                    {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                  </p>
                  <p className="text-caption text-brand-silver">
                    {booking.vehicle.wheelSize} wheels · {booking.vehicle.color}
                  </p>
                </div>
              </section>
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-brand-ash">
                  <Wrench size={13} /> Service
                </h3>
                <div className="rounded-xl border border-brand-graphite bg-brand-graphite/30 p-4 space-y-1">
                  <p className="text-body-sm text-brand-white font-medium">{booking.service}</p>
                  <p className="text-caption text-brand-silver">
                    {booking.duration}h · {slotLabel}
                  </p>
                </div>
              </section>
            </div>

            {/* Payment */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-brand-ash">
                <CreditCard size={13} /> Payment
              </h3>
              <div className="rounded-xl border border-brand-graphite bg-brand-graphite/30 p-4 flex items-center justify-between">
                <div>
                  <p className="text-body-sm text-brand-white">
                    Deposit paid{' '}
                    <span className="font-mono font-semibold text-green-400">
                      ${booking.depositPaid.toLocaleString()}
                    </span>{' '}
                    of{' '}
                    <span className="font-mono font-semibold text-brand-white">
                      ${booking.amount.toLocaleString()}
                    </span>
                  </p>
                  <p className="mt-0.5 text-caption text-brand-silver">
                    Balance due:{' '}
                    <span className="font-mono text-yellow-400">
                      ${(booking.amount - booking.depositPaid).toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="h-2 w-28 rounded-full bg-brand-graphite overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${Math.round((booking.depositPaid / booking.amount) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-caption text-brand-ash">
                    {Math.round((booking.depositPaid / booking.amount) * 100)}% paid
                  </p>
                </div>
              </div>
            </section>

            {/* Notes */}
            {booking.notes && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-brand-ash">
                  <FileText size={13} /> Notes
                </h3>
                <div className="rounded-xl border border-brand-graphite bg-brand-graphite/30 p-4">
                  <p className="text-body-sm text-brand-smoke">{booking.notes}</p>
                </div>
              </section>
            )}

            {/* Photos */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-brand-ash">
                <Image size={13} /> Photos
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="aspect-video rounded-lg bg-brand-graphite border border-brand-graphite/80 flex items-center justify-center"
                  >
                    <Image size={20} className="text-brand-ash/50" />
                  </div>
                ))}
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-brand-graphite">
              <button
                onClick={() => handleAction('Booking marked as complete')}
                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-body-sm font-medium text-white hover:bg-green-500 transition-colors"
              >
                <CheckCircle2 size={14} /> Mark Complete
              </button>
              <button
                onClick={() => handleAction('Reschedule flow coming soon')}
                className="flex items-center gap-1.5 rounded-lg bg-brand-graphite px-3 py-2 text-body-sm font-medium text-brand-white hover:bg-brand-graphite-light transition-colors"
              >
                <Calendar size={14} /> Reschedule
              </button>
              <button
                onClick={() => handleAction('Booking cancelled')}
                className="flex items-center gap-1.5 rounded-lg bg-red-600/20 px-3 py-2 text-body-sm font-medium text-red-400 hover:bg-red-600/30 transition-colors"
              >
                <XCircle size={14} /> Cancel
              </button>
              <button
                onClick={() => handleAction(`Reminder sent to ${booking.customerName}`)}
                className="ml-auto flex items-center gap-1.5 rounded-lg bg-brand-graphite px-3 py-2 text-body-sm font-medium text-brand-silver hover:bg-brand-graphite-light transition-colors"
              >
                <Bell size={14} /> Send Reminder
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── New Booking Modal ────────────────────────────────────────────────────────

const BLANK_FORM = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  vehicleYear: '',
  vehicleMake: '',
  vehicleModel: '',
  wheelSize: '',
  service: '',
  date: '',
  startTime: '09:00',
  slot: 'shop' as Slot,
  notes: '',
};

function NewBookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState(BLANK_FORM);

  const set = (field: keyof typeof BLANK_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Booking created!');
    setForm(BLANK_FORM);
    onClose();
  };

  const inputCls = 'w-full rounded-lg border border-brand-graphite bg-brand-graphite/50 px-3 py-2 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/60 focus:outline-none transition-colors';
  const labelCls = 'block mb-1 text-caption font-medium text-brand-silver';

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-brand-graphite bg-brand-jet-light shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-brand-graphite px-6 py-4">
            <Dialog.Title className="font-display text-body-md text-brand-white">New Booking</Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-brand-ash hover:bg-brand-graphite hover:text-brand-white transition-colors">
              <X size={16} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Customer */}
            <div>
              <p className="mb-3 text-caption font-semibold uppercase tracking-wider text-brand-ash">Customer</p>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Name *</label>
                  <input required className={inputCls} placeholder="Full name" value={form.customerName} onChange={set('customerName')} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Email *</label>
                    <input required type="email" className={inputCls} placeholder="email@example.com" value={form.customerEmail} onChange={set('customerEmail')} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input type="tel" className={inputCls} placeholder="604-000-0000" value={form.customerPhone} onChange={set('customerPhone')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle */}
            <div>
              <p className="mb-3 text-caption font-semibold uppercase tracking-wider text-brand-ash">Vehicle</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Year</label>
                  <input className={inputCls} placeholder="2024" value={form.vehicleYear} onChange={set('vehicleYear')} />
                </div>
                <div>
                  <label className={labelCls}>Make</label>
                  <input className={inputCls} placeholder="BMW" value={form.vehicleMake} onChange={set('vehicleMake')} />
                </div>
                <div>
                  <label className={labelCls}>Model</label>
                  <input className={inputCls} placeholder='M3' value={form.vehicleModel} onChange={set('vehicleModel')} />
                </div>
                <div>
                  <label className={labelCls}>Wheel Size</label>
                  <select className={inputCls} value={form.wheelSize} onChange={set('wheelSize')}>
                    <option value="">Select size</option>
                    {['17"', '18"', '19"', '20"', '21"', '22"', '23"'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Service + Schedule */}
            <div>
              <p className="mb-3 text-caption font-semibold uppercase tracking-wider text-brand-ash">Service & Schedule</p>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Service *</label>
                  <select required className={inputCls} value={form.service} onChange={set('service')}>
                    <option value="">Select a service</option>
                    {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Date *</label>
                    <input required type="date" className={inputCls} value={form.date} onChange={set('date')} />
                  </div>
                  <div>
                    <label className={labelCls}>Start Time</label>
                    <select className={inputCls} value={form.startTime} onChange={set('startTime')}>
                      {TIMES_30MIN.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Slot</label>
                  <select className={inputCls} value={form.slot} onChange={set('slot')}>
                    <option value="shop">Shop Bay</option>
                    <option value="mobile_1">Mobile Truck 1</option>
                    <option value="mobile_2">Mobile Truck 2</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}>Notes</label>
              <textarea
                rows={3}
                className={cn(inputCls, 'resize-none')}
                placeholder="Any special instructions..."
                value={form.notes}
                onChange={set('notes')}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2 border-t border-brand-graphite">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-brand-graphite px-4 py-2 text-body-sm text-brand-silver hover:bg-brand-graphite transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-red px-4 py-2 text-body-sm font-semibold text-white hover:bg-brand-red/90 transition-colors"
              >
                Create Booking
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Week Grid View ───────────────────────────────────────────────────────────

function WeekGrid({
  weekStart,
  filteredBookings,
  onSelectBooking,
}: {
  weekStart: Date;
  filteredBookings: Booking[];
  onSelectBooking: (b: Booking) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const slots: Slot[] = ['shop', 'mobile_1', 'mobile_2'];

  return (
    <div className="overflow-x-auto rounded-xl border border-brand-graphite">
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr className="border-b border-brand-graphite">
            <th className="w-24 py-3 px-3 text-left text-caption font-semibold text-brand-ash bg-brand-graphite/20">
              Slot
            </th>
            {days.map((day) => {
              const isToday = isSameDay(day, TODAY);
              return (
                <th
                  key={day.toISOString()}
                  className={cn(
                    'py-3 px-2 text-center text-caption font-semibold bg-brand-graphite/20',
                    isToday ? 'text-brand-red' : 'text-brand-silver'
                  )}
                >
                  <div className={cn('text-caption font-semibold', isToday ? 'text-brand-red' : 'text-brand-ash')}>
                    {format(day, 'EEE')}
                  </div>
                  <div className={cn('font-mono text-body-sm', isToday ? 'text-brand-red' : 'text-brand-white')}>
                    {format(day, 'd')}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot, si) => (
            <tr
              key={slot}
              className={cn('border-b border-brand-graphite/60', si === slots.length - 1 && 'border-b-0')}
            >
              <td className="py-2 px-3 align-top bg-brand-graphite/10">
                <span className="text-caption font-medium text-brand-silver">{SLOT_ROW_LABELS[slot]}</span>
              </td>
              {days.map((day) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const dayBookings = filteredBookings.filter(
                  (b) => b.date === dayStr && b.slot === slot
                );
                const isToday = isSameDay(day, TODAY);
                return (
                  <td
                    key={day.toISOString()}
                    className={cn(
                      'align-top p-1.5 min-h-[80px]',
                      isToday && 'bg-brand-red/5'
                    )}
                  >
                    <div className="space-y-1 min-h-[72px]">
                      {dayBookings.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => onSelectBooking(b)}
                          className={cn(
                            'w-full rounded px-2 py-1 text-left transition-opacity hover:opacity-80',
                            STATUS_BLOCK_CLASSES[b.status]
                          )}
                        >
                          <p className="truncate text-caption font-semibold leading-tight">
                            {b.customerName.split(' ')[0]}
                          </p>
                          <p className="truncate text-caption leading-tight opacity-80">
                            {b.service.split(' - ')[0]}
                          </p>
                          <p className="text-caption opacity-60">{b.startTime}</p>
                        </button>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Day Grid View ────────────────────────────────────────────────────────────

function DayGrid({
  day,
  filteredBookings,
  onSelectBooking,
}: {
  day: Date;
  filteredBookings: Booking[];
  onSelectBooking: (b: Booking) => void;
}) {
  const dayStr = format(day, 'yyyy-MM-dd');
  const slots: Slot[] = ['shop', 'mobile_1', 'mobile_2'];
  const dayBookings = filteredBookings.filter((b) => b.date === dayStr);

  return (
    <div className="rounded-xl border border-brand-graphite overflow-hidden">
      <div className="grid grid-cols-3 divide-x divide-brand-graphite">
        {slots.map((slot) => {
          const slotBookings = dayBookings.filter((b) => b.slot === slot);
          return (
            <div key={slot}>
              <div className="bg-brand-graphite/20 px-4 py-3 border-b border-brand-graphite">
                <p className="text-caption font-semibold text-brand-silver">{SLOT_ROW_LABELS[slot]}</p>
              </div>
              <div className="p-3 space-y-2 min-h-[200px]">
                {slotBookings.length === 0 ? (
                  <p className="text-caption text-brand-ash text-center mt-8">No bookings</p>
                ) : (
                  slotBookings.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => onSelectBooking(b)}
                      className={cn(
                        'w-full rounded-lg px-3 py-2 text-left transition-opacity hover:opacity-80',
                        STATUS_BLOCK_CLASSES[b.status]
                      )}
                    >
                      <p className="text-body-sm font-semibold">{b.customerName}</p>
                      <p className="text-caption opacity-80 truncate">{b.service}</p>
                      <p className="text-caption opacity-60">{b.startTime}–{b.endTime}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Month Grid View ──────────────────────────────────────────────────────────

function MonthGrid({
  month,
  filteredBookings,
  onSelectBooking,
}: {
  month: Date;
  filteredBookings: Booking[];
  onSelectBooking: (b: Booking) => void;
}) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="rounded-xl border border-brand-graphite overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-brand-graphite bg-brand-graphite/20">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="py-2 text-center text-caption font-semibold text-brand-ash">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const dayBookings = filteredBookings.filter((b) => b.date === dayStr);
          const isToday = isSameDay(day, TODAY);
          const isCurrentMonth = day.getMonth() === month.getMonth();
          const isLast = i === days.length - 1;
          const isLastRow = i >= days.length - 7;

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[100px] p-1.5 border-b border-r border-brand-graphite/60',
                !isCurrentMonth && 'opacity-40',
                isToday && 'bg-brand-red/5',
                isLast && 'border-r-0',
                isLastRow && 'border-b-0'
              )}
            >
              <p
                className={cn(
                  'mb-1 text-right text-caption font-mono',
                  isToday ? 'text-brand-red font-bold' : 'text-brand-ash'
                )}
              >
                {format(day, 'd')}
              </p>
              <div className="space-y-0.5">
                {dayBookings.slice(0, 3).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => onSelectBooking(b)}
                    className={cn(
                      'w-full truncate rounded px-1.5 py-0.5 text-left text-caption transition-opacity hover:opacity-80',
                      STATUS_BLOCK_CLASSES[b.status]
                    )}
                  >
                    {b.customerName.split(' ')[0]} · {b.startTime}
                  </button>
                ))}
                {dayBookings.length > 3 && (
                  <p className="px-1 text-caption text-brand-ash">+{dayBookings.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <ArrowUpDown size={12} className="text-brand-ash/50" />;
  return sortDir === 'asc' ? <ArrowUp size={12} className="text-brand-red" /> : <ArrowDown size={12} className="text-brand-red" />;
}

function ListView({
  filteredBookings,
  onSelectBooking,
}: {
  filteredBookings: Booking[];
  onSelectBooking: (b: Booking) => void;
}) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const toggleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      else setSortDir('asc');
      return field;
    });
  }, []);

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = q
      ? filteredBookings.filter(
          (b) =>
            b.customerName.toLowerCase().includes(q) ||
            b.service.toLowerCase().includes(q) ||
            b.customerEmail.toLowerCase().includes(q) ||
            b.date.includes(q)
        )
      : filteredBookings;

    return [...filtered].sort((a, b) => {
      let va: string | number, vb: string | number;
      switch (sortField) {
        case 'date': va = a.date + a.startTime; vb = b.date + b.startTime; break;
        case 'startTime': va = a.startTime; vb = b.startTime; break;
        case 'customerName': va = a.customerName; vb = b.customerName; break;
        case 'service': va = a.service; vb = b.service; break;
        case 'amount': va = a.amount; vb = b.amount; break;
        case 'status': va = a.status; vb = b.status; break;
        default: va = a.date; vb = b.date;
      }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredBookings, search, sortField, sortDir]);

  const thCls = 'px-4 py-3 text-left text-caption font-semibold text-brand-ash uppercase tracking-wider cursor-pointer select-none hover:text-brand-white transition-colors';

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ash pointer-events-none" />
        <input
          type="text"
          placeholder="Search customer, service, date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-brand-graphite bg-brand-graphite/40 pl-9 pr-4 py-2.5 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/60 focus:outline-none transition-colors"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-brand-graphite">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="border-b border-brand-graphite bg-brand-graphite/20">
              <th className={thCls} onClick={() => toggleSort('date')}>
                <span className="flex items-center gap-1.5">Date <SortIcon field="date" sortField={sortField} sortDir={sortDir} /></span>
              </th>
              <th className={thCls} onClick={() => toggleSort('startTime')}>
                <span className="flex items-center gap-1.5">Time <SortIcon field="startTime" sortField={sortField} sortDir={sortDir} /></span>
              </th>
              <th className={thCls} onClick={() => toggleSort('customerName')}>
                <span className="flex items-center gap-1.5">Customer <SortIcon field="customerName" sortField={sortField} sortDir={sortDir} /></span>
              </th>
              <th className={thCls} onClick={() => toggleSort('service')}>
                <span className="flex items-center gap-1.5">Service <SortIcon field="service" sortField={sortField} sortDir={sortDir} /></span>
              </th>
              <th className={thCls} onClick={() => toggleSort('amount')}>
                <span className="flex items-center gap-1.5">Amount <SortIcon field="amount" sortField={sortField} sortDir={sortDir} /></span>
              </th>
              <th className={thCls} onClick={() => toggleSort('status')}>
                <span className="flex items-center gap-1.5">Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} /></span>
              </th>
              <th className="px-4 py-3 text-left text-caption font-semibold text-brand-ash uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-graphite/60">
            {rows.map((b) => (
              <tr
                key={b.id}
                className="group hover:bg-brand-graphite/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-mono text-body-sm text-brand-white">{format(parseISO(b.date), 'MMM d, yyyy')}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="flex items-center gap-1 font-mono text-body-sm text-brand-silver">
                    <Clock size={12} /> {b.startTime}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-body-sm font-medium text-brand-white">{b.customerName}</p>
                  <p className="text-caption text-brand-ash">{b.customerEmail}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-body-sm text-brand-smoke truncate max-w-[180px]">{b.service}</p>
                  <p className="text-caption text-brand-ash">{SLOT_LABELS[b.slot as Slot]}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-mono text-body-sm text-brand-white">${b.amount.toLocaleString()}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={b.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onSelectBooking(b)}
                      title="View"
                      className="rounded p-1.5 text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => toast.success(`${b.customerName} marked as complete`)}
                      title="Mark Complete"
                      className="rounded p-1.5 text-brand-silver hover:bg-green-500/20 hover:text-green-400 transition-colors"
                    >
                      <CheckCircle2 size={14} />
                    </button>
                    <button
                      onClick={() => toast.error(`Booking for ${b.customerName} cancelled`)}
                      title="Cancel"
                      className="rounded p-1.5 text-brand-silver hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-body-sm text-brand-ash">
                  No bookings match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-caption text-brand-ash">{rows.length} booking{rows.length !== 1 ? 's' : ''}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [displayMode, setDisplayMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState<Date>(startOfDay(TODAY));
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  // Date navigation
  const navigatePrev = () => {
    setCurrentDate((d) => {
      if (viewMode === 'day') return addDays(d, -1);
      if (viewMode === 'week') return subWeeks(d, 1);
      return subMonths(d, 1);
    });
  };
  const navigateNext = () => {
    setCurrentDate((d) => {
      if (viewMode === 'day') return addDays(d, 1);
      if (viewMode === 'week') return addWeeks(d, 1);
      return addMonths(d, 1);
    });
  };

  const navLabel = useMemo(() => {
    if (viewMode === 'day') return format(currentDate, 'MMMM d, yyyy');
    if (viewMode === 'week') {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const we = endOfWeek(currentDate, { weekStartsOn: 1 });
      return ws.getMonth() === we.getMonth()
        ? `${format(ws, 'MMM d')}–${format(we, 'd, yyyy')}`
        : `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`;
    }
    return format(currentDate, 'MMMM yyyy');
  }, [currentDate, viewMode]);

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => statusFilter === 'all' || b.status === statusFilter);
  }, [statusFilter]);

  const openDetail = (b: Booking) => {
    setSelectedBooking(b);
    setDetailOpen(true);
  };

  const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const pillBase = 'rounded-full px-3 py-1 text-caption font-medium transition-colors';

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-brand-graphite bg-brand-jet px-6 py-4">
        {/* Title */}
        <div className="mr-2">
          <h1 className="font-display text-display-sm text-brand-white">Bookings</h1>
        </div>

        {/* New Booking */}
        <button
          onClick={() => setNewOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-red px-3 py-2 text-body-sm font-semibold text-white hover:bg-brand-red/90 transition-colors"
        >
          <Plus size={15} /> New Booking
        </button>

        <div className="flex-1" />

        {/* Display mode: calendar vs list */}
        <div className="flex rounded-lg border border-brand-graphite overflow-hidden">
          <button
            onClick={() => setDisplayMode('calendar')}
            className={cn(
              'px-3 py-1.5 text-caption font-medium transition-colors',
              displayMode === 'calendar' ? 'bg-brand-graphite text-brand-white' : 'text-brand-ash hover:text-brand-silver'
            )}
          >
            Calendar
          </button>
          <button
            onClick={() => setDisplayMode('list')}
            className={cn(
              'px-3 py-1.5 text-caption font-medium transition-colors',
              displayMode === 'list' ? 'bg-brand-graphite text-brand-white' : 'text-brand-ash hover:text-brand-silver'
            )}
          >
            List
          </button>
        </div>

        {/* View mode: Day / Week / Month (calendar only) */}
        {displayMode === 'calendar' && (
          <div className="flex rounded-lg border border-brand-graphite overflow-hidden">
            {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={cn(
                  'px-3 py-1.5 text-caption font-medium capitalize transition-colors',
                  viewMode === v ? 'bg-brand-graphite text-brand-white' : 'text-brand-ash hover:text-brand-silver'
                )}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        {/* Date navigator (calendar only) */}
        {displayMode === 'calendar' && (
          <div className="flex items-center gap-1">
            <button
              onClick={navigatePrev}
              className="rounded-lg p-1.5 text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[160px] text-center text-body-sm font-medium text-brand-white">
              {navLabel}
            </span>
            <button
              onClick={navigateNext}
              className="rounded-lg p-1.5 text-brand-silver hover:bg-brand-graphite hover:text-brand-white transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2 border-b border-brand-graphite px-6 py-3 bg-brand-jet overflow-x-auto">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={cn(
              pillBase,
              statusFilter === value
                ? 'bg-brand-red text-white'
                : 'text-brand-silver hover:text-brand-white hover:bg-brand-graphite'
            )}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-caption text-brand-ash">
          {filteredBookings.length} total
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {displayMode === 'list' ? (
          <ListView filteredBookings={filteredBookings} onSelectBooking={openDetail} />
        ) : viewMode === 'week' ? (
          <WeekGrid weekStart={weekStart} filteredBookings={filteredBookings} onSelectBooking={openDetail} />
        ) : viewMode === 'day' ? (
          <DayGrid day={currentDate} filteredBookings={filteredBookings} onSelectBooking={openDetail} />
        ) : (
          <MonthGrid month={currentDate} filteredBookings={filteredBookings} onSelectBooking={openDetail} />
        )}
      </div>

      {/* Modals */}
      <BookingDetailModal
        booking={selectedBooking}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedBooking(null);
        }}
      />
      <NewBookingModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}
