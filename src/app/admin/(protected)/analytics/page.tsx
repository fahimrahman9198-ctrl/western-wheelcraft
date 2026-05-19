'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Download, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type TimeRange = 'today' | '7days' | '30days' | '90days' | 'year' | 'custom';

interface MetricData {
  revenue: string;
  revenueTrend: number;
  bookings: number;
  bookingsTrend: number;
  avgJobValue: string;
  avgJobValueTrend: number;
  newCustomers: number;
  newCustomersTrend: number;
}

// ─── Hardcoded data per time range ───────────────────────────────────────────

const METRICS: Record<TimeRange, MetricData> = {
  today: {
    revenue: '$1,840',
    revenueTrend: 12,
    bookings: 3,
    bookingsTrend: -5,
    avgJobValue: '$613',
    avgJobValueTrend: 18,
    newCustomers: 1,
    newCustomersTrend: 0,
  },
  '7days': {
    revenue: '$11,200',
    revenueTrend: 8,
    bookings: 16,
    bookingsTrend: 4,
    avgJobValue: '$700',
    avgJobValueTrend: 3,
    newCustomers: 4,
    newCustomersTrend: -10,
  },
  '30days': {
    revenue: '$48,200',
    revenueTrend: 23,
    bookings: 67,
    bookingsTrend: 12,
    avgJobValue: '$720',
    avgJobValueTrend: 8,
    newCustomers: 14,
    newCustomersTrend: 5,
  },
  '90days': {
    revenue: '$138,600',
    revenueTrend: 17,
    bookings: 193,
    bookingsTrend: 9,
    avgJobValue: '$718',
    avgJobValueTrend: 6,
    newCustomers: 38,
    newCustomersTrend: 14,
  },
  year: {
    revenue: '$524,800',
    revenueTrend: 31,
    bookings: 729,
    bookingsTrend: 22,
    avgJobValue: '$720',
    avgJobValueTrend: 7,
    newCustomers: 142,
    newCustomersTrend: 19,
  },
  custom: {
    revenue: '$48,200',
    revenueTrend: 23,
    bookings: 67,
    bookingsTrend: 12,
    avgJobValue: '$720',
    avgJobValueTrend: 8,
    newCustomers: 14,
    newCustomersTrend: 5,
  },
};

// 30-day daily revenue (Apr 7 – May 6)
const DAILY_REVENUE = [
  { date: 'Apr 7', current: 0, previous: 820 },
  { date: 'Apr 8', current: 1420, previous: 950 },
  { date: 'Apr 9', current: 2100, previous: 1300 },
  { date: 'Apr 10', current: 1750, previous: 1100 },
  { date: 'Apr 11', current: 980, previous: 760 },
  { date: 'Apr 12', current: 2450, previous: 1800 },
  { date: 'Apr 13', current: 3100, previous: 2200 },
  { date: 'Apr 14', current: 0, previous: 0 },
  { date: 'Apr 15', current: 1600, previous: 1200 },
  { date: 'Apr 16', current: 2200, previous: 1500 },
  { date: 'Apr 17', current: 1850, previous: 1400 },
  { date: 'Apr 18', current: 900, previous: 650 },
  { date: 'Apr 19', current: 2800, previous: 2100 },
  { date: 'Apr 20', current: 3200, previous: 2400 },
  { date: 'Apr 21', current: 0, previous: 0 },
  { date: 'Apr 22', current: 1100, previous: 850 },
  { date: 'Apr 23', current: 2400, previous: 1750 },
  { date: 'Apr 24', current: 1950, previous: 1600 },
  { date: 'Apr 25', current: 3500, previous: 2700 },
  { date: 'Apr 26', current: 2650, previous: 2000 },
  { date: 'Apr 27', current: 3000, previous: 2300 },
  { date: 'Apr 28', current: 0, previous: 0 },
  { date: 'Apr 29', current: 1400, previous: 900 },
  { date: 'Apr 30', current: 2100, previous: 1500 },
  { date: 'May 1', current: 1750, previous: 1350 },
  { date: 'May 2', current: 2300, previous: 1700 },
  { date: 'May 3', current: 2900, previous: 2100 },
  { date: 'May 4', current: 3400, previous: 2600 },
  { date: 'May 5', current: 0, previous: 0 },
  { date: 'May 6', current: 1840, previous: 1300 },
];

const SERVICE_BREAKDOWN = [
  { name: 'OEM Refinish', pct: 60, amount: '$28,920' },
  { name: 'Curb Rash Repair', pct: 25, amount: '$12,050' },
  { name: 'Diamond Cut', pct: 10, amount: '$4,820' },
  { name: 'Two-Tone', pct: 3, amount: '$1,446' },
  { name: 'Custom Color', pct: 2, amount: '$964' },
];

const REGION_BREAKDOWN = [
  { name: 'Lower Mainland Shop', pct: 65, amount: '$31,330' },
  { name: 'Lower Mainland Mobile', pct: 20, amount: '$9,640' },
  { name: 'Vancouver Island', pct: 10, amount: '$4,820' },
  { name: 'Okanagan & Interior', pct: 5, amount: '$2,410' },
];

const LEAD_SOURCES = [
  { name: 'Quote Estimator', value: 42, leads: 28, color: '#D81E2A' },
  { name: 'Website Contact', value: 21, leads: 14, color: '#3B82F6' },
  { name: 'Phone Calls', value: 18, leads: 12, color: '#22C55E' },
  { name: 'Trade Partners', value: 12, leads: 8, color: '#A855F7' },
  { name: 'Email Campaigns', value: 7, leads: 5, color: '#F97316' },
];

const TOP_CUSTOMERS = [
  { rank: 1, name: 'BMW Vancouver', jobs: 87, spent: '$74,200', lastVisit: 'May 5, 2026' },
  { rank: 2, name: 'Ferrari Vancouver', jobs: 52, spent: '$81,400', lastVisit: 'May 3, 2026' },
  { rank: 3, name: 'Mercedes-Benz Burnaby', jobs: 74, spent: '$58,900', lastVisit: 'Apr 30, 2026' },
  { rank: 4, name: 'Audi Downtown', jobs: 45, spent: '$43,200', lastVisit: 'Apr 28, 2026' },
  { rank: 5, name: 'Porsche Centre Vancouver', jobs: 38, spent: '$36,800', lastVisit: 'Apr 25, 2026' },
  { rank: 6, name: 'Lamborghini Vancouver', jobs: 21, spent: '$29,400', lastVisit: 'Apr 22, 2026' },
  { rank: 7, name: 'James R.', jobs: 14, spent: '$11,200', lastVisit: 'May 1, 2026' },
  { rank: 8, name: 'Lexus Richmond', jobs: 31, spent: '$24,800', lastVisit: 'Apr 18, 2026' },
  { rank: 9, name: 'Sarah K.', jobs: 9, spent: '$7,650', lastVisit: 'Apr 15, 2026' },
  { rank: 10, name: 'AutoNation Victoria', jobs: 18, spent: '$15,300', lastVisit: 'Apr 10, 2026' },
];

const FUNNEL = [
  { label: 'Visitors', count: 2450, pct: 100, drop: null },
  { label: 'Quote Requests', count: 87, pct: 3.5, drop: '-96.4%' },
  { label: 'Bookings', count: 67, pct: 77, drop: '-23%' },
  { label: 'Paid', count: 64, pct: 96, drop: '-4%' },
];

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  today: 'Today',
  '7days': '7 days',
  '30days': '30 days',
  '90days': '90 days',
  year: 'Year',
  custom: 'Custom',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TrendBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-mono font-medium ${
        positive
          ? 'bg-success/10 text-success'
          : 'bg-brand-red/10 text-brand-red'
      }`}
    >
      {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {positive ? '+' : ''}
      {value}%
    </span>
  );
}

function MetricCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string | number;
  trend: number;
}) {
  return (
    <div className="rounded-2xl bg-brand-graphite border border-brand-graphite p-6 flex flex-col gap-3 shadow-card">
      <p className="text-body-sm text-brand-silver uppercase tracking-widest font-display">{label}</p>
      <p className="font-mono text-display-sm text-brand-white">{value}</p>
      <TrendBadge value={trend} />
    </div>
  );
}

function HorizontalBar({ pct, color = 'brand-red' }: { pct: number; color?: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-brand-ash overflow-hidden">
      <div
        className={`h-full rounded-full bg-${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-brand-graphite border border-brand-ash p-3 shadow-card-hover text-body-sm">
      <p className="text-brand-smoke font-display mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name === 'previous' ? 'Prev: ' : 'Revenue: '}$
          {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; leads: number }; fill: string }>;
}) => {
  if (!active || !payload?.length) return null;
  const { name, value, leads } = payload[0].payload;
  return (
    <div className="rounded-xl bg-brand-graphite border border-brand-ash p-3 shadow-card-hover text-body-sm">
      <p className="text-brand-white font-display">{name}</p>
      <p className="font-mono text-brand-smoke">{value}% — {leads} leads</p>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [range, setRange] = useState<TimeRange>('30days');
  const metrics = METRICS[range];

  function handleExport(type: 'CSV' | 'PDF') {
    toast.success(`Report exported (demo mode)`, {
      description: `${type} download would begin in a live environment.`,
    });
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1440px]">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-display-sm text-brand-white">Analytics</h1>
          <p className="text-body-sm text-brand-silver mt-1">Performance overview for Western Wheelcraft</p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          {/* Time range pills */}
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-brand-graphite p-1 border border-brand-graphite">
            {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-lg px-3 py-1.5 text-caption font-display transition-colors ${
                  range === r
                    ? 'bg-brand-red text-brand-white shadow'
                    : 'text-brand-silver hover:text-brand-white hover:bg-brand-ash'
                }`}
              >
                {TIME_RANGE_LABELS[r]}
              </button>
            ))}
          </div>

          {/* Export buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('CSV')}
              className="flex items-center gap-1.5 rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-1.5 text-caption text-brand-silver hover:text-brand-white hover:border-brand-ash transition-colors"
            >
              <Download size={13} />
              Download CSV
            </button>
            <button
              onClick={() => handleExport('PDF')}
              className="flex items-center gap-1.5 rounded-lg border border-brand-graphite bg-brand-graphite px-3 py-1.5 text-caption text-brand-silver hover:text-brand-white hover:border-brand-ash transition-colors"
            >
              <FileText size={13} />
              Download PDF Report
            </button>
          </div>
        </div>
      </div>

      {/* ── Top metric cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue" value={metrics.revenue} trend={metrics.revenueTrend} />
        <MetricCard label="Total Bookings" value={metrics.bookings} trend={metrics.bookingsTrend} />
        <MetricCard label="Avg. Job Value" value={metrics.avgJobValue} trend={metrics.avgJobValueTrend} />
        <MetricCard label="New Customers" value={metrics.newCustomers} trend={metrics.newCustomersTrend} />
      </div>

      {/* ── Revenue bar chart ────────────────────────────────── */}
      <div className="rounded-2xl bg-brand-graphite border border-brand-graphite p-6 shadow-card">
        <h2 className="font-display text-body-md text-brand-white mb-1">Daily Revenue</h2>
        <p className="text-caption text-brand-silver mb-6">
          <span className="inline-flex items-center gap-1.5 mr-4">
            <span className="inline-block w-3 h-3 rounded-sm bg-brand-red" />
            Current period
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-brand-ash" />
            Previous period
          </span>
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={DAILY_REVENUE} barGap={2} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A30" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#8A8A95', fontSize: 11, fontFamily: 'var(--font-jetbrains)' }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: '#8A8A95', fontSize: 11, fontFamily: 'var(--font-jetbrains)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? 'k' : ''}`}
              domain={[0, 3500]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="previous" name="previous" fill="#3A3A42" radius={[3, 3, 0, 0]} maxBarSize={14} />
            <Bar dataKey="current" name="current" fill="#D81E2A" radius={[3, 3, 0, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Two-column breakdown ─────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by Service */}
        <div className="rounded-2xl bg-brand-graphite border border-brand-graphite p-6 shadow-card">
          <h2 className="font-display text-body-md text-brand-white mb-5">Revenue by Service</h2>
          <div className="space-y-4">
            {SERVICE_BREAKDOWN.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-body-sm text-brand-smoke">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-caption text-brand-silver">{item.amount}</span>
                    <span className="font-mono text-caption text-brand-ash w-8 text-right">{item.pct}%</span>
                  </div>
                </div>
                <HorizontalBar pct={item.pct} />
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Region */}
        <div className="rounded-2xl bg-brand-graphite border border-brand-graphite p-6 shadow-card">
          <h2 className="font-display text-body-md text-brand-white mb-5">Revenue by Region</h2>
          <div className="space-y-4">
            {REGION_BREAKDOWN.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-body-sm text-brand-smoke">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-caption text-brand-silver">{item.amount}</span>
                    <span className="font-mono text-caption text-brand-ash w-8 text-right">{item.pct}%</span>
                  </div>
                </div>
                <HorizontalBar pct={item.pct} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Lead Sources donut ───────────────────────────────── */}
      <div className="rounded-2xl bg-brand-graphite border border-brand-graphite p-6 shadow-card">
        <h2 className="font-display text-body-md text-brand-white mb-6">Lead Sources</h2>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="w-full lg:w-80 shrink-0" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={LEAD_SOURCES}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {LEAD_SOURCES.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-3">
            {LEAD_SOURCES.map((src) => (
              <div key={src.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: src.color }} />
                  <span className="text-body-sm text-brand-smoke truncate">{src.name}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-caption text-brand-silver">{src.leads} leads</span>
                  <span className="font-mono text-caption text-brand-ash w-8 text-right">{src.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top customers table ──────────────────────────────── */}
      <div className="rounded-2xl bg-brand-graphite border border-brand-graphite shadow-card overflow-hidden">
        <div className="px-6 py-5 border-b border-brand-ash">
          <h2 className="font-display text-body-md text-brand-white">Top Customers</h2>
          <p className="text-caption text-brand-silver mt-0.5">By total spend over all time</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-brand-ash">
                <th className="px-6 py-3 text-left text-caption text-brand-silver font-display uppercase tracking-wider w-12">#</th>
                <th className="px-4 py-3 text-left text-caption text-brand-silver font-display uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-right text-caption text-brand-silver font-display uppercase tracking-wider">Jobs</th>
                <th className="px-4 py-3 text-right text-caption text-brand-silver font-display uppercase tracking-wider">Total Spent</th>
                <th className="px-4 py-3 text-right text-caption text-brand-silver font-display uppercase tracking-wider">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {TOP_CUSTOMERS.map((c, i) => (
                <tr
                  key={c.rank}
                  className={`border-b border-brand-ash/50 hover:bg-brand-ash/20 transition-colors ${
                    i === TOP_CUSTOMERS.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="px-6 py-3.5 font-mono text-caption text-brand-ash">{c.rank}</td>
                  <td className="px-4 py-3.5 text-brand-white font-display">{c.name}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-brand-smoke">{c.jobs}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-brand-white">{c.spent}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-caption text-brand-silver">{c.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Conversion funnel ────────────────────────────────── */}
      <div className="rounded-2xl bg-brand-graphite border border-brand-graphite p-6 shadow-card">
        <h2 className="font-display text-body-md text-brand-white mb-2">Conversion Funnel</h2>
        <p className="text-caption text-brand-silver mb-6">30-day visitor to payment conversion</p>

        <div className="space-y-3">
          {FUNNEL.map((step, i) => {
            // Width: first step is 100% of container, subsequent steps scale by pct of previous
            const barWidths = [100, 3.5, 77 * 0.035, 96 * 77 * 0.035];
            // Recalculate cleanly as cumulative ratio
            const cumulativeWidths = [100, 3.5, 3.5 * 0.77, 3.5 * 0.77 * 0.96];
            const barPct = cumulativeWidths[i];

            return (
              <div key={step.label} className="space-y-1.5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-brand-ash text-caption font-mono text-brand-silver flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-body-sm text-brand-smoke">{step.label}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-body-sm text-brand-white">{step.count.toLocaleString()}</span>
                    {step.drop && (
                      <span className="font-mono text-caption text-brand-red bg-brand-red/10 px-2 py-0.5 rounded-full">
                        {step.drop}
                      </span>
                    )}
                    {i === 0 && (
                      <span className="font-mono text-caption text-brand-silver w-16 text-right">100%</span>
                    )}
                    {i > 0 && (
                      <span className="font-mono text-caption text-brand-silver w-16 text-right">
                        {step.pct}% of prev
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-7 w-full rounded-lg bg-brand-ash/40 overflow-hidden flex items-center">
                  <div
                    className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-3"
                    style={{
                      width: `${barPct}%`,
                      minWidth: barPct > 0 ? '2rem' : 0,
                      backgroundColor: i === 0 ? '#D81E2A' : i === 1 ? '#B51822' : i === 2 ? '#8A8A95' : '#5A5A65',
                    }}
                  >
                    <span className="font-mono text-caption text-brand-white/80 whitespace-nowrap">
                      {step.count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
