import Link from 'next/link';
import {
  Camera,
  Car,
  FileQuestion,
  Mail,
  MapPin,
  Phone,
  Wrench,
} from 'lucide-react';
import { getAdminLeadsData } from '@/lib/admin-data';
import { LeadWorkflowControls } from '@/components/admin/WorkflowControls';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  contacted: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  quoted: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  sent: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  accepted: 'bg-green-500/15 text-green-400 border-green-500/30',
  booked: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  completed: 'bg-brand-ash/40 text-brand-silver border-brand-ash/50',
  declined: 'bg-red-500/15 text-red-400 border-red-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
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
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatMoney(value: string | null): string {
  if (!value) return 'Manual quote';
  return Number(value).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
}

function vehicleLabel(lead: Awaited<ReturnType<typeof getAdminLeadsData>>[number]): string {
  if (!lead.vehicle) return 'Vehicle not provided';
  const parts = [lead.vehicle.year, lead.vehicle.make, lead.vehicle.model].filter(Boolean);
  return parts.join(' ');
}

export default async function AdminLeadsPage() {
  const leads = await getAdminLeadsData();

  const newCount = leads.filter((lead) => lead.status === 'new').length;
  const estimatorCount = leads.filter((lead) => lead.source === 'estimator').length;
  const contactCount = leads.filter((lead) => lead.source === 'contact_form').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-display-sm text-brand-white">Leads</h1>
          <p className="mt-1 text-body-sm text-brand-silver">
            Real contact and quote estimator submissions saved in Neon.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:w-auto">
          {[
            ['New', newCount],
            ['Estimator', estimatorCount],
            ['Contact', contactCount],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-brand-graphite bg-brand-jet-light px-4 py-3">
              <p className="font-mono text-body-md text-brand-white">{value}</p>
              <p className="text-caption text-brand-silver">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-brand-graphite bg-brand-jet-light px-6 py-16 text-center">
          <FileQuestion className="mx-auto text-brand-ash" size={36} />
          <h2 className="mt-4 font-display text-body-lg text-brand-white">No leads yet</h2>
          <p className="mx-auto mt-2 max-w-md text-body-sm text-brand-silver">
            Submit the public contact form or quote estimator to create the first production lead.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {leads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-xl border border-brand-graphite bg-brand-jet-light p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-body-lg text-brand-white">{lead.customerName}</h2>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-caption font-medium capitalize ${STATUS_COLORS[lead.status]}`}
                    >
                      {lead.status}
                    </span>
                    <span className="rounded-full border border-brand-graphite bg-brand-graphite px-2.5 py-0.5 text-caption text-brand-silver">
                      {sourceLabels[lead.source] ?? lead.source}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-brand-graphite bg-brand-graphite px-2.5 py-0.5 text-caption text-brand-silver">
                      <Camera size={12} />
                      {lead.photos.length} photo{lead.photos.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-caption text-brand-silver">
                    {lead.quoteNumber} · {formatDate(lead.createdAt)}
                  </p>
                </div>
                <div className="font-display text-display-sm text-brand-white">
                  {formatMoney(lead.estimatedTotal)}
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-body-sm text-brand-smoke md:grid-cols-2 xl:grid-cols-4">
                <a href={`mailto:${lead.customerEmail}`} className="flex items-center gap-2 hover:text-brand-red">
                  <Mail size={14} className="text-brand-red" />
                  <span className="truncate">{lead.customerEmail}</span>
                </a>
                {lead.customerPhone ? (
                  <a href={`tel:${lead.customerPhone}`} className="flex items-center gap-2 hover:text-brand-red">
                    <Phone size={14} className="text-brand-red" />
                    <span>{lead.customerPhone}</span>
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-brand-silver">
                    <Phone size={14} /> No phone
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <MapPin size={14} className="text-brand-red" />
                  {lead.region ?? 'Region not provided'}
                </span>
                <span className="flex items-center gap-2">
                  <Wrench size={14} className="text-brand-red" />
                  {lead.requestedService ?? 'Service not selected'}
                </span>
              </div>

              <div className="mt-4 rounded-lg border border-brand-graphite bg-brand-graphite/40 p-4">
                <div className="mb-3 flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-brand-ash">
                  <Car size={13} /> Vehicle / Damage
                </div>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div>
                    <p className="text-body-sm text-brand-white">{vehicleLabel(lead)}</p>
                    {lead.damageDescription ? (
                      <p className="mt-2 whitespace-pre-line text-body-sm leading-relaxed text-brand-silver">
                        {lead.damageDescription}
                      </p>
                    ) : (
                      <p className="mt-2 text-body-sm text-brand-silver">No damage description provided.</p>
                    )}
                  </div>

                  {lead.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 lg:w-56">
                      {lead.photos.slice(0, 4).map((photo, index) => (
                        <a
                          key={photo.id}
                          href={`/api/admin/quote-photos/${photo.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="relative aspect-square overflow-hidden rounded-md border border-brand-ash bg-brand-jet"
                          aria-label={`Open quote photo ${index + 1}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/admin/quote-photos/${photo.id}`}
                            alt={`Quote photo ${index + 1}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                          {index === 3 && lead.photos.length > 4 && (
                            <span className="absolute inset-0 flex items-center justify-center bg-brand-jet/75 font-mono text-body-sm text-brand-white">
                              +{lead.photos.length - 4}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {lead.customerId && (
                <div className="mt-4">
                  <Link
                    href="/admin/customers"
                    className="text-body-sm text-brand-silver underline hover:text-brand-red"
                  >
                    View customer record
                  </Link>
                </div>
              )}

              <LeadWorkflowControls
                quoteId={lead.id}
                status={lead.status}
                estimatedSubtotal={lead.estimatedSubtotal}
                activities={lead.activities.map((activity) => ({
                  ...activity,
                  createdAt: activity.createdAt.toISOString(),
                }))}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
