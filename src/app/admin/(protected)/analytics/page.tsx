import {
  BarChart3,
  Download,
  FileText,
  Lock,
  Receipt,
  TrendingUp,
  Users,
} from 'lucide-react';
import { getAdminAnalyticsData } from '@/lib/admin-data';

function money(value: number): string {
  return value.toLocaleString('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  });
}

function number(value: number): string {
  return value.toLocaleString('en-CA');
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
  icon: typeof TrendingUp;
}) {
  return (
    <div className="rounded-2xl border border-brand-ash bg-brand-graphite p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-body-sm uppercase tracking-widest text-brand-silver">{label}</p>
          <p className="mt-3 font-mono text-display-sm text-brand-white">{value}</p>
          <p className="mt-2 text-caption text-brand-ash">{note}</p>
        </div>
        <div className="rounded-lg bg-brand-jet-light p-2 text-brand-red">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function HorizontalBar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-brand-ash">
      <div
        className="h-full rounded-full bg-brand-red transition-all duration-500"
        style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
      />
    </div>
  );
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-brand-ash bg-brand-graphite p-6 text-center shadow-card">
      <BarChart3 className="mx-auto text-brand-ash" size={30} />
      <h2 className="mt-4 font-display text-body-md text-brand-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-body-sm text-brand-silver">{body}</p>
    </div>
  );
}

export default async function AnalyticsPage() {
  const data = await getAdminAnalyticsData();
  const hasLeads = data.totals.leads > 0;

  return (
    <div className="max-w-[1440px] space-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-display-sm text-brand-white">Analytics</h1>
          <p className="mt-1 text-body-sm text-brand-silver">
            Real Neon metrics from quotes, bookings, customers, and invoices. Marketing attribution and exports are pending.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled
            className="flex items-center gap-1.5 rounded-lg border border-brand-ash bg-brand-graphite px-3 py-1.5 text-caption text-brand-ash opacity-75"
          >
            <Download size={13} />
            CSV Pending
          </button>
          <button
            type="button"
            disabled
            className="flex items-center gap-1.5 rounded-lg border border-brand-ash bg-brand-graphite px-3 py-1.5 text-caption text-brand-ash opacity-75"
          >
            <FileText size={13} />
            PDF Pending
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Quoted Revenue"
          value={money(data.totals.quotedRevenue)}
          note={`${number(data.totals.leads)} total lead${data.totals.leads === 1 ? '' : 's'}`}
          icon={TrendingUp}
        />
        <MetricCard
          label="Bookings"
          value={number(data.totals.bookings)}
          note={`${money(data.totals.bookedRevenue)} booked amount`}
          icon={BarChart3}
        />
        <MetricCard
          label="Customers"
          value={number(data.totals.customers)}
          note={`${number(data.totals.estimatorLeads)} estimator, ${number(data.totals.contactLeads)} contact`}
          icon={Users}
        />
        <MetricCard
          label="Invoices"
          value={number(data.totals.invoices)}
          note={`${money(data.totals.invoiceRevenue)} invoice total`}
          icon={Receipt}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brand-ash bg-brand-graphite p-6 shadow-card">
          <h2 className="mb-1 font-display text-body-md text-brand-white">Lead Sources</h2>
          <p className="mb-5 text-caption text-brand-silver">Source counts from quote records.</p>
          {data.sourceCounts.length === 0 ? (
            <p className="rounded-xl border border-brand-ash/40 bg-brand-jet-light px-4 py-8 text-center text-body-sm text-brand-silver">
              No source data yet.
            </p>
          ) : (
            <div className="space-y-4">
              {data.sourceCounts.map((source) => (
                <div key={source.name} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: source.color }} />
                      <span className="truncate text-body-sm text-brand-smoke">{source.name}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-caption text-brand-silver">
                        {number(source.count)} leads
                      </span>
                      <span className="w-8 text-right font-mono text-caption text-brand-ash">{source.pct}%</span>
                    </div>
                  </div>
                  <HorizontalBar pct={source.pct} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-brand-ash bg-brand-graphite p-6 shadow-card">
          <h2 className="mb-1 font-display text-body-md text-brand-white">Quote Funnel</h2>
          <p className="mb-5 text-caption text-brand-silver">Live operational counts. Visitor analytics are not connected yet.</p>
          <div className="space-y-3">
            {[
              ['Leads', data.totals.leads],
              ['Estimator leads', data.totals.estimatorLeads],
              ['Contact leads', data.totals.contactLeads],
              ['Bookings', data.totals.bookings],
              ['Invoices', data.totals.invoices],
            ].map(([label, value], index) => (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-ash font-mono text-caption text-brand-silver">
                      {index + 1}
                    </span>
                    <span className="text-body-sm text-brand-smoke">{label}</span>
                  </div>
                  <span className="font-mono text-body-sm text-brand-white">{number(value as number)}</span>
                </div>
                <HorizontalBar pct={hasLeads ? ((value as number) / data.totals.leads) * 100 : 0} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brand-ash bg-brand-graphite p-6 shadow-card">
          <h2 className="mb-1 font-display text-body-md text-brand-white">Quoted Revenue by Service</h2>
          <p className="mb-5 text-caption text-brand-silver">Calculated from `quotes.estimatedTotal`.</p>
          {data.serviceBreakdown.length === 0 ? (
            <p className="rounded-xl border border-brand-ash/40 bg-brand-jet-light px-4 py-8 text-center text-body-sm text-brand-silver">
              No service revenue data yet.
            </p>
          ) : (
            <div className="space-y-4">
              {data.serviceBreakdown.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="truncate text-body-sm text-brand-smoke">{item.name}</span>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-caption text-brand-silver">{money(item.amount)}</span>
                      <span className="w-8 text-right font-mono text-caption text-brand-ash">{item.pct}%</span>
                    </div>
                  </div>
                  <HorizontalBar pct={item.pct} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-brand-ash bg-brand-graphite p-6 shadow-card">
          <h2 className="mb-1 font-display text-body-md text-brand-white">Quoted Revenue by Region</h2>
          <p className="mb-5 text-caption text-brand-silver">Calculated from quote request region fields.</p>
          {data.regionBreakdown.length === 0 ? (
            <p className="rounded-xl border border-brand-ash/40 bg-brand-jet-light px-4 py-8 text-center text-body-sm text-brand-silver">
              No region revenue data yet.
            </p>
          ) : (
            <div className="space-y-4">
              {data.regionBreakdown.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="truncate text-body-sm text-brand-smoke">{item.name}</span>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-caption text-brand-silver">{money(item.amount)}</span>
                      <span className="w-8 text-right font-mono text-caption text-brand-ash">{item.pct}%</span>
                    </div>
                  </div>
                  <HorizontalBar pct={item.pct} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {data.recentInvoices.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-brand-ash bg-brand-graphite shadow-card">
          <div className="border-b border-brand-ash px-6 py-5">
            <h2 className="font-display text-body-md text-brand-white">Recent Invoices</h2>
            <p className="mt-0.5 text-caption text-brand-silver">Real Neon invoice records only.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-brand-ash">
                  <th className="px-6 py-3 text-left font-display text-caption uppercase tracking-wider text-brand-silver">Invoice</th>
                  <th className="px-4 py-3 text-left font-display text-caption uppercase tracking-wider text-brand-silver">Customer</th>
                  <th className="px-4 py-3 text-right font-display text-caption uppercase tracking-wider text-brand-silver">Total</th>
                  <th className="px-4 py-3 text-right font-display text-caption uppercase tracking-wider text-brand-silver">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-brand-ash/50 last:border-b-0">
                    <td className="px-6 py-3.5 font-mono text-caption text-brand-smoke">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3.5 text-brand-white">{invoice.customer.name}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-brand-white">{money(Number(invoice.total))}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-caption text-brand-silver">{invoice.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyPanel
          title="No invoice analytics yet"
          body="Invoice metrics will populate after the production invoice workflow creates Neon invoice records."
        />
      )}

      <div className="rounded-xl border border-brand-graphite bg-brand-jet-light px-4 py-3">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 shrink-0 text-brand-red" size={16} />
          <p className="text-body-sm text-brand-silver">
            CSV/PDF export, visitor analytics, paid conversion, and campaign attribution are disabled until those production systems are connected.
          </p>
        </div>
      </div>
    </div>
  );
}
