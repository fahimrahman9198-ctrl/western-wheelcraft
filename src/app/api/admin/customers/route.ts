import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { customers, adminActivities } from '@/lib/db/schema';
import { requireAdminUser } from '@/lib/admin-auth';
import { sql, eq } from 'drizzle-orm';

const CreateCustomerSchema = z.object({
  name: z.string().min(2).max(160),
  email: z.string().email().max(255),
  phone: z.string().max(40).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(120).optional().or(z.literal('')),
  province: z.string().max(50).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  type: z.enum(['individual', 'trade']).default('individual'),
  companyName: z.string().max(255).optional().or(z.literal('')),
  marketingConsent: z.boolean().default(false),
  notes: z.string().max(2000).optional().or(z.literal('')),
});


export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    const body = await request.json();
    const data = CreateCustomerSchema.parse(body);

    // Check email uniqueness
    const existing = await db
      .select({ id: customers.id })
      .from(customers)
      .where(sql`LOWER(${customers.email}) = LOWER(${data.email})`)
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Create customer
    const [customer] = await db
      .insert(customers)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        province: data.province || null,
        postalCode: data.postalCode || null,
        type: data.type,
        companyName: data.companyName || null,
        marketingConsent: data.marketingConsent,
        notes: data.notes || null,
      })
      .returning();

    // Log activity
    await db.insert(adminActivities).values({
      adminClerkUserId: admin.id,
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'create',
      entityType: 'customer',
      entityId: customer.id,
      summary: `Created customer: ${customer.name}`,
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid customer data', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Customer creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

const UpdateCustomerSchema = CreateCustomerSchema.partial();

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdminUser();
    const { customerId, ...body } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const data = UpdateCustomerSchema.parse(body);

    // Check email uniqueness (excluding self)
    if (data.email) {
      const existing = await db
        .select({ id: customers.id })
        .from(customers)
        .where(
          sql`LOWER(${customers.email}) = LOWER(${data.email}) AND ${customers.id} != ${customerId}`
        )
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: Partial<typeof customers.$inferInsert> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.province !== undefined) updateData.province = data.province || null;
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode || null;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.companyName !== undefined) updateData.companyName = data.companyName || null;
    if (data.marketingConsent !== undefined) updateData.marketingConsent = data.marketingConsent;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, customerId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Log activity
    await db.insert(adminActivities).values({
      adminClerkUserId: admin.id,
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'update',
      entityType: 'customer',
      entityId: customerId,
      summary: `Updated customer: ${updated.name}`,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Customer update failed:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdminUser();
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Soft delete by setting archivedAt timestamp
    const [deleted] = await db
      .update(customers)
      .set({
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customerId))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Log activity
    await db.insert(adminActivities).values({
      adminClerkUserId: admin.id,
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'delete',
      entityType: 'customer',
      entityId: customerId,
      summary: `Archived customer: ${deleted.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customer deletion failed:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
