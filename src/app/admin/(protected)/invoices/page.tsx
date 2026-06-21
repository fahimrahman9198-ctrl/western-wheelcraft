import {
  AlertCircle,
  Plus,
  Receipt,
  Search,
} from 'lucide-react';
import { getAdminInvoicesData } from '@/lib/admin-data';
import { InvoiceCardClient } from '@/components/admin/InvoiceCardClient';

type Invoice = Awaited<ReturnType<typeof getAdminInvoicesData>>[number];
type InvoiceStatus = Invoice['status'];
type FilterTab = 'all' | InvoiceStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'unpaid', label: 'Unpaid' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'paid', label: 'Paid' },
  { key: 'void', label: 'Void' },
];

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

// Placeholder company info - should be fetched from settings
const defaultCompany = {
  name: 'Western Wheelcraft',
  address: '123 Business St, Vancouver, BC V6B 1A1',
  phone: '(604) 555-0001',
  email: 'info@westernwheelcraft.ca',
};

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
      || invoice.customer?.name?.toLowerCase().includes(query)
      || invoice.customer?.email?.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-col gap-4 border-b border-brand-graphite bg-brand-jet-light px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-display-sm text-brand-white">Invoices</h1>
          <p className="mt-0.5 text-body-sm text-brand-silver">
            Generate, preview, resend, and track invoice payments with PDF export.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="flex w-fit items-center gap-2 rounded-xl border border-brand-graphite bg-brand-graphite px-5 py-2.5 font-display font-semibold text-brand-ash opacity-75"
        >
          <Plus size={16} />
          Create Invoice Coming Soon
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
                  {counts[key as FilterTab]}
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
            <h2 className="mt-4 font-display text-body-lg text-brand-white">No invoices yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-body-sm text-brand-silver">
              Invoices will be created from bookings and displayed here with full PDF export and payment tracking.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-brand-graphite bg-brand-jet-light px-6 py-16 text-center">
            <AlertCircle className="mx-auto text-brand-ash" size={36} />
            <h2 className="mt-4 font-display text-body-lg text-brand-white">No matching invoices</h2>
            <p className="mx-auto mt-2 max-w-xl text-body-sm text-brand-silver">
              Adjust the status filter or search term to find invoices.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((invoice) => (
              <InvoiceCardClient key={invoice.id} invoice={invoice as any} company={defaultCompany} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
