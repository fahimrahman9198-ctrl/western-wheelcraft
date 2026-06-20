import 'server-only';

import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { AdminUser } from '@/lib/admin-auth';
import { db, schema } from '@/lib/db';

const moneySchema = z.number().finite().min(0).max(1_000_000);
const noteSchema = z.string().trim().max(5_000).optional();

export const quoteWorkflowUpdateSchema = z
  .object({
    status: z.enum(schema.quoteStatusEnum.enumValues).optional(),
    estimatedSubtotal: moneySchema.optional(),
    note: noteSchema,
  })
  .refine(
    (value) => value.status !== undefined || value.estimatedSubtotal !== undefined || Boolean(value.note),
    { message: 'At least one quote change is required.' }
  );

export const bookingWorkflowUpdateSchema = z
  .object({
    status: z.enum(schema.bookingStatusEnum.enumValues).optional(),
    amount: moneySchema.optional(),
    scheduledDate: z.iso.date().optional(),
    startTime: z.string().trim().min(1).max(20).optional(),
    note: noteSchema,
  })
  .refine(
    (value) =>
      value.status !== undefined ||
      value.amount !== undefined ||
      value.scheduledDate !== undefined ||
      value.startTime !== undefined ||
      Boolean(value.note),
    { message: 'At least one booking change is required.' }
  );

export const customerNoteSchema = z.object({
  body: z.string().trim().min(1).max(5_000),
});

type QuoteWorkflowUpdate = z.infer<typeof quoteWorkflowUpdateSchema>;
type BookingWorkflowUpdate = z.infer<typeof bookingWorkflowUpdateSchema>;

function money(value: number): string {
  return value.toFixed(2);
}

function actorLabel(admin: AdminUser): string {
  return `${admin.displayName} (${admin.role})`;
}

function activityActor(admin: AdminUser) {
  return {
    adminClerkUserId: admin.id,
    adminUsername: admin.username,
    adminRole: admin.role,
  };
}

function asObject(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function updateQuoteWorkflow(
  quoteId: string,
  input: QuoteWorkflowUpdate,
  admin: AdminUser
) {
  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, quoteId),
  });
  if (!quote) return null;

  const changes: string[] = [];
  const update: Partial<typeof schema.quotes.$inferInsert> = { updatedAt: new Date() };
  const metadata: Record<string, unknown> = {};

  if (input.status !== undefined && input.status !== quote.status) {
    update.status = input.status;
    metadata.status = { from: quote.status, to: input.status };
    changes.push(`status to ${input.status}`);

    if ((input.status === 'quoted' || input.status === 'sent') && !quote.sentAt) {
      update.sentAt = new Date();
    }
  }

  if (input.estimatedSubtotal !== undefined) {
    const subtotal = input.estimatedSubtotal;
    const gst = Number((subtotal * 0.05).toFixed(2));
    const total = Number((subtotal + gst).toFixed(2));
    update.estimatedSubtotal = money(subtotal);
    update.estimatedGst = money(gst);
    update.estimatedTotal = money(total);
    update.pricingSnapshot = {
      ...asObject(quote.pricingSnapshot),
      manualOverride: {
        subtotal: money(subtotal),
        gst: money(gst),
        total: money(total),
        changedAt: new Date().toISOString(),
        changedBy: admin.username,
      },
    };
    metadata.price = {
      from: quote.estimatedSubtotal,
      to: money(subtotal),
      gst: money(gst),
      total: money(total),
    };
    changes.push(`subtotal to ${money(subtotal)} CAD`);
  }

  if (input.note) changes.push('an internal note');
  const summary = `Updated ${quote.quoteNumber}: ${changes.join(', ')}.`;

  const updateStatement = db.update(schema.quotes).set(update).where(eq(schema.quotes.id, quoteId));
  const activityStatement = db.insert(schema.adminActivities).values({
      ...activityActor(admin),
      action: 'quote.updated',
      entityType: 'quote',
      entityId: quote.id,
      summary,
      metadata,
    });

  if (input.note) {
    const noteStatement = db.insert(schema.communications).values({
        customerId: quote.customerId,
        type: 'note',
        direction: 'internal',
        subject: `Internal note for ${quote.quoteNumber}`,
        body: input.note,
        createdBy: actorLabel(admin),
        relatedType: 'quote',
        relatedId: quote.id,
      });
    await db.batch([updateStatement, activityStatement, noteStatement]);
  } else {
    await db.batch([updateStatement, activityStatement]);
  }

  return db.query.quotes.findFirst({ where: eq(schema.quotes.id, quoteId) });
}

export async function updateBookingWorkflow(
  bookingId: string,
  input: BookingWorkflowUpdate,
  admin: AdminUser
) {
  const booking = await db.query.bookings.findFirst({
    where: eq(schema.bookings.id, bookingId),
  });
  if (!booking) return null;

  const changes: string[] = [];
  const update: Partial<typeof schema.bookings.$inferInsert> = { updatedAt: new Date() };
  const metadata: Record<string, unknown> = {};

  if (input.status !== undefined && input.status !== booking.status) {
    update.status = input.status;
    metadata.status = { from: booking.status, to: input.status };
    changes.push(`status to ${input.status}`);
  }
  if (input.amount !== undefined) {
    update.amount = money(input.amount);
    metadata.amount = { from: booking.amount, to: money(input.amount) };
    changes.push(`amount to ${money(input.amount)} CAD`);
  }
  if (input.scheduledDate !== undefined && input.scheduledDate !== booking.scheduledDate) {
    update.scheduledDate = input.scheduledDate;
    metadata.scheduledDate = { from: booking.scheduledDate, to: input.scheduledDate };
    changes.push(`date to ${input.scheduledDate}`);
  }
  if (input.startTime !== undefined && input.startTime !== booking.startTime) {
    update.startTime = input.startTime;
    metadata.startTime = { from: booking.startTime, to: input.startTime };
    changes.push(`time to ${input.startTime}`);
  }
  if (input.note) changes.push('an internal note');

  const summary = `Updated ${booking.bookingNumber}: ${changes.join(', ')}.`;
  const updateStatement = db.update(schema.bookings).set(update).where(eq(schema.bookings.id, bookingId));
  const activityStatement = db.insert(schema.adminActivities).values({
      ...activityActor(admin),
      action: 'booking.updated',
      entityType: 'booking',
      entityId: booking.id,
      summary,
      metadata,
    });

  if (input.note) {
    const noteStatement = db.insert(schema.communications).values({
        customerId: booking.customerId,
        type: 'note',
        direction: 'internal',
        subject: `Internal note for ${booking.bookingNumber}`,
        body: input.note,
        createdBy: actorLabel(admin),
        relatedType: 'booking',
        relatedId: booking.id,
      });
    await db.batch([updateStatement, activityStatement, noteStatement]);
  } else {
    await db.batch([updateStatement, activityStatement]);
  }

  return db.query.bookings.findFirst({ where: eq(schema.bookings.id, bookingId) });
}

export async function addCustomerNote(customerId: string, body: string, admin: AdminUser) {
  const customer = await db.query.customers.findFirst({
    where: eq(schema.customers.id, customerId),
  });
  if (!customer) return null;

  const communicationId = randomUUID();
  await db.batch([
    db.insert(schema.communications).values({
      id: communicationId,
      customerId: customer.id,
      type: 'note',
      direction: 'internal',
      subject: 'Internal customer note',
      body,
      createdBy: actorLabel(admin),
      relatedType: 'customer',
      relatedId: customer.id,
    }),
    db.insert(schema.adminActivities).values({
      ...activityActor(admin),
      action: 'customer.note_added',
      entityType: 'customer',
      entityId: customer.id,
      summary: `Added an internal note for ${customer.name}.`,
      metadata: { communicationId },
    }),
  ]);

  return db.query.communications.findFirst({
    where: eq(schema.communications.id, communicationId),
  });
}
