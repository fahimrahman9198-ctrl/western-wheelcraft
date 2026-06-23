import { format } from 'date-fns';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  issuedAt: Date | string;
  dueAt: Date | string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  vehicle?: {
    vin?: string;
    plate?: string;
  };
  lineItems: LineItem[];
  subtotal: number;
  discount?: number;
  gst: number;
  pst: number;
  total: number;
  notes?: string;
}

export function InvoiceTemplate({ invoice }: { invoice: InvoiceData }) {
  const issuedDate = invoice.issuedAt instanceof Date ? invoice.issuedAt : new Date(invoice.issuedAt);
  const dueDate = invoice.dueAt instanceof Date ? invoice.dueAt : new Date(invoice.dueAt);

  // Company info
  const companyData = {
    name: 'Western Wheelcraft',
    logo: '/images/logo.PNG',
    address: '3756 Napier St, Burnaby, BC V5C 3E5',
    phone: '(604) 710-6174',
    email: 'info@westernwheelcraft.ca',
    taxId: 'GST# 843250168RT001 | PST# PST-1016-1322',
  };

  const discountAmount = invoice.discount || 0;
  const afterDiscount = invoice.subtotal - discountAmount;

  return (
    <div data-invoice-template className="w-full max-w-4xl mx-auto bg-white p-12 print:p-0" style={{ fontFamily: 'Arial, sans-serif', color: '#111827' }}>
      {/* Header Section */}
      <div className="flex justify-between items-start mb-12 pb-8 border-b-2 border-gray-300">
        {/* Company Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <img
              src={companyData.logo}
              alt={companyData.name}
              crossOrigin="anonymous"
              style={{ width: '64px', height: '64px', objectFit: 'contain' }}
            />
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
              {companyData.name}
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-4 space-y-1">
            <p>{companyData.address}</p>
            <p>Phone: {companyData.phone}</p>
            <p>Email: {companyData.email}</p>
            <p>{companyData.taxId}</p>
          </div>
        </div>

        {/* Invoice Info */}
        <div className="text-right">
          <div className="text-4xl font-bold text-gray-900 mb-4">INVOICE</div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              Invoice Number
            </div>
            <div style={{ fontSize: '28px', color: '#111827', fontFamily: 'monospace', fontWeight: 'bold', lineHeight: '1.2' }}>
              #{invoice.invoiceNumber}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-700 space-y-1">
            <p>
              <span className="font-semibold">Issued:</span> {format(issuedDate, 'MMM dd, yyyy')}
            </p>
            <p>
              <span className="font-semibold">Due:</span> {format(dueDate, 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Customer & Vehicle Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Bill To */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-3 pb-2 border-b border-gray-300">
            Bill To
          </h3>
          <div className="text-sm text-gray-800 space-y-1">
            <p className="font-bold text-base">{invoice.customer.name}</p>
            {invoice.customer.address && <p>{invoice.customer.address}</p>}
            <p>Email: {invoice.customer.email}</p>
            <p>Phone: {invoice.customer.phone}</p>
          </div>
        </div>

        {/* Vehicle Info */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-3 pb-2 border-b border-gray-300">
            Vehicle Information
          </h3>
          <div className="text-sm text-gray-800 space-y-1">
            {invoice.vehicle?.vin ? (
              <p>
                <span className="font-semibold">VIN:</span> {invoice.vehicle.vin}
              </p>
            ) : (
              <p className="text-gray-500">No VIN provided</p>
            )}
            {invoice.vehicle?.plate && (
              <p>
                <span className="font-semibold">Plate/Stock:</span> {invoice.vehicle.plate}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="text-left py-3 px-4 font-bold text-gray-900 text-sm">Description</th>
              <th className="text-center py-3 px-4 font-bold text-gray-900 text-sm w-24">Qty</th>
              <th className="text-right py-3 px-4 font-bold text-gray-900 text-sm w-32">Unit Price</th>
              <th className="text-right py-3 px-4 font-bold text-gray-900 text-sm w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900 text-sm">{item.description}</td>
                <td className="py-3 px-4 text-center text-gray-900 text-sm">{item.quantity}</td>
                <td className="py-3 px-4 text-right text-gray-900 text-sm font-mono">
                  ${item.unitPrice.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right text-gray-900 text-sm font-mono font-semibold">
                  ${item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-8">
        <div className="w-96">
          {/* Subtotal */}
          <div className="flex justify-between py-2 px-4 text-sm">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-mono text-gray-900">${invoice.subtotal.toFixed(2)}</span>
          </div>

          {/* Discount */}
          {discountAmount > 0 && (
            <div className="flex justify-between py-2 px-4 text-sm">
              <span className="text-gray-700">Discount:</span>
              <span className="font-mono text-red-600">-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          {/* After Discount */}
          {discountAmount > 0 && (
            <div className="flex justify-between py-2 px-4 text-sm border-b-2 border-gray-300 bg-gray-50">
              <span className="text-gray-700">Subtotal After Discount:</span>
              <span className="font-mono text-gray-900 font-semibold">${afterDiscount.toFixed(2)}</span>
            </div>
          )}

          {/* GST */}
          <div className="flex justify-between py-2 px-4 text-sm border-b border-gray-200">
            <span className="text-gray-700">GST (5%):</span>
            <span className="font-mono text-gray-900">${invoice.gst.toFixed(2)}</span>
          </div>

          {/* PST */}
          <div className="flex justify-between py-2 px-4 text-sm border-b-2 border-gray-300">
            <span className="text-gray-700">PST (7%):</span>
            <span className="font-mono text-gray-900">${invoice.pst.toFixed(2)}</span>
          </div>

          {/* Total */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px 20px',
              fontSize: '20px',
              fontWeight: 'bold',
              backgroundColor: '#f3f4f6',
              color: '#111827',
              borderTop: '3px solid #111827',
              borderBottom: '3px solid #111827',
              marginTop: '4px',
            }}
          >
            <span style={{ color: '#111827' }}>TOTAL DUE:</span>
            <span style={{ color: '#111827', fontFamily: 'monospace' }}>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Notes</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="pt-8 border-t-2 border-gray-300 text-center text-xs text-gray-600 space-y-1">
        <p className="font-semibold">Thank you for your business!</p>
        <p>
          For questions, contact {companyData.email} or {companyData.phone}
        </p>
        <p className="text-gray-500 mt-3">
          © {new Date().getFullYear()} {companyData.name}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
