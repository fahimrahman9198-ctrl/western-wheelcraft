'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  DollarSign,
  FileQuestion,
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { bookings } from '@/lib/demo-data/bookings';
import { invoices } from '@/lib/demo-data/invoices';
import { quotes } from '@/lib/demo-data/quotes';

const TODAY = '2026-05-07';

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-500/15 text-green-400 border-green-500/30',
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  completed: 'bg-brand-ash/40 text-brand-silver border-brand-ash/50',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const activity = [
  { time: '9:23 AM', text: 'John Smith booked Mercedes refinish', type: 'booking', href: '/admin/bookings' },
  { time: '9:01 AM', text: 'Quote sent to Sarah Lee ($1,400)', type: 'quote', href: '/admin/invoices' },
  { time: '8:45 AM', text: 'Payment received from BMW Vancouver ($3,200)', type: 'payment', href: '/admin/invoices' },
  { time: '8:30 AM', text: 'New lead: Kelowna customer (Audi)', type: 'lead', href: '/admin/customers' },
  { time: '8:12 AM', text: 'Booking confirmed — Porsche Centre 11 AM', type: 'booking', href: '/admin/bookings' },
  { time: '7:58 AM', text: 'Invoice WW-2026-038 marked as paid ($820)', type: 'payment', href: '/admin/invoices' },
  { time: '7:45 AM', text: 'Ferrari Vancouver requested 3 sets this week', type: 'booking', href: '/admin/bookings' },
  { time: '7:30 AM', text: 'Reminder sent to 2 customers for tomorrow', type: 'system', href: '/admin/bookings' },
  { time: 'Yesterday', text: 'New customer: Priya Nair (North Van)', type: 'lead', href: '/admin/customers' },
  { time: 'Yesterday', text: 'Invoice WW-2026-037 paid — McLaren Van. ($1,600)', type: 'payment', href: '/admin/invoices' },
];

const activityDot: Record<string, string> = {
  booking: 'bg-blue-500',
  quote: 'bg-yellow-500',
  payment: 'bg-green-500',
  lead: 'bg-purple-500',
  system: 'bg-brand-silver',
};

const attention = [
  {
    text: '2 quotes pending follow-up (3+ days old)',
    href: '/admin/invoices',
    icon: FileQuestion,
  },
  {
    text: 'Sarah Lee invoice unpaid (5 days overdue)',
    href: '/admin/invoices',
    icon: AlertCircle,
  },
  {
    text: "Tomorrow's 9 AM slot still open",
    href: '/admin/bookings',
    icon: Clock,
  },
];

export default function AdminOverviewPage() {
  const todayBookings = useMemo(
    () => bookings.filter((b) => b.date === TODAY && b.status !== 'cancelled'),
    []
  );
  const todayRevenue = useMemo(
    () => todayBookings.filter((b) => b.status === 'confirmed' || b.status === 'completed')
      .reduce((s, b) => s + b.amount, 0),
    [todayBookings]
  );
  const pendingQuotes = useMemo(
    () => quotes.filter((q) => q.status === 'new' || q.status === 'sent').length,
    []
  );
  const newLeads = useMemo(
    () => quotes.filter((q) => {
      const d = new Date(q.createdAt);
      const cutoff = new Date('2026-05-06T00:00:00Z');
      return d >= cutoff;
    }).length,
    []
  );

  const stats = [
    {
      label: "Today's Bookings",
      value: `${todayBookings.length} Jobs`,
      icon: CalendarDays,
      trend: '+2 vs yesterday',
      up: true,
      href: '/admin/bookings',
    },
    {
      label: "Today's Revenue",
      value: `$${todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: '+18% vs avg',
      up: true,
      href: '/admin/invoices',
    },
    {
      label: 'Pending Quotes',
      value: `${pendingQuotes} Quotes`,
      icon: FileQuestion,
      trend: '3 need follow-up',
      up: false,
      href: '/admin/invoices',
    },
    {
      label: 'New Leads (24h)',
      value: `${newLeads} Leads`,
      icon: Users,
      trend: 'From estimator',
      up: true,
      href: '/admin/customers',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-display-sm text-brand-white">Overview</h1>
        <p className="mt-1 text-body-sm text-brand-silver">Thursday, May 7, 2026</p>
      </div>

      {/* Stats */}
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
                {stat.up ? (
                  <TrendingUp size={14} className="text-green-400" />
                ) : (
                  <TrendingDown size={14} className="text-yellow-400" />
                )}
              </div>
              <p className="mt-3 font-mono text-display-sm text-brand-white">{stat.value}</p>
              <p className="mt-1 text-body-sm text-brand-silver">{stat.label}</p>
              <p className="mt-1 text-caption text-brand-ash">{stat.trend}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 rounded-xl border border-brand-graphite bg-brand-jet-light">
          <div className="flex items-center justify-between border-b border-brand-graphite px-5 py-4">
            <h2 className="font-display text-body-md text-brand-white">Today&rsquo;s Schedule</h2>
            <Link
              href="/admin/bookings"
              className="flex items-center gap-1 text-caption text-brand-silver hover:text-brand-red transition-colors"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-brand-graphite/60">
            {todayBookings.length === 0 ? (
              <p className="px-5 py-8 text-center text-body-sm text-brand-silver">No bookings today</p>
            ) : (
              todayBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-14 shrink-0 text-center">
                    <p className="font-mono text-body-sm text-brand-smoke">{b.startTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-body-sm font-medium text-brand-white">
                      {b.customerName}
                    </p>
                    <p className="truncate text-caption text-brand-silver">{b.service}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-caption font-medium ${STATUS_COLORS[b.status]}`}
                  >
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Needs Attention */}
          <div className="rounded-xl border border-brand-red/30 bg-brand-red/5">
            <div className="flex items-center gap-2 border-b border-brand-red/20 px-5 py-4">
              <AlertCircle size={16} className="text-brand-red" />
              <h2 className="font-display text-body-md text-brand-white">Needs Attention</h2>
            </div>
            <div className="divide-y divide-brand-red/10">
              {attention.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.text}
                    href={item.href}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-brand-red/10 transition-colors"
                  >
                    <Icon size={14} className="mt-0.5 shrink-0 text-brand-red" />
                    <p className="text-body-sm text-brand-smoke">{item.text}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="rounded-xl border border-brand-graphite bg-brand-jet-light">
        <div className="border-b border-brand-graphite px-5 py-4">
          <h2 className="font-display text-body-md text-brand-white">Recent Activity</h2>
        </div>
        <div className="divide-y divide-brand-graphite/60">
          {activity.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-brand-graphite/30 transition-colors"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${activityDot[item.type]}`} />
              <span className="w-20 shrink-0 font-mono text-caption text-brand-silver">{item.time}</span>
              <p className="flex-1 text-body-sm text-brand-smoke">{item.text}</p>
              <CheckCircle2 size={13} className="shrink-0 text-brand-ash" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
