'use client';

import { useRef, useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { QuotePDFPreview } from './QuotePDFPreview';
import { generatePDFFromElement } from '@/lib/pdf-generator';

interface QuotePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: any;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
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
      await generatePDFFromElement(previewRef.current, `quote_${quote.quoteNumber}.pdf`);
      toast.success('Quote downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download PDF');
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
              className="p-2 hover:bg-brand-graphite rounded transition-colors"
            >
              <X className="w-5 h-5 text-brand-smoke" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="mx-auto bg-white">
            <div ref={previewRef} className="print:p-0">
              <QuotePDFPreview quote={quote} company={company} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
