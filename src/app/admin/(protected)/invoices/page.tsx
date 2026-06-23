import {
  AlertCircle,
  Plus,
  Receipt,
  Search,
} from 'lucide-react';
import { getAdminInvoicesData } from '@/lib/admin-data';
import { InvoiceCardClient } from '@/components/admin/InvoiceCardClient';
import { InvoicesPageClient } from '@/components/admin/InvoicesPageClient';

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

const defaultCompany = {
  name: 'Western Wheelcraft',
  address: '3756 Napier St, Burnaby, BC V5C 3E5',
  phone: '(604) 710-6174',
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
    <InvoicesPageClient
      invoices={filtered}
      allInvoices={invoices}
      counts={counts}
      activeStatus={activeStatus}
      query={query}
      company={defaultCompany}
      tabs={TABS}
    />
  );
}
