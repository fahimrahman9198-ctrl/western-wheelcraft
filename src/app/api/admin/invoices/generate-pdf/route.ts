import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    await requireAdminUser();
    const { html } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // Import required modules for server-side PDF generation
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    // Create a temporary element with the HTML
    // Note: On server-side, we need to use a different approach
    // For now, return the HTML and let the client handle it
    // or use a service like html2pdf

    // Return a success response with instructions for client-side generation
    return NextResponse.json(
      {
        success: true,
        message: 'Use client-side PDF generation for best results'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PDF generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(invoiceData: any, company: any): string {
  const formatMoney = (value: number) => `$${value.toFixed(2)}`;

  const lineItemsHTML = invoiceData.lineItems
    .map(
      (item: any) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 16px; text-align: left; color: #111827;">${item.description}</td>
      <td style="padding: 12px 16px; text-align: center; color: #111827;">${item.quantity}</td>
      <td style="padding: 12px 16px; text-align: right; color: #111827; font-family: monospace;">${formatMoney(item.unitPrice)}</td>
      <td style="padding: 12px 16px; text-align: right; color: #111827; font-family: monospace; font-weight: 600;">${formatMoney(item.total)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoiceData.invoiceNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #111827; }
        .container { max-width: 900px; margin: 0 auto; padding: 48px; background: white; }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 48px;
          padding-bottom: 32px;
          border-bottom: 2px solid #d1d5db;
        }

        .company-info h1 {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .company-details {
          margin-top: 16px;
          font-size: 14px;
          color: #4b5563;
          line-height: 1.4;
        }

        .invoice-info { text-align: right; }
        .invoice-info h2 { font-size: 32px; font-weight: bold; margin-bottom: 16px; }
        .invoice-number {
          background: #1f2937;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 16px;
        }

        .invoice-number-label {
          font-size: 12px;
          margin-bottom: 4px;
        }

        .invoice-number-value {
          font-size: 24px;
          font-weight: bold;
          font-family: monospace;
        }

        .invoice-dates {
          margin-top: 16px;
          font-size: 14px;
          color: #4b5563;
        }

        .dates-row {
          margin-bottom: 8px;
        }

        .dates-row span:first-child {
          font-weight: 600;
        }

        .customer-vehicle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 32px;
        }

        .customer-section h3,
        .vehicle-section h3 {
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #4b5563;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #d1d5db;
        }

        .customer-info,
        .vehicle-info {
          font-size: 14px;
          color: #111827;
          line-height: 1.4;
        }

        .customer-name {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .vehicle-info p {
          margin-bottom: 4px;
        }

        table {
          width: 100%;
          margin-bottom: 32px;
          border-collapse: collapse;
        }

        thead {
          background: none;
        }

        thead tr {
          border-bottom: 2px solid #1f2937;
        }

        th {
          padding: 12px 16px;
          text-align: left;
          font-weight: bold;
          color: #1f2937;
          font-size: 14px;
        }

        th:nth-child(2),
        th:nth-child(3),
        th:nth-child(4) {
          text-align: right;
        }

        td {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        td:nth-child(2),
        td:nth-child(3),
        td:nth-child(4) {
          text-align: right;
        }

        .totals {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 32px;
        }

        .totals-box {
          width: 400px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 16px;
          font-size: 14px;
        }

        .total-row.subtotal { border-bottom: 1px solid #e5e7eb; }
        .total-row.after-discount {
          border-bottom: 2px solid #d1d5db;
          background: #f9fafb;
          font-weight: 600;
        }
        .total-row.gst { border-bottom: 1px solid #e5e7eb; }
        .total-row.pst { border-bottom: 2px solid #d1d5db; }
        .total-row.total {
          background: #1f2937;
          color: white;
          font-weight: bold;
          padding: 16px;
          border-radius: 0 0 4px 4px;
          font-size: 18px;
        }

        .total-label { color: #4b5563; }
        .total-amount { font-family: monospace; }
        .discount { color: #dc2626; }

        .notes {
          background: #f9fafb;
          padding: 16px;
          border-radius: 4px;
          border: 1px solid #d1d5db;
          margin-bottom: 32px;
        }

        .notes h3 {
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          color: #4b5563;
          margin-bottom: 8px;
        }

        .notes-content {
          font-size: 14px;
          color: #111827;
          white-space: pre-wrap;
        }

        footer {
          padding-top: 32px;
          border-top: 2px solid #d1d5db;
          text-align: center;
          font-size: 12px;
          color: #4b5563;
          line-height: 1.6;
        }

        @media print {
          body { padding: 0; margin: 0; }
          .container { padding: 0; max-width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <h1>🎯 ${company.name}</h1>
            <div class="company-details">
              <div>${company.address}</div>
              <div>Phone: ${company.phone}</div>
              <div>Email: ${company.email}</div>
              ${company.taxId ? `<div>${company.taxId}</div>` : ''}
            </div>
          </div>
          <div class="invoice-info">
            <h2>INVOICE</h2>
            <div class="invoice-number">
              <div class="invoice-number-label">Invoice #</div>
              <div class="invoice-number-value">${invoiceData.invoiceNumber}</div>
            </div>
            <div class="invoice-dates">
              <div class="dates-row">
                <span>Issued:</span> ${new Date(invoiceData.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <div class="dates-row">
                <span>Due:</span> ${new Date(invoiceData.dueAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        <!-- Customer & Vehicle -->
        <div class="customer-vehicle">
          <div class="customer-section">
            <h3>Bill To</h3>
            <div class="customer-info">
              <div class="customer-name">${invoiceData.customer.name}</div>
              ${invoiceData.customer.address ? `<div>${invoiceData.customer.address}</div>` : ''}
              <div>Email: ${invoiceData.customer.email}</div>
              <div>Phone: ${invoiceData.customer.phone}</div>
            </div>
          </div>
          <div class="vehicle-section">
            <h3>Vehicle Information</h3>
            <div class="vehicle-info">
              ${invoiceData.vehicle.vin ? `<p><strong>VIN:</strong> ${invoiceData.vehicle.vin}</p>` : '<p style="color: #9ca3af;">No VIN provided</p>'}
              ${invoiceData.vehicle.plate ? `<p><strong>Plate/Stock:</strong> ${invoiceData.vehicle.plate}</p>` : ''}
            </div>
          </div>
        </div>

        <!-- Line Items -->
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="width: 100px;">Qty</th>
              <th style="width: 150px;">Unit Price</th>
              <th style="width: 150px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHTML}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
          <div class="totals-box">
            <div class="total-row subtotal">
              <span class="total-label">Subtotal:</span>
              <span class="total-amount">${formatMoney(invoiceData.subtotal)}</span>
            </div>
            ${
              invoiceData.discount > 0
                ? `
              <div class="total-row">
                <span class="total-label discount">Discount:</span>
                <span class="total-amount discount">-${formatMoney(invoiceData.discount)}</span>
              </div>
              <div class="total-row after-discount">
                <span class="total-label">Subtotal After Discount:</span>
                <span class="total-amount">${formatMoney(invoiceData.subtotal - invoiceData.discount)}</span>
              </div>
              `
                : ''
            }
            <div class="total-row gst">
              <span class="total-label">GST (5%):</span>
              <span class="total-amount">${formatMoney(invoiceData.gst)}</span>
            </div>
            <div class="total-row pst">
              <span class="total-label">PST (7%):</span>
              <span class="total-amount">${formatMoney(invoiceData.pst)}</span>
            </div>
            <div class="total-row total">
              <span>TOTAL DUE:</span>
              <span class="total-amount">${formatMoney(invoiceData.total)}</span>
            </div>
          </div>
        </div>

        ${
          invoiceData.notes
            ? `
        <div class="notes">
          <h3>Notes</h3>
          <div class="notes-content">${invoiceData.notes}</div>
        </div>
        `
            : ''
        }

        <!-- Footer -->
        <footer>
          <p style="font-weight: 600;">Thank you for your business!</p>
          <p>For questions, contact ${company.email} or ${company.phone}</p>
          <p style="color: #9ca3af; margin-top: 12px;">© ${new Date().getFullYear()} ${company.name}. All rights reserved.</p>
        </footer>
      </div>
    </body>
    </html>
  `;
}

async function generatePDFFromHTML(html: string): Promise<Buffer> {
  // For now, we're using a simple approach - in production you might use:
  // - puppeteer/playwright for server-side rendering
  // - html2pdf library
  // - or send to a PDF service

  // This is a placeholder that uses a minimal PDF generation
  // The client-side html2canvas approach is actually more practical here
  // since it preserves styling perfectly

  const pdfBytes = await generateSimplePDF(html);
  return pdfBytes;
}

// Simple PDF generation using a lightweight approach
// In production, consider using: npm install pdfkit html2pdf
async function generateSimplePDF(html: string): Promise<Buffer> {
  // For MVP, we'll return a basic response
  // Production should use jsPDF + html2canvas on the server
  // or a dedicated PDF service like PDFShift or similar

  // Create a minimal PDF structure
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Invoice Generated) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000273 00000 n
0000000368 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
452
%%EOF`;

  return Buffer.from(pdfContent);
}
