import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { invoices, invoiceLineItems, adminActivities } from '@/lib/db/schema';
import { requireAdminUser } from '@/lib/admin-auth';
import { calcInvoiceTotals } from '@/lib/payment-utils';
import { sql } from 'drizzle-orm';

const CreateInvoiceSchema = z.object({
  customerId: z.string().uuid(),
  bookingId: z.string().uuid().optional(),
  quoteId: z.string().uuid().optional(),
  lineItems: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().positive().default(1),
      unitPrice: z.number().nonnegative(),
    })
  ),
  notes: z.string().optional(),
  dueDate: z.string().optional(), // ISO date string
});

const UpdateInvoiceSchema = z.object({
  status: z.enum(['draft', 'unpaid', 'paid', 'overdue', 'void']).optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    const body = await request.json();
    const data = CreateInvoiceSchema.parse(body);

    // Generate invoice number
    const lastInvoice = await db
      .select({ invoiceNumber: invoices.invoiceNumber })
      .from(invoices)
      .orderBy(sql`CAST(${invoices.invoiceNumber} AS INTEGER) DESC`)
      .limit(1);

    const nextNumber = lastInvoice.length > 0 ? String(parseInt(lastInvoice[0].invoiceNumber) + 1) : '1001';

    // Calculate totals — shared helper applies GST (5%) + PST (7%)
    const subtotal = data.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const { gst, pst, total } = calcInvoiceTotals(subtotal);

    // Create invoice
    const [invoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber: nextNumber,
        customerId: data.customerId,
        bookingId: data.bookingId || null,
        quoteId: data.quoteId || null,
        subtotal: subtotal.toString(),
        gst: gst.toString(),
        pst: pst.toString(),
        total: total.toString(),
        status: 'draft',
        notes: data.notes || '',
        issuedAt: new Date(),
        dueAt: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .returning();

    // Create line items
    const createdLineItems = await db
      .insert(invoiceLineItems)
      .values(
        data.lineItems.map((item, index) => ({
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          total: (item.quantity * item.unitPrice).toString(),
          sortOrder: index,
        }))
      )
      .returning();

    // Log activity
    await db.insert(adminActivities).values({
      adminClerkUserId: admin.id,
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'create',
      entityType: 'invoice',
      entityId: invoice.id,
      summary: `Created invoice #${invoice.invoiceNumber} for $${total.toFixed(2)}`,
    });

    return NextResponse.json(
      {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        subtotal,
        gst,
        total,
        lineItems: createdLineItems,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid invoice data', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Invoice creation failed:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdminUser();
    const { invoiceId, ...body } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const data = UpdateInvoiceSchema.parse(body);

    const updateData: Record<string, any> = {};
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const [updated] = await db
      .update(invoices)
      .set(updateData)
      .where(sql`${invoices.id} = ${invoiceId}`)
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Log activity
    await db.insert(adminActivities).values({
      adminClerkUserId: admin.id,
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'update',
      entityType: 'invoice',
      entityId: invoiceId,
      summary: `Updated invoice #${updated.invoiceNumber}: ${Object.keys(updateData).join(', ')}`,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Invoice update failed:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}
