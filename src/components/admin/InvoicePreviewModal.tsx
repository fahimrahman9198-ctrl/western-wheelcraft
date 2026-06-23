'use client';

import { useRef, useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { InvoiceTemplate } from './InvoiceTemplate';
import { generatePDFFromElement } from '@/lib/pdf-generator';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  company: {
    name: string;
    logo?: string;
    address: string;
    phone: string;
    email: string;
    taxId?: string;
  };
}

export function InvoicePreviewModal({
  isOpen,
  onClose,
  invoice,
  company,
}: InvoicePreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) {
      toast.error('Invoice preview not found');
      return;
    }

    setIsDownloading(true);
    try {
      await generatePDFFromElement(invoiceRef.current, `invoice_${invoice.invoiceNumber}.pdf`);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-brand-graphite">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-brand-graphite bg-brand-jet-light sticky top-0">
          <h2 className="text-lg font-bold text-brand-white">Invoice #{invoice.invoiceNumber} Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-brand-red-hover text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
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
              className="p-2 hover:bg-brand-graphite rounded transition-colors"
            >
              <X className="w-5 h-5 text-brand-smoke" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="mx-auto bg-white" ref={invoiceRef}>
            <InvoiceTemplate
              invoice={{
                invoiceNumber: invoice.invoiceNumber,
                issuedAt: invoice.issuedAt,
                dueAt: invoice.dueAt,
                customer: {
                  name: invoice.customer?.name || 'Unknown Customer',
                  email: invoice.customer?.email || '',
                  phone: invoice.customer?.phone || '',
                  address: invoice.customer?.address || '',
                },
                vehicle: {
                  vin: invoice.notes?.includes('VIN:')
                    ? invoice.notes.split('VIN: ')[1]?.split(' |')[0] || ''
                    : '',
                  plate: invoice.notes?.includes('Plate/Stock:')
                    ? invoice.notes.split('Plate/Stock: ')[1] || ''
                    : '',
                },
                lineItems: (invoice.lineItems || []).map((item: any) => ({
                  description: item.description,
                  quantity: Number(item.quantity) || 1,
                  unitPrice: Number(item.total) / (Number(item.quantity) || 1) || 0,
                  total: Number(item.total) || 0,
                })),
                subtotal: Number(invoice.subtotal) || 0,
                discount: 0,
                gst: Number(invoice.gst) || 0,
                pst: 0,
                total: Number(invoice.total) || 0,
                notes: invoice.notes || '',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
