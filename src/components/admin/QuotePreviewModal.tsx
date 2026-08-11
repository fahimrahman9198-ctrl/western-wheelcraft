'use client';

import { useRef, useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { QuotePDFPreview } from './QuotePDFPreview';
import { generatePDFFromElement } from '@/lib/pdf-generator';
import type { AdminLead, CompanyInfo } from '@/lib/admin-types';

interface QuotePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: AdminLead | null;
  company: CompanyInfo;
}

export function QuotePreviewModal({
  isOpen,
  onClose,
  quote,
  company,
}: QuotePreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    setIsDownloading(true);
    try {
      await generatePDFFromElement(previewRef.current, `quote_${quote?.quoteNumber ?? 'quote'}.pdf`);
      toast.success('Quote downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen || !quote) return null;

  // Map the DB row into the presentational shape the PDF template expects.
  const pdfQuote = {
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    customer: {
      name: quote.customer?.name ?? quote.customerName,
      email: quote.customer?.email ?? quote.customerEmail,
      phone: quote.customer?.phone ?? undefined,
      city: quote.region ?? undefined,
    },
    vehicle: quote.vehicle
      ? {
          year: quote.vehicle.year ?? undefined,
          make: quote.vehicle.make ?? undefined,
          model: quote.vehicle.model ?? undefined,
          wheelSize: quote.vehicle.wheelSize ?? undefined,
        }
      : undefined,
    service: quote.requestedService ?? '',
    damage: { wheelCount: quote.wheelCount ?? undefined },
    estimatedSubtotal: Number(quote.estimatedSubtotal ?? 0),
    estimatedGst: Number(quote.estimatedGst ?? 0),
    estimatedTotal: Number(quote.estimatedTotal ?? 0),
    createdAt: quote.createdAt,
    photos: quote.photos?.map((p) => ({ blobUrl: `/api/admin/quote-photos/${p.id}` })),
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-brand-ash">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-brand-ash bg-brand-graphite sticky top-0">
          <h2 className="text-lg font-bold text-brand-white">Quote Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-brand-red-hover text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-brand-graphite-light rounded transition-colors"
            >
              <X className="w-5 h-5 text-brand-smoke" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="mx-auto bg-white">
            <div ref={previewRef} className="print:p-0">
              <QuotePDFPreview quote={pdfQuote} company={company} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
