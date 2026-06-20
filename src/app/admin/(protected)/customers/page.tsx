import {
  Car,
  FileQuestion,
  Mail,
  MessageSquare,
  Phone,
  Users,
} from 'lucide-react';
import { getAdminCustomersData } from '@/lib/admin-data';
import { CustomerNoteForm } from '@/components/admin/WorkflowControls';

function formatDate(date: Date | null): string {
  if (!date) return 'Never';
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function latestDate(dates: Date[]): Date | null {
  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map((date) => date.getTime())));
}

function InitialCircle({ name, type }: { name: string; type: string }) {
  const color = type === 'trade' ? 'bg-brand-red/20 text-brand-red' : 'bg-blue-500/20 text-blue-400';
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display font-bold ${color}`}>
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

export default async function CustomersPage() {
  const customers = await getAdminCustomersData();
  const tradeCount = customers.filter((customer) => customer.type === 'trade').length;
  const withLeadCount = customers.filter((customer) => customer.quotes.length > 0).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-display-sm text-brand-white">Customers</h1>
          <p className="mt-1 text-body-sm text-brand-silver">
            Real customer records created from contact and quote submissions.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Total', customers.length],
            ['Trade', tradeCount],
            ['With leads', withLeadCount],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-brand-graphite bg-brand-jet-light px-4 py-3">
              <p className="font-mono text-body-md text-brand-white">{value}</p>
              <p className="text-caption text-brand-silver">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-xl border border-brand-graphite bg-brand-jet-light px-6 py-16 text-center">
          <Users className="mx-auto text-brand-ash" size={36} />
          <h2 className="mt-4 font-display text-body-lg text-brand-white">No customers yet</h2>
          <p className="mx-auto mt-2 max-w-md text-body-sm text-brand-silver">
            New customers are created automatically when a public quote or contact request is saved.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {customers.map((customer) => {
            const lastQuoteAt = latestDate(customer.quotes.map((quote) => quote.createdAt));

            return (
              <article
                key={customer.id}
                className="rounded-xl border border-brand-graphite bg-brand-jet-light p-5"
              >
                <div className="flex items-start gap-3">
                  <InitialCircle name={customer.name} type={customer.type} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-display text-body-md text-brand-white">
                        {customer.name}
                      </h2>
                      <span className="rounded-full border border-brand-graphite bg-brand-graphite px-2.5 py-0.5 text-caption text-brand-silver capitalize">
                        {customer.type}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-caption text-brand-silver">
                      Customer since {formatDate(customer.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-body-sm text-brand-smoke sm:grid-cols-2">
                  <a href={`mailto:${customer.email}`} className="flex items-center gap-2 hover:text-brand-red">
                    <Mail size={14} className="text-brand-red" />
                    <span className="truncate">{customer.email}</span>
                  </a>
                  {customer.phone ? (
                    <a href={`tel:${customer.phone}`} className="flex items-center gap-2 hover:text-brand-red">
                      <Phone size={14} className="text-brand-red" />
                      <span>{customer.phone}</span>
                    </a>
                  ) : (
                    <span className="flex items-center gap-2 text-brand-silver">
                      <Phone size={14} /> No phone
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    [FileQuestion, 'Quotes', customer.quotes.length],
                    [Car, 'Vehicles', customer.vehicles.length],
                    [MessageSquare, 'Notes', customer.communications.length],
                  ].map(([Icon, label, value]) => {
                    const LucideIcon = Icon as typeof FileQuestion;
                    return (
                      <div key={label as string} className="rounded-lg border border-brand-graphite bg-brand-graphite/40 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 text-brand-red">
                          <LucideIcon size={13} />
                          <span className="text-caption text-brand-silver">{label as string}</span>
                        </div>
                        <p className="mt-1 font-mono text-body-md text-brand-white">{value as number}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-lg border border-brand-graphite bg-brand-graphite/30 p-3">
                  <p className="text-caption font-semibold uppercase tracking-wider text-brand-ash">
                    Latest activity
                  </p>
                  <p className="mt-1 text-body-sm text-brand-smoke">
                    {lastQuoteAt ? `Quote request on ${formatDate(lastQuoteAt)}` : 'No quote activity yet'}
                  </p>
                  {customer.quotes[0]?.requestedService && (
                    <p className="mt-1 text-caption text-brand-silver">
                      {customer.quotes[0].requestedService}
                    </p>
                  )}
                </div>

                {customer.notes && (
                  <p className="mt-3 line-clamp-2 text-caption leading-relaxed text-brand-silver">
                    {customer.notes}
                  </p>
                )}

                {customer.communications.filter((item) => item.direction === 'internal').length > 0 && (
                  <div className="mt-4 border-t border-brand-graphite pt-4">
                    <p className="text-caption font-semibold uppercase text-brand-ash">Recent internal notes</p>
                    <div className="mt-2 space-y-2">
                      {customer.communications
                        .filter((item) => item.direction === 'internal')
                        .slice(0, 3)
                        .map((item) => (
                          <div key={item.id} className="rounded-md bg-brand-graphite/40 p-3">
                            <p className="whitespace-pre-line text-body-sm text-brand-smoke">{item.body}</p>
                            <p className="mt-1 text-caption text-brand-silver">
                              {item.createdBy ?? 'Admin'} · {formatDate(item.createdAt)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <CustomerNoteForm customerId={customer.id} />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
