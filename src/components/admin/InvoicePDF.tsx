import { format } from 'date-fns';

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoicePDFProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    status: string;
    issuedAt: Date | string;
    dueAt: Date | string;
    subtotal: number;
    gst: number;
    total: number;
    notes?: string;
    lineItems: InvoiceLineItem[];
    customer: {
      name: string;
      email: string;
      phone?: string;
      address?: string;
      city?: string;
      province?: string;
      postalCode?: string;
    };
  };
  company: {
    name: string;
    logo?: string;
    address: string;
    phone: string;
    email: string;
    taxId?: string;
  };
}

const statusColorMap: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  unpaid: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-yellow-100 text-yellow-800',
  void: 'bg-gray-100 text-gray-800',
};

export function InvoicePDF({ invoice, company }: InvoicePDFProps) {
  const issuedDate = invoice.issuedAt instanceof Date ? invoice.issuedAt : new Date(invoice.issuedAt);
  const dueDate = invoice.dueAt instanceof Date ? invoice.dueAt : new Date(invoice.dueAt);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-gray-200">
        <div>
          {company.logo && <img src={company.logo} alt={company.name} className="h-16 object-contain mb-2" />}
          <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
          <p className="text-sm text-gray-600 mt-2">{company.address}</p>
          <p className="text-sm text-gray-600">{company.phone}</p>
          <p className="text-sm text-gray-600">{company.email}</p>
          {company.taxId && <p className="text-sm text-gray-600">Tax ID: {company.taxId}</p>}
        </div>

        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">INVOICE</h2>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-600">Invoice #:</span>
              <span className="font-mono ml-2">{invoice.invoiceNumber}</span>
            </p>
            <p>
              <span className="text-gray-600">Date:</span>
              <span className="ml-2">{format(issuedDate, 'MMM dd, yyyy')}</span>
            </p>
            <p>
              <span className="text-gray-600">Due Date:</span>
              <span className="ml-2">{format(dueDate, 'MMM dd, yyyy')}</span>
            </p>
            <p className="mt-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColorMap[invoice.status] || 'bg-gray-100 text-gray-800'}`}
              >
                {invoice.status.toUpperCase()}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Bill To</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-semibold">{invoice.customer.name}</p>
            {invoice.customer.address && <p>{invoice.customer.address}</p>}
            {invoice.customer.city && (
              <p>
                {invoice.customer.city}
                {invoice.customer.province && `, ${invoice.customer.province}`}
                {invoice.customer.postalCode && ` ${invoice.customer.postalCode}`}
              </p>
            )}
            {invoice.customer.email && <p>{invoice.customer.email}</p>}
            {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
          </div>
        </div>

        <div className="text-right text-sm text-gray-600">
          {/* Empty for spacing */}
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-900 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900 w-24">Qty</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900 w-32">Unit Price</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900 w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, index) => (
              <tr key={item.id || index} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">{item.description}</td>
                <td className="py-3 px-4 text-right text-gray-900">{item.quantity}</td>
                <td className="py-3 px-4 text-right text-gray-900 font-mono">
                  ${item.unitPrice.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right text-gray-900 font-mono">${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-mono text-gray-900">${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-700">GST (5%):</span>
            <span className="font-mono text-gray-900">${invoice.gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 border-t-2 border-b-2 border-gray-900 bg-gray-50">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="font-mono font-semibold text-lg text-gray-900">${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Notes</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="pt-8 border-t-2 border-gray-200 text-center text-xs text-gray-600">
        <p>Thank you for your business!</p>
        <p>
          If you have any questions about this invoice, please contact {company.email} or {company.phone}
        </p>
      </div>
    </div>
  );
}
