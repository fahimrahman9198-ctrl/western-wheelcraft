import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { db } from '@/lib/db';
import { invoices, adminActivities } from '@/lib/db/schema';
import { requireAdminUser } from '@/lib/admin-auth';
import { eq } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

const ResendInvoiceSchema = z.object({
  invoiceId: z.string().uuid(),
});

type ResendInvoiceInput = z.infer<typeof ResendInvoiceSchema>;

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    const body = await request.json();
    const { invoiceId } = ResendInvoiceSchema.parse(body);

    // Fetch invoice with relations
    const invoiceData = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId),
      with: {
        customer: true,
        lineItems: true,
      },
    });

    if (!invoiceData) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (!invoiceData.customer?.email) {
      return NextResponse.json(
        { error: 'Customer email not found' },
        { status: 400 }
      );
    }

    // Invoice link (customer can view/download via the admin portal link)
    const invoiceLink = `https://western-wheelcraft.vercel.app/admin/invoices/${invoiceId}`;

    // Send email via Resend
    const emailResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Western Wheelcraft <info@westernwheelcraft.ca>',
      to: invoiceData.customer.email,
      subject: `Invoice #${invoiceData.invoiceNumber} - Western Wheelcraft`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background-color: #1a1a1a; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Western Wheelcraft</h1>
            <p style="margin: 5px 0 0 0; color: #ccc;">Invoice #${invoiceData.invoiceNumber}</p>
          </div>

          <div style="padding: 30px; background-color: #f9f9f9;">
            <p>Hi ${invoiceData.customer.name},</p>

            <p>Thank you for your business. Your invoice is ready:</p>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <p style="margin: 0 0 10px 0;"><strong>Invoice Number:</strong> #${invoiceData.invoiceNumber}</p>
              <p style="margin: 0 0 10px 0;"><strong>Amount Due:</strong> $${Number(invoiceData.total).toFixed(2)}</p>
              <p style="margin: 0;"><strong>Due Date:</strong> ${invoiceData.dueAt ? new Date(invoiceData.dueAt).toLocaleDateString() : 'Upon receipt'}</p>
            </div>

            <p style="text-align: center; margin: 30px 0;">
              <a href="${invoiceLink}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Invoice
              </a>
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />

            <div style="font-size: 12px; color: #666;">
              <p style="margin: 5px 0;"><strong>Western Wheelcraft Ltd.</strong></p>
              <p style="margin: 5px 0;">3756 Napier Street, Burnaby, BC V5C 3E5</p>
              <p style="margin: 5px 0;">Phone: (604) 710-6174</p>
              <p style="margin: 5px 0;">Email: info@westernwheelcraft.ca</p>
            </div>

            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              If you have any questions, please contact us at (604) 710-6174 or reply to this email.
            </p>
          </div>
        </div>
      `,
    });

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error);
      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error.message}` },
        { status: 500 }
      );
    }

    // Log activity
    await db.insert(adminActivities).values({
      adminClerkUserId: admin.id,
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'resend',
      entityType: 'invoice',
      entityId: invoiceId,
      summary: `Sent invoice #${invoiceData.invoiceNumber} to ${invoiceData.customer.email}`,
    });

    return NextResponse.json({
      success: true,
      messageId: emailResult.data?.id,
      email: invoiceData.customer.email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Invoice resend failed:', error);
    return NextResponse.json(
      { error: 'Failed to resend invoice' },
      { status: 500 }
    );
  }
}
