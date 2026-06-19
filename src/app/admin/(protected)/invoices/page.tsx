import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Lock,
  Plus,
  Receipt,
  Search,
} from 'lucide-react';
import { getAdminInvoicesData } from '@/lib/admin-data';

type Invoice = Awaited<ReturnType<typeof getAdminInvoicesData>>[number];
type InvoiceStatus = Invoice['status'];
type FilterTab = 'all' | InvoiceStatus;

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: 'bg-brand-ash/30 text-brand-silver border border-brand-ash/40',
  unpaid: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  paid: 'bg-green-500/15 text-green-400 border border-green-500/30',
  overdue: 'bg-brand-red/15 text-brand-red border border-brand-red/30',
  void: 'bg-brand-ash/20 text-brand-ash border border-brand-ash/30',
};

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'unpaid', label: 'Unpaid' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'paid', label: 'Paid' },
  { key: 'void', label: 'Void' },
];

function money(value: string | null): string {
  if (!value) return '$0';
  return Number(value).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
}

function formatDate(date: Date | null): string {
  if (!date) return 'Not set';
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function statusLabel(status: InvoiceStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function countsByStatus(invoices: Invoice[]) {
  return {
    all: invoices.length,
    draft: invoices.filter((invoice) => invoice.status === 'draft').length,
    unpaid: invoices.filter((invoice) => invoice.status === 'unpaid').length,
    overdue: invoices.filter((invoice) => invoice.status === 'overdue').length,
    paid: invoices.filter((invoice) => invoice.status === 'paid').length,
    void: invoices.filter((invoice) => invoice.status === 'void').length,
  };
}

function customerLine(invoice: Invoice): string {
  const email = invoice.customer.email;
  return email ? email : 'No email on file';
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const succeededPayments = invoice.payments.filter((payment) => payment.status === 'succeeded');
  const paymentTotal = succeededPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

  return (
    <article className="rounded-xl border border-brand-graphite bg-brand-jet-light p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-mono text-body-md text-brand-white">{invoice.invoiceNumber}</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-caption font-medium ${STATUS_STYLES[invoice.status]}`}>
              {statusLabel(invoice.status)}
            </span>
            {invoice.quote?.quoteNumber && (
              <span className="rounded-full border border-brand-graphite bg-brand-graphite px-2.5 py-0.5 text-caption text-brand-silver">
                Quote {invoice.quote.quoteNumber}
              </span>
            )}
          </div>
          <p className="mt-1 text-body-sm text-brand-white">{invoice.customer.name}</p>
          <p className="font-mono text-caption text-brand-silver">{customerLine(invoice)}</p>
        </div>

        <div className="text-left lg:text-right">
          <p className="font-display text-display-sm text-brand-white">{money(invoice.total)}</p>
          <p className="text-caption text-brand-silver">
            Paid {paymentTotal.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-body-sm text-brand-smoke md:grid-cols-3">
        <span className="flex items-center gap-2">
          <FileText size={14} className="text-brand-red" />
          Issued {formatDate(invoice.issuedAt)}
        </span>
        <span className="flex items-center gap-2">
          <Clock size={14} className="text-brand-red" />
          Due {formatDate(invoice.dueAt)}
        </span>
        <span className="flex items-center gap-2">
          <CheckCircle size={14} className="text-brand-red" />
          {invoice.lineItems.length} line item{invoice.lineItems.length === 1 ? '' : 's'}
        </span>
      </div>

      {invoice.lineItems.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-lg border border-brand-graphite">
          <table className="w-full text-body-sm">
            <thead className="bg-brand-graphite/60">
              <tr>
                <th className="px-3 py-2 text-left text-caption font-medium text-brand-silver">Description</th>
                <th className="px-3 py-2 text-right text-caption font-medium text-brand-silver">Qty</th>
                <th className="px-3 py-2 text-right text-caption font-medium text-brand-silver">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-graphite/60">
              {invoice.lineItems.slice(0, 4).map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 text-brand-smoke">{item.description}</td>
                  <td className="px-3 py-2 text-right font-mono text-brand-silver">{Number(item.quantity)}</td>
                  <td className="px-3 py-2 text-right font-mono text-brand-white">{money(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled
          className="flex items-center gap-1.5 rounded-lg border border-brand-graphite px-3 py-2 text-caption text-brand-ash opacity-70"
        >
          <Eye size={13} />
          Preview pending
        </button>
        <button
          type="button"
          disabled
          className="flex items-center gap-1.5 rounded-lg border border-brand-graphite px-3 py-2 text-caption text-brand-ash opacity-70"
        >
          <Lock size={13} />
          Resend disabled
        </button>
        <button
          type="button"
          disabled
          className="flex items-center gap-1.5 rounded-lg border border-brand-graphite px-3 py-2 text-caption text-brand-ash opacity-70"
        >
          <Lock size={13} />
          Payment actions disabled
        </button>
      </div>
    </article>
  );
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; q?: string }>;
}) {
  const [invoices, resolvedParams] = await Promise.all([
    getAdminInvoicesData(),
    searchParams ?? Promise.resolve({} as { status?: string; q?: string }),
  ]);
  const params: { status?: string; q?: string } = resolvedParams;
  const counts = countsByStatus(invoices);
  const activeStatus = TABS.some((tab) => tab.key === params.status)
    ? params.status as FilterTab
    : 'all';
  const query = params.q?.trim().toLowerCase() ?? '';
  const filtered = invoices.filter((invoice) => {
    const matchesStatus = activeStatus === 'all' || invoice.status === activeStatus;
    const matchesQuery = !query
      || invoice.invoiceNumber.toLowerCase().includes(query)
      || invoice.customer.name.toLowerCase().includes(query)
      || invoice.customer.email.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-col gap-4 border-b border-brand-graphite bg-brand-jet-light px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-display-sm text-brand-white">Invoices</h1>
          <p className="mt-0.5 text-body-sm text-brand-silver">
            Real Neon invoice records. Creation, Resend, PDF, and payment actions are disabled until Stripe/Resend are connected.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="flex w-fit items-center gap-2 rounded-xl border border-brand-graphite bg-brand-graphite px-5 py-2.5 font-display font-semibold text-brand-ash opacity-75"
        >
          <Plus size={16} />
          Create Invoice Pending
        </button>
      </div>

      <div className="border-b border-brand-graphite bg-brand-jet-light px-6 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1 overflow-x-auto">
            {TABS.map(({ key, label }) => (
              <a
                key={key}
                href={key === 'all' ? '/admin/invoices' : `/admin/invoices?status=${key}`}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-body-sm transition-colors ${
                  activeStatus === key
                    ? 'bg-brand-graphite text-brand-white'
                    : 'text-brand-silver hover:bg-brand-graphite/50 hover:text-brand-white'
                }`}
              >
                {label}
                <span className="rounded-full bg-brand-ash px-1.5 py-0.5 font-mono text-caption text-brand-smoke">
                  {counts[key]}
                </span>
              </a>
            ))}
          </div>

          <form action="/admin/invoices" className="relative">
            {activeStatus !== 'all' && <input type="hidden" name="status" value={activeStatus} />}
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-ash"
            />
            <input
              type="text"
              name="q"
              defaultValue={params.q ?? ''}
              placeholder="Search customer or invoice #"
              className="w-full rounded-lg border border-brand-graphite bg-brand-graphite py-2 pl-8 pr-3 text-body-sm text-brand-white placeholder:text-brand-ash focus:border-brand-red/50 focus:outline-none sm:w-72"
            />
          </form>
        </div>
      </div>

      <div className="p-6">
        {invoices.length === 0 ? (
          <div className="rounded-xl border border-brand-graphite bg-brand-jet-light px-6 py-16 text-center">
            <Receipt className="mx-auto text-brand-ash" size={36} />
            <h2 className="mt-4 font-display text-body-lg text-brand-white">No invoices in Neon yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-body-sm text-brand-silver">
              Invoice records will appear here after the production invoice workflow is connected. No demo invoices are shown.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-brand-graphite bg-brand-jet-light px-6 py-16 text-center">
            <AlertCircle className="mx-auto text-brand-ash" size={36} />
            <h2 className="mt-4 font-display text-body-lg text-brand-white">No matching invoices</h2>
            <p className="mx-auto mt-2 max-w-xl text-body-sm text-brand-silver">
              Adjust the status filter or search term. This view only uses real Neon invoice records.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
