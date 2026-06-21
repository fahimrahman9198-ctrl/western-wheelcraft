import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { bookings, adminActivities } from '@/lib/db/schema';
import { requireAdminUser } from '@/lib/admin-auth';
import { sql } from 'drizzle-orm';

const CreateBookingSchema = z.object({
  customerId: z.string().uuid(),
  serviceType: z.string().min(1),
  slot: z.enum(['shop', 'island', 'kamloops']),
  region: z.string().min(1),
  scheduledDate: z.string().date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  amount: z.number().positive(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    const body = await request.json();
    const data = CreateBookingSchema.parse(body);

    // Generate booking number
    const lastBooking = await db
      .select({ bookingNumber: bookings.bookingNumber })
      .from(bookings)
      .orderBy(sql`CAST(${bookings.bookingNumber} AS INTEGER) DESC`)
      .limit(1);

    const nextNumber = lastBooking.length > 0 ? String(parseInt(lastBooking[0].bookingNumber) + 1) : '1001';

    // Create booking
    const [booking] = await db
      .insert(bookings)
      .values({
        bookingNumber: nextNumber,
        customerId: data.customerId,
        service: data.serviceType,
        serviceType: data.serviceType,
        slot: data.slot as any,
        region: data.region,
        scheduledDate: data.scheduledDate,
        startTime: data.startTime,
        endTime: data.endTime,
        durationMinutes: calculateDuration(data.startTime, data.endTime),
        status: 'pending' as any,
        amount: data.amount.toString(),
        depositPaid: '0',
        notes: data.notes || '',
      })
      .returning();

    // Log activity
    await db.insert(adminActivities).values({
      adminClerkUserId: admin.id,
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'create',
      entityType: 'booking',
      entityId: booking.id,
      summary: `Created booking #${booking.bookingNumber} for ${data.scheduledDate}`,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid booking data', issues: error.issues }, { status: 400 });
    }

    console.error('Booking creation failed:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;

  return endTotalMin - startTotalMin;
}
