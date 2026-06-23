'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Save } from 'lucide-react';
import { toast } from 'sonner';

export interface AdminActivityView {
  id: string;
  summary: string;
  adminUsername: string;
  adminRole: string;
  createdAt: string;
}

const fieldClass =
  'h-10 w-full rounded-md border border-brand-ash bg-[#16161B] px-3 text-body-sm text-brand-white outline-none transition-colors focus:border-brand-red disabled:opacity-50';
const textareaClass =
  'min-h-24 w-full resize-y rounded-md border border-brand-ash bg-[#16161B] px-3 py-2 text-body-sm text-brand-white outline-none transition-colors placeholder:text-brand-silver focus:border-brand-red disabled:opacity-50';

async function requestJson(url: string, method: 'PATCH' | 'POST', body: object) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(data.error ?? 'Unable to save changes.');
  return data;
}

function ActivityHistory({ activities }: { activities: AdminActivityView[] }) {
  if (activities.length === 0) return null;
  return (
    <div className="mt-4 border-t border-brand-ash pt-3">
      <p className="text-caption font-semibold uppercase text-brand-silver">Recent admin activity</p>
      <div className="mt-2 space-y-2">
        {activities.slice(0, 3).map((activity) => (
          <div key={activity.id} className="text-caption text-brand-smoke">
            <p className="text-brand-smoke">{activity.summary}</p>
            <p className="mt-0.5">
              {activity.adminUsername} · {activity.adminRole} ·{' '}
              {new Date(activity.createdAt).toLocaleString('en-CA')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeadWorkflowControls({
  quoteId,
  status: initialStatus,
  estimatedSubtotal,
  activities,
}: {
  quoteId: string;
  status: string;
  estimatedSubtotal: string | null;
  activities: AdminActivityView[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [subtotal, setSubtotal] = useState(estimatedSubtotal ?? '');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    const parsedSubtotal = subtotal === '' ? undefined : Number(subtotal);
    if (parsedSubtotal !== undefined && !Number.isFinite(parsedSubtotal)) {
      toast.error('Enter a valid quote subtotal.');
      return;
    }
    setSaving(true);
    try {
      await requestJson(`/api/admin/quotes/${quoteId}`, 'PATCH', {
        status,
        estimatedSubtotal: parsedSubtotal,
        note: note.trim() || undefined,
      });
      setNote('');
      toast.success('Quote workflow updated.');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update quote.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-brand-ash bg-[#16161B] p-4">
      <h3 className="font-display text-body-md text-brand-white">Lead workflow</h3>
      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2fr_auto] lg:items-end">
        <label className="text-caption text-brand-smoke">
          Status
          <select className={`${fieldClass} mt-1`} value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="accepted">Accepted</option>
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="text-caption text-brand-smoke">
          Subtotal (CAD)
          <input
            className={`${fieldClass} mt-1`}
            type="number"
            min="0"
            max="1000000"
            step="0.01"
            value={subtotal}
            onChange={(event) => setSubtotal(event.target.value)}
          />
        </label>
        <label className="text-caption text-brand-smoke">
          Internal note
          <input
            className={`${fieldClass} mt-1`}
            value={note}
            maxLength={5000}
            placeholder="Add context for the team"
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-red px-4 text-body-sm font-semibold text-white transition-colors hover:bg-brand-red-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={15} /> {saving ? 'Saving' : 'Save'}
        </button>
      </div>
      <ActivityHistory activities={activities} />
    </section>
  );
}

export function BookingWorkflowControls({
  bookingId,
  status: initialStatus,
  amount: initialAmount,
  scheduledDate: initialDate,
  startTime: initialTime,
  activities,
}: {
  bookingId: string;
  status: string;
  amount: string | null;
  scheduledDate: string;
  startTime: string;
  activities: AdminActivityView[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [amount, setAmount] = useState(initialAmount ?? '');
  const [scheduledDate, setScheduledDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialTime);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    const parsedAmount = amount === '' ? undefined : Number(amount);
    if (parsedAmount !== undefined && !Number.isFinite(parsedAmount)) {
      toast.error('Enter a valid booking amount.');
      return;
    }
    setSaving(true);
    try {
      await requestJson(`/api/admin/bookings/${bookingId}`, 'PATCH', {
        status,
        amount: parsedAmount,
        scheduledDate,
        startTime,
        note: note.trim() || undefined,
      });
      setNote('');
      toast.success('Booking updated.');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update booking.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-brand-ash bg-[#16161B] p-4">
      <h3 className="font-display text-body-md text-brand-white">Booking workflow</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="text-caption text-brand-smoke">
          Status
          <select className={`${fieldClass} mt-1`} value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="text-caption text-brand-smoke">
          Amount (CAD)
          <input className={`${fieldClass} mt-1`} type="number" min="0" max="1000000" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </label>
        <label className="text-caption text-brand-smoke">
          Date
          <input className={`${fieldClass} mt-1`} type="date" value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} />
        </label>
        <label className="text-caption text-brand-smoke">
          Time
          <input className={`${fieldClass} mt-1`} type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
        </label>
        <button type="button" onClick={save} disabled={saving} className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-red px-4 text-body-sm font-semibold text-white transition-colors hover:bg-brand-red-hover disabled:cursor-not-allowed disabled:opacity-50">
          <Save size={15} /> {saving ? 'Saving' : 'Save'}
        </button>
      </div>
      <label className="mt-3 block text-caption text-brand-smoke">
        Internal note
        <textarea className={`${textareaClass} mt-1`} value={note} maxLength={5000} placeholder="Add booking context for the team" onChange={(event) => setNote(event.target.value)} />
      </label>
      <ActivityHistory activities={activities} />
    </section>
  );
}

export function CustomerNoteForm({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!body.trim()) return;
    setSaving(true);
    try {
      await requestJson(`/api/admin/customers/${customerId}/notes`, 'POST', { body: body.trim() });
      setBody('');
      toast.success('Customer note added.');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to add note.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 border-t border-brand-ash pt-4">
      <label className="text-caption font-semibold uppercase text-brand-silver">
        Internal note
        <textarea className={`${textareaClass} mt-2`} value={body} maxLength={5000} placeholder="Visible only to admin users" onChange={(event) => setBody(event.target.value)} />
      </label>
      <button type="button" onClick={save} disabled={saving || !body.trim()} className="mt-2 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-brand-red px-3 text-body-sm font-semibold text-white transition-colors hover:bg-brand-red-hover disabled:cursor-not-allowed disabled:opacity-50">
        <MessageSquare size={14} /> {saving ? 'Adding' : 'Add note'}
      </button>
    </div>
  );
}
