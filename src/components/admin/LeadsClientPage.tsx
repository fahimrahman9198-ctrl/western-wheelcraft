'use client';

import { useState } from 'react';
import { Eye, Plus, Loader2 } from 'lucide-react';
import { PhotoGallery } from './PhotoGallery';
import { QuotePreviewModal } from './QuotePreviewModal';
import type { AdminLead, CompanyInfo } from '@/lib/admin-types';

interface LeadsClientPageProps {
  leads: AdminLead[];
  company: CompanyInfo;
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-brand-ash/30 text-brand-smoke border border-brand-ash/40',
  contacted: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  quoted: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  sent: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  accepted: 'bg-green-500/15 text-green-400 border border-green-500/30',
  booked: 'bg-green-600/15 text-green-300 border border-green-600/30',
  completed: 'bg-brand-ash/40 text-brand-smoke border-brand-ash/50',
  declined: 'bg-brand-red/15 text-brand-red border border-brand-red/30',
  cancelled: 'bg-brand-red/15 text-brand-red border border-brand-red/30',
  expired: 'bg-brand-ash/20 text-brand-silver border border-brand-ash/30',
};

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Money columns are stored as numeric strings, so format defensively.
function money(value: string | null): string {
  return Number(value ?? 0).toFixed(2);
}

export function LeadsClientPage({ leads, company }: LeadsClientPageProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<AdminLead | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  const handleViewQuote = (quote: AdminLead) => {
    setSelectedQuote(quote);
    setPreviewOpen(true);
  };

  const handleCreateBooking = async (quote: AdminLead) => {
    setIsCreatingBooking(true);
    try {
      // This would trigger opening a booking modal with pre-filled data
      // For now, we'll just open the modal
      const modal = document.getElementById('create-booking-modal');
      if (modal) {
        // Pre-fill the modal with quote data
        const event = new CustomEvent('pre-fill-booking', {
          detail: {
            customerId: quote.customerId,
            service: quote.requestedService,
            amount: quote.estimatedTotal,
            quoteId: quote.id,
          },
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <div className="space-y-4">
      {leads.length === 0 ? (
        <div className="rounded-xl border border-brand-ash bg-brand-graphite px-6 py-16 text-center">
          <Eye className="mx-auto text-brand-silver" size={36} />
          <h2 className="mt-4 font-display text-body-lg text-brand-white">No leads yet</h2>
          <p className="mx-auto mt-2 max-w-md text-body-sm text-brand-smoke">
            Quote requests from customers will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {leads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-xl border border-brand-ash bg-brand-graphite p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-body-lg text-brand-white">
                      {lead.customer?.name || 'Unknown Customer'}
                    </h2>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-caption font-medium capitalize ${STATUS_STYLES[lead.status] || STATUS_STYLES['new']}`}
                    >
                      {statusLabel(lead.status)}
                    </span>
                    <span className="rounded-full border border-brand-ash bg-brand-graphite-light px-2.5 py-0.5 text-caption text-brand-smoke">
                      Quote {lead.quoteNumber}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-caption text-brand-smoke">
                    {lead.source === 'estimator' ? 'Web Estimator' : 'Contact Form'} •{' '}
                    {new Date(lead.createdAt).toLocaleDateString('en-CA')}
                  </p>
                </div>
                <div className="font-display text-display-sm text-brand-white">
                  ${money(lead.estimatedTotal)}
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-4 grid gap-3 text-body-sm text-brand-smoke md:grid-cols-2">
                {lead.customer?.email && (
                  <a
                    href={`mailto:${lead.customer.email}`}
                    className="flex items-center gap-2 hover:text-brand-red"
                  >
                    <span className="text-brand-red">✉</span>
                    <span className="truncate">{lead.customer.email}</span>
                  </a>
                )}
                {lead.customer?.phone && (
                  <a
                    href={`tel:${lead.customer.phone}`}
                    className="flex items-center gap-2 hover:text-brand-red"
                  >
                    <span className="text-brand-red">📞</span>
                    <span>{lead.customer.phone}</span>
                  </a>
                )}
              </div>

              {/* Vehicle & Service */}
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-brand-ash bg-brand-graphite-light/40 p-4">
                  <div className="text-caption font-semibold uppercase tracking-wider text-brand-silver mb-1">
                    Vehicle
                  </div>
                  <p className="text-body-sm text-brand-white">
                    {lead.vehicle
                      ? `${lead.vehicle.year || ''} ${lead.vehicle.make || ''} ${lead.vehicle.model || ''}`.trim()
                      : 'Not provided'}
                  </p>
                </div>

                <div className="rounded-lg border border-brand-ash bg-brand-graphite-light/40 p-4">
                  <div className="text-caption font-semibold uppercase tracking-wider text-brand-silver mb-1">
                    Service
                  </div>
                  <p className="text-body-sm text-brand-white">{lead.requestedService || 'Not specified'}</p>
                </div>
              </div>

              {/* Photos */}
              {lead.photos && lead.photos.length > 0 && (
                <div className="mt-4">
                  <p className="text-caption font-semibold uppercase tracking-wider text-brand-silver mb-2">
                    Photos ({lead.photos.length})
                  </p>
                  <PhotoGallery
                    photos={lead.photos.map((p) => ({
                      id: p.id,
                      blobUrl: `/api/admin/quote-photos/${p.id}`,
                      uploadedAt: p.createdAt,
                    }))}
                  />
                </div>
              )}

              {/* Pricing Breakdown */}
              <div className="mt-4 rounded-lg border border-brand-ash bg-brand-graphite-light/30 p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-caption text-brand-silver">Subtotal</p>
                    <p className="font-mono font-bold text-brand-white">
                      ${money(lead.estimatedSubtotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-caption text-brand-silver">GST (5%)</p>
                    <p className="font-mono font-bold text-brand-white">
                      ${money(lead.estimatedGst)}
                    </p>
                  </div>
                  <div>
                    <p className="text-caption text-brand-silver">Total</p>
                    <p className="font-mono font-bold text-brand-white">
                      ${money(lead.estimatedTotal)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleViewQuote(lead)}
                  className="flex items-center gap-1.5 rounded-lg border border-brand-ash bg-brand-graphite-light/40 hover:bg-brand-graphite-light px-3 py-2 text-caption text-brand-smoke hover:text-brand-white transition-colors"
                >
                  <Eye size={13} />
                  View Quote
                </button>

                <button
                  onClick={() => handleCreateBooking(lead)}
                  disabled={isCreatingBooking}
                  className="flex items-center gap-1.5 rounded-lg border border-brand-ash bg-brand-red/20 hover:bg-brand-red/30 px-3 py-2 text-caption text-brand-red hover:text-brand-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingBooking ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      Create Booking
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Quote Preview Modal */}
      <QuotePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        quote={selectedQuote}
        company={company}
      />
    </div>
  );
}
