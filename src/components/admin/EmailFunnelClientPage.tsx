'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Mail,
  PauseCircle,
  PlayCircle,
  Save,
  Send,
  Users,
  XCircle,
} from 'lucide-react';
import type { EmailFunnelSettings } from '@/lib/email-automations';

type FunnelData = Awaited<ReturnType<typeof import('@/lib/email-automations').getEmailFunnelAdminData>>;

interface EmailFunnelClientPageProps {
  initialData: FunnelData;
}

function number(value: number | undefined) {
  return (value ?? 0).toLocaleString('en-CA');
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return 'Not scheduled';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Mail;
}) {
  return (
    <div className="rounded-xl border border-brand-ash bg-brand-graphite-light p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-caption uppercase tracking-widest text-brand-smoke">{label}</p>
          <p className="mt-3 font-mono text-display-xs text-brand-white">{value}</p>
          <p className="mt-1 text-caption text-brand-silver">{note}</p>
        </div>
        <div className="rounded-lg bg-brand-graphite p-2 text-brand-red">
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

export function EmailFunnelClientPage({ initialData }: EmailFunnelClientPageProps) {
  const [settings, setSettings] = useState<EmailFunnelSettings>(initialData.settings);
  const [saving, setSaving] = useState(false);

  const templateEntries = useMemo(
    () => Object.entries(settings.templates) as Array<[keyof EmailFunnelSettings['templates'], EmailFunnelSettings['templates'][keyof EmailFunnelSettings['templates']]]>,
    [settings.templates]
  );

  async function saveSettings(nextSettings = settings) {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/email-funnel/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextSettings),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error ?? 'Failed to save email funnel settings.');
      }

      const saved = await response.json();
      setSettings(saved);
      toast.success('Email funnel settings saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save email funnel settings.');
    } finally {
      setSaving(false);
    }
  }

  function toggleGlobal() {
    const next = { ...settings, enabled: !settings.enabled };
    setSettings(next);
    void saveSettings(next);
  }

  return (
    <div className="max-w-[1440px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-display-sm text-brand-white">Email Funnel</h1>
          <p className="mt-1 text-body-sm text-brand-smoke">
            Manage automated follow-ups, reminders, post-service emails, delivery tracking, and customer segments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleGlobal}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-body-sm font-semibold text-white transition hover:bg-brand-red-dark disabled:opacity-60"
          >
            {settings.enabled ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
            {settings.enabled ? 'Pause Funnel' : 'Resume Funnel'}
          </button>
          <button
            type="button"
            onClick={() => saveSettings()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-ash bg-brand-graphite-light px-4 py-2 text-body-sm font-semibold text-brand-white transition hover:border-brand-red disabled:opacity-60"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-brand-ash bg-brand-graphite p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${settings.enabled ? 'bg-emerald-400' : 'bg-brand-red'}`} />
            <p className="font-display text-body-md text-brand-white">
              Funnel is {settings.enabled ? 'active' : 'paused'}
            </p>
          </div>
          <p className="text-body-sm text-brand-smoke">
            Paused means records still save, but automated emails do not send.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Emails Sent"
          value={number(initialData.analytics.emailsSent)}
          note="Recent logged outbound emails"
          icon={Send}
        />
        <MetricCard
          label="Failed Sends"
          value={number(initialData.analytics.failedSends)}
          note="Automation rows marked failed"
          icon={XCircle}
        />
        <MetricCard
          label="Follow-up Conversion"
          value={`${number(initialData.analytics.quoteFollowUpConversion)}%`}
          note="Quotes booked/accepted after follow-up"
          icon={BarChart3}
        />
        <MetricCard
          label="Booked After Follow-up"
          value={number(initialData.analytics.bookedAfterFollowUp)}
          note="Bookings linked to followed quotes"
          icon={CheckCircle2}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <section className="rounded-xl border border-brand-ash bg-brand-graphite-light p-5 shadow-card">
          <h2 className="font-display text-body-lg text-brand-white">Sequences</h2>
          <p className="mt-1 text-body-sm text-brand-smoke">
            Turn individual automations on or off without changing Vercel environment variables.
          </p>

          <div className="mt-5 space-y-3">
            {Object.entries(settings.sequences).map(([key, sequence]) => (
              <label
                key={key}
                className="flex items-center justify-between gap-4 rounded-lg border border-brand-ash bg-brand-graphite px-4 py-3"
              >
                <div>
                  <p className="text-body-sm font-semibold text-brand-white">{sequence.label}</p>
                  <p className="font-mono text-caption text-brand-smoke">{key}</p>
                </div>
                <input
                  type="checkbox"
                  checked={sequence.enabled}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      sequences: {
                        ...current.sequences,
                        [key]: { ...sequence, enabled: event.target.checked },
                      },
                    }))
                  }
                  className="h-5 w-5 accent-brand-red"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-brand-ash bg-brand-graphite-light p-5 shadow-card">
          <h2 className="font-display text-body-lg text-brand-white">Customer Segments</h2>
          <p className="mt-1 text-body-sm text-brand-smoke">Live segmentation from Neon records.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ['Quote requested, not booked', initialData.analytics.segments.quoteRequestedNotBooked],
              ['Booked, not completed', initialData.analytics.segments.bookedNotCompleted],
              ['Completed service', initialData.analytics.segments.completedService],
              ['Dealership/B2B leads', initialData.analytics.segments.dealershipB2BLeads],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-brand-ash bg-brand-graphite p-4">
                <div className="flex items-center gap-2 text-brand-red">
                  <Users size={15} />
                  <span className="font-mono text-display-xs text-brand-white">{number(value as number)}</span>
                </div>
                <p className="mt-2 text-body-sm text-brand-smoke">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-brand-ash bg-brand-graphite-light shadow-card">
        <div className="border-b border-brand-ash px-5 py-4">
          <h2 className="font-display text-body-lg text-brand-white">Automation Queue</h2>
          <p className="mt-1 text-body-sm text-brand-smoke">Latest scheduled, sent, skipped, failed, and cancelled automation records.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-brand-ash">
                <th className="px-5 py-3 text-left font-display text-caption uppercase tracking-wider text-brand-smoke">Customer</th>
                <th className="px-4 py-3 text-left font-display text-caption uppercase tracking-wider text-brand-smoke">Type</th>
                <th className="px-4 py-3 text-left font-display text-caption uppercase tracking-wider text-brand-smoke">Status</th>
                <th className="px-4 py-3 text-left font-display text-caption uppercase tracking-wider text-brand-smoke">Scheduled</th>
                <th className="px-4 py-3 text-left font-display text-caption uppercase tracking-wider text-brand-smoke">Last Error</th>
              </tr>
            </thead>
            <tbody>
              {initialData.automations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-brand-smoke">
                    No automation records yet.
                  </td>
                </tr>
              ) : (
                initialData.automations.map((automation) => (
                  <tr key={automation.id} className="border-b border-brand-ash/50 last:border-b-0">
                    <td className="px-5 py-3.5 text-brand-white">{automation.customer?.name ?? 'Unknown customer'}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-caption text-brand-smoke">{automation.kind}</span>
                      <span className="ml-2 font-mono text-caption text-brand-silver">#{automation.sequenceStep}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full border border-brand-ash bg-brand-graphite px-2 py-1 font-mono text-caption text-brand-smoke">
                        {automation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-brand-smoke">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={13} />
                        {formatDate(automation.scheduledFor)}
                      </span>
                    </td>
                    <td className="max-w-sm truncate px-4 py-3.5 text-brand-silver">{automation.lastError ?? ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-brand-ash bg-brand-graphite-light p-5 shadow-card">
        <h2 className="font-display text-body-lg text-brand-white">Editable Templates</h2>
        <p className="mt-1 text-body-sm text-brand-smoke">
          Supported variables: {'{{customerName}}'}, {'{{quoteNumber}}'}, {'{{bookingNumber}}'}, {'{{service}}'}, {'{{region}}'}, {'{{estimatedTotal}}'}, {'{{bookingDate}}'}, {'{{bookingTime}}'}.
        </p>

        <div className="mt-5 space-y-5">
          {templateEntries.map(([key, template]) => (
            <div key={String(key)} className="rounded-lg border border-brand-ash bg-brand-graphite p-4">
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-display text-body-md text-brand-white">{template.name}</h3>
                <span className="font-mono text-caption text-brand-smoke">{String(key)}</span>
              </div>
              <label className="block text-caption uppercase tracking-wider text-brand-smoke">
                Subject
                <input
                  value={template.subject}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      templates: {
                        ...current.templates,
                        [key]: { ...template, subject: event.target.value },
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-brand-ash bg-brand-jet px-3 py-2 text-body-sm text-brand-white outline-none focus:border-brand-red"
                />
              </label>
              <label className="mt-3 block text-caption uppercase tracking-wider text-brand-smoke">
                Body
                <textarea
                  value={template.body}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      templates: {
                        ...current.templates,
                        [key]: { ...template, body: event.target.value },
                      },
                    }))
                  }
                  rows={7}
                  className="mt-1 w-full resize-y rounded-lg border border-brand-ash bg-brand-jet px-3 py-2 text-body-sm text-brand-white outline-none focus:border-brand-red"
                />
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
