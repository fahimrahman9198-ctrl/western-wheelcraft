interface InvoiceEmailData {
  invoiceNumber: string;
  customerName: string;
  total: number;
  dueDate: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
}

export function invoiceEmailHTML(data: InvoiceEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 30px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          color: #111;
          font-size: 28px;
        }
        .header p {
          margin: 10px 0 0 0;
          color: #666;
        }
        .content {
          margin-bottom: 30px;
        }
        .content p {
          margin: 12px 0;
        }
        .invoice-details {
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 30px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #666;
          font-weight: 500;
        }
        .detail-value {
          font-weight: 600;
          color: #111;
        }
        .total-row {
          background-color: #f9fafb;
          padding: 12px;
          border-radius: 4px;
          margin-top: 12px;
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          font-weight: bold;
        }
        .cta-button {
          display: inline-block;
          background-color: #dc2626;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          margin-top: 20px;
        }
        .contact-info {
          background-color: #f3f4f6;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          font-size: 14px;
        }
        strong {
          color: #111;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.companyName}</h1>
          <p>Invoice #${data.invoiceNumber}</p>
        </div>

        <div class="content">
          <p>Hello <strong>${data.customerName}</strong>,</p>
          <p>Your invoice is ready! Please see the details below or download the attached PDF.</p>
        </div>

        <div class="invoice-details">
          <div class="detail-row">
            <span class="detail-label">Invoice Number:</span>
            <span class="detail-value">${data.invoiceNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Due Date:</span>
            <span class="detail-value">${data.dueDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Due:</span>
            <span class="detail-value">$${data.total.toFixed(2)}</span>
          </div>
        </div>

        <div style="text-align: center;">
          <p>The invoice is attached to this email for your records.</p>
        </div>

        <div class="contact-info">
          <p><strong>Questions?</strong></p>
          <p>${data.companyEmail}<br>${data.companyPhone}</p>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>© ${new Date().getFullYear()} ${data.companyName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function invoiceEmailText(data: InvoiceEmailData): string {
  return `
Hello ${data.customerName},

Your invoice is ready!

Invoice Details:
- Invoice Number: ${data.invoiceNumber}
- Due Date: ${data.dueDate}
- Amount Due: $${data.total.toFixed(2)}

The invoice is attached to this email for your records.

Questions?
Contact: ${data.companyEmail}
Phone: ${data.companyPhone}

Thank you for your business!

© ${new Date().getFullYear()} ${data.companyName}. All rights reserved.
  `;
}
