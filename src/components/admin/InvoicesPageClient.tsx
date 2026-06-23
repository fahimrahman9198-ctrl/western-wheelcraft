'use client';

import { useState } from 'react';
import { AlertCircle, Plus, Receipt, Search } from 'lucide-react';
import { InvoiceCardClient } from './InvoiceCardClient';
import { CreateInvoiceModal } from './CreateInvoiceModal';

interface InvoicesPageClientProps {
  invoices: any[];
  allInvoices: any[];
  counts: Record<string, number>;
  activeStatus: string;
  query: string;
  company: any;
  tabs: Array<{ key: string; label: string }>;
}

export function InvoicesPageClient({
  invoices,
  allInvoices,
  counts,
  activeStatus,
  query,
  company,
  tabs,
}: InvoicesPageClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <div className="flex min-h-0 flex-col">
        <div className="flex flex-col gap-4 border-b border-brand-ash bg-brand-graphite px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-display-sm text-brand-white">Invoices</h1>
            <p className="mt-0.5 text-body-sm text-brand-smoke">
              Create, generate, and track invoice payments with PDF export.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex w-fit items-center gap-2 rounded-xl bg-brand-red hover:bg-brand-red-hover px-5 py-2.5 font-display font-semibold text-white transition-colors"
          >
            <Plus size={16} />
            Create Invoice
          </button>
        </div>

        <div className="border-b border-brand-ash bg-brand-graphite px-6 py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-1 overflow-x-auto">
              {tabs.map(({ key, label }) => (
                <a
                  key={key}
                  href={key === 'all' ? '/admin/invoices' : `/admin/invoices?status=${key}`}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-body-sm transition-colors ${
                    activeStatus === key
                      ? 'bg-brand-graphite-light text-brand-white'
                      : 'text-brand-smoke hover:bg-brand-graphite-light/50 hover:text-brand-white'
                  }`}
                >
                  {label}
                  <span className="rounded-full bg-brand-ash px-1.5 py-0.5 font-mono text-caption text-brand-smoke">
                    {counts[key as keyof typeof counts] || 0}
                  </span>
                </a>
              ))}
            </div>

            <form action="/admin/invoices" className="relative">
              {activeStatus !== 'all' && <input type="hidden" name="status" value={activeStatus} />}
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-silver"
              />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search customer or invoice #"
                className="w-full rounded-lg border border-brand-ash bg-brand-graphite-light py-2 pl-8 pr-3 text-body-sm text-brand-white placeholder:text-brand-silver focus:border-brand-red/50 focus:outline-none sm:w-72"
              />
            </form>
          </div>
        </div>

        <div className="p-6">
          {allInvoices.length === 0 ? (
            <div className="rounded-xl border border-brand-ash bg-brand-graphite px-6 py-16 text-center">
              <Receipt className="mx-auto text-brand-silver" size={36} />
              <h2 className="mt-4 font-display text-body-lg text-brand-white">No invoices yet</h2>
              <p className="mx-auto mt-2 max-w-xl text-body-sm text-brand-smoke">
                Click "Create Invoice" to generate your first invoice with custom pricing and taxes.
              </p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="rounded-xl border border-brand-ash bg-brand-graphite px-6 py-16 text-center">
              <AlertCircle className="mx-auto text-brand-silver" size={36} />
              <h2 className="mt-4 font-display text-body-lg text-brand-white">No matching invoices</h2>
              <p className="mx-auto mt-2 max-w-xl text-body-sm text-brand-smoke">
                Adjust the status filter or search term to find invoices.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {invoices.map((invoice) => (
                <InvoiceCardClient key={invoice.id} invoice={invoice as any} company={company} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </>
  );
}
