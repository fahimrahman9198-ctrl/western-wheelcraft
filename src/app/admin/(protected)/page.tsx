import Link from 'next/link';
import {
  CalendarDays,
  FileQuestion,
  Users,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { getAdminOverviewData } from '@/lib/admin-data';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  sent: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  accepted: 'bg-green-500/15 text-green-400 border-green-500/30',
  declined: 'bg-red-500/15 text-red-400 border-red-500/30',
  expired: 'bg-brand-ash/40 text-brand-silver border-brand-ash/50',
};

const sourceLabels: Record<string, string> = {
  estimator: 'Estimator',
  contact_form: 'Contact form',
  phone: 'Phone',
  email: 'Email',
  referral: 'Referral',
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function money(value: string | null): string {
  if (!value) return 'No estimate';
  return Number(value).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
}

export default async function AdminOverviewPage() {
  const { recentQuotes, customerCount, pendingQuoteCount, newLeadCount, bookingCount } = await getAdminOverviewData();

  const stats = [
    {
      label: 'New Leads (24h)',
      value: `${newLeadCount} Leads`,
      icon: Users,
      trend: 'From live forms',
      href: '/admin/leads',
    },
    {
      label: 'Pending Quotes',
      value: `${pendingQuoteCount} Quotes`,
      icon: FileQuestion,
      trend: 'New or sent',
      href: '/admin/leads',
    },
    {
      label: 'Booking Requests',
      value: `${bookingCount} Requests`,
      icon: CalendarDays,
      trend: 'Stored in Neon',
      href: '/admin/bookings',
    },
    {
      label: 'Customers',
      value: `${customerCount} Records`,
      icon: Users,
      trend: 'Stored in Neon',
      href: '/admin/customers',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-display-sm text-brand-white">Overview</h1>
        <p className="mt-1 text-body-sm text-brand-silver">
          Live lead and booking capture are connected. Invoices and payments remain staged for later phases.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-xl border border-brand-graphite bg-brand-jet-light p-5 hover:border-brand-graphite-light transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-brand-graphite p-2">
                  <Icon size={18} className="text-brand-red" />
                </div>
                <TrendingUp size={14} className="text-green-400" />
              </div>
              <p className="mt-3 font-mono text-display-sm text-brand-white">{stat.value}</p>
              <p className="mt-1 text-body-sm text-brand-silver">{stat.label}</p>
              <p className="mt-1 text-caption text-brand-ash">{stat.trend}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-brand-graphite bg-brand-jet-light">
          <div className="flex items-center justify-between border-b border-brand-graphite px-5 py-4">
            <h2 className="font-display text-body-md text-brand-white">Recent Leads</h2>
            <Link
              href="/admin/leads"
              className="flex items-center gap-1 text-caption text-brand-silver hover:text-brand-red transition-colors"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-brand-graphite/60">
            {recentQuotes.length === 0 ? (
              <p className="px-5 py-8 text-center text-body-sm text-brand-silver">
                No real leads yet. Submit the contact form or quote estimator to populate this view.
              </p>
            ) : (
              recentQuotes.map((quote) => (
                <Link
                  key={quote.id}
                  href="/admin/leads"
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-brand-graphite/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-body-sm font-medium text-brand-white">
                      {quote.customerName}
                    </p>
                    <p className="truncate text-caption text-brand-silver">
                      {quote.requestedService ?? sourceLabels[quote.source] ?? quote.source}
                    </p>
                  </div>
                  <p className="hidden font-mono text-caption text-brand-silver sm:block">
                    {money(quote.estimatedTotal)}
                  </p>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-caption font-medium capitalize ${STATUS_COLORS[quote.status]}`}
                  >
                    {quote.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-brand-red/30 bg-brand-red/5">
            <div className="flex items-center gap-2 border-b border-brand-red/20 px-5 py-4">
              <AlertCircle size={16} className="text-brand-red" />
              <h2 className="font-display text-body-md text-brand-white">Needs Attention</h2>
            </div>
            <div className="divide-y divide-brand-red/10">
              <Link
                href="/admin/leads"
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-brand-red/10 transition-colors"
              >
                <FileQuestion size={14} className="mt-0.5 shrink-0 text-brand-red" />
                <p className="text-body-sm text-brand-smoke">
                  {pendingQuoteCount} quote request{pendingQuoteCount === 1 ? '' : 's'} waiting for follow-up.
                </p>
              </Link>
              <Link
                href="/admin/bookings"
                className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-brand-red/10"
              >
                <Clock size={14} className="mt-0.5 shrink-0 text-brand-red" />
                <p className="text-body-sm text-brand-smoke">
                  Booking confirmation, rescheduling, pricing, and completion controls are available.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-brand-graphite bg-brand-jet-light">
        <div className="border-b border-brand-graphite px-5 py-4">
          <h2 className="font-display text-body-md text-brand-white">Recent Activity</h2>
        </div>
        <div className="divide-y divide-brand-graphite/60">
          {recentQuotes.length === 0 ? (
            <p className="px-5 py-8 text-center text-body-sm text-brand-silver">No activity yet</p>
          ) : (
            recentQuotes.map((quote) => (
              <Link
                key={quote.id}
                href="/admin/leads"
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-brand-graphite/30 transition-colors"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-brand-red" />
                <span className="w-28 shrink-0 font-mono text-caption text-brand-silver">
                  {formatDate(quote.createdAt)}
                </span>
                <p className="flex-1 text-body-sm text-brand-smoke">
                  New {sourceLabels[quote.source] ?? quote.source} lead: {quote.customerName}
                </p>
                <CheckCircle2 size={13} className="shrink-0 text-brand-ash" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
