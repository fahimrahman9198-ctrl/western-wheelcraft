import { format } from 'date-fns';

interface QuotePDFPreviewProps {
  quote: {
    id: string;
    quoteNumber: string;
    customer: {
      name: string;
      email: string;
      phone?: string;
      city?: string;
    };
    vehicle?: {
      year?: number;
      make?: string;
      model?: string;
      wheelSize?: string;
    };
    service: string;
    damage?: {
      wheelCount?: number;
    };
    estimatedSubtotal: number;
    estimatedGst: number;
    estimatedTotal: number;
    createdAt: Date | string;
    photos?: Array<{ blobUrl: string }>;
  };
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export function QuotePDFPreview({ quote, company }: QuotePDFPreviewProps) {
  const createdDate =
    quote.createdAt instanceof Date
      ? quote.createdAt
      : new Date(quote.createdAt);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
          <p className="text-sm text-gray-600 mt-2">{company.address}</p>
          <p className="text-sm text-gray-600">{company.phone}</p>
          <p className="text-sm text-gray-600">{company.email}</p>
        </div>

        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">QUOTE</h2>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-600">Quote #:</span>
              <span className="font-mono ml-2">{quote.quoteNumber}</span>
            </p>
            <p>
              <span className="text-gray-600">Date:</span>
              <span className="ml-2">{format(createdDate, 'MMM dd, yyyy')}</span>
            </p>
            <p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                ESTIMATE
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Customer
          </h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-semibold">{quote.customer.name}</p>
            {quote.customer.city && <p>{quote.customer.city}</p>}
            {quote.customer.email && <p>{quote.customer.email}</p>}
            {quote.customer.phone && <p>{quote.customer.phone}</p>}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Vehicle
          </h3>
          <div className="text-sm text-gray-700 space-y-1">
            {quote.vehicle ? (
              <>
                <p className="font-semibold">
                  {quote.vehicle.year} {quote.vehicle.make} {quote.vehicle.model}
                </p>
                {quote.vehicle.wheelSize && (
                  <p>Wheel Size: {quote.vehicle.wheelSize}</p>
                )}
              </>
            ) : (
              <p className="text-gray-500">Vehicle not provided</p>
            )}
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
          Service
        </h3>
        <p className="text-sm text-gray-700">{quote.service}</p>
        {quote.damage?.wheelCount && (
          <p className="text-sm text-gray-600 mt-2">
            Wheels: {quote.damage.wheelCount}
          </p>
        )}
      </div>

      {/* Photos Preview */}
      {quote.photos && quote.photos.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Photos
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {quote.photos.slice(0, 4).map((photo, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-lg overflow-hidden bg-gray-200"
              >
                <img
                  src={photo.blobUrl}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {quote.photos.length > 4 && (
              <div className="aspect-square rounded-lg bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                +{quote.photos.length - 4} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pricing */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
          Estimated Pricing
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-mono text-gray-900">
              ${quote.estimatedSubtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-700">GST (5%):</span>
            <span className="font-mono text-gray-900">
              ${quote.estimatedGst.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between py-3 border-t-2 border-gray-900 bg-white">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="font-mono font-semibold text-lg text-gray-900">
              ${quote.estimatedTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 border-t-2 border-gray-200 text-center text-xs text-gray-600">
        <p>This is an estimate only. Final pricing will be confirmed after technician review.</p>
        <p>Thank you for choosing {company.name}!</p>
      </div>
    </div>
  );
}
