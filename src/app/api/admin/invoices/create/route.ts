import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { invoices, invoiceLineItems, customers, adminActivities } from '@/lib/db/schema';
import { requireAdminUser } from '@/lib/admin-auth';
import { calcInvoiceTotals } from '@/lib/payment-utils';
import { sql, eq } from 'drizzle-orm';

// gst/pst/total are intentionally NOT accepted from the client — the server
// is the single source of truth and recomputes them from price + discount.
const CreateInvoiceFormSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
  vehicleVIN: z.string().optional().or(z.literal('')),
  vehiclePlate: z.string().optional().or(z.literal('')),
  wheelsWorked: z.number().min(1).max(4),
  description: z.string().optional().or(z.literal('')),
  price: z.number().positive(),
  discount: z.number().min(0).default(0),
});


export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    const body = await request.json();
    const data = CreateInvoiceFormSchema.parse(body);

    // Check if customer exists, if not create one
    let customerId: string;
    const existingCustomer = await db
      .select({ id: customers.id })
      .from(customers)
      .where(sql`LOWER(${customers.email}) = LOWER(${data.customerEmail})`)
      .limit(1);

    if (existingCustomer.length > 0) {
      customerId = existingCustomer[0].id;
    } else {
      const [newCustomer] = await db
        .insert(customers)
        .values({
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
          type: 'individual',
        })
        .returning();
      customerId = newCustomer.id;
    }

    // Generate invoice number
    const lastInvoice = await db
      .select({ invoiceNumber: invoices.invoiceNumber })
      .from(invoices)
      .orderBy(sql`CAST(${invoices.invoiceNumber} AS INTEGER) DESC`)
      .limit(1);

    const nextNumber = lastInvoice.length > 0 ? String(parseInt(lastInvoice[0].invoiceNumber) + 1) : '1001';

    // Create invoice — server recomputes all tax from subtotal (source of truth)
    const subtotal = data.price - data.discount;
    const { gst, pst, total } = calcInvoiceTotals(subtotal);
    const [invoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber: nextNumber,
        customerId,
        subtotal: subtotal.toString(),
        gst: gst.toString(),
        pst: pst.toString(),
        total: total.toString(),
        status: 'unpaid',
        issuedAt: new Date(),
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .returning();

    // Create line item
    const description = data.description || `Wheel service - ${data.wheelsWorked} wheel${data.wheelsWorked > 1 ? 's' : ''} worked`;
    const lineItemTotal = subtotal;

    await db.insert(invoiceLineItems).values({
      invoiceId: invoice.id,
      description: description,
      quantity: data.wheelsWorked.toString(),
      unitPrice: (data.price / data.wheelsWorked).toString(),
      total: lineItemTotal.toString(),
      sortOrder: 0,
    });

    // Store vehicle info in notes
    const vehicleInfo = [
      data.vehicleVIN && `VIN: ${data.vehicleVIN}`,
      data.vehiclePlate && `Plate/Stock: ${data.vehiclePlate}`,
    ]
      .filter(Boolean)
      .join(' | ');

    if (vehicleInfo) {
      await db
        .update(invoices)
        .set({ notes: vehicleInfo })
        .where(eq(invoices.id, invoice.id));
    }

    // Log activity
    await db.insert(adminActivities).values({
      adminClerkUserId: admin.id,
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'create',
      entityType: 'invoice',
      entityId: invoice.id,
      summary: `Created invoice #${invoice.invoiceNumber} for ${data.customerName} - $${total.toFixed(2)}`,
    });

    return NextResponse.json(
      {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        success: true,
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
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
