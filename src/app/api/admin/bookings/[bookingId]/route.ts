import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminUser } from '@/lib/admin-auth';
import { bookingWorkflowUpdateSchema, updateBookingWorkflow } from '@/lib/admin-workflows';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    const bookingId = z.uuid().parse((await params).bookingId);
    const input = bookingWorkflowUpdateSchema.parse(await request.json());
    const booking = await updateBookingWorkflow(bookingId, input, admin);
    if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid booking update.', issues: error.issues }, { status: 400 });
    }
    console.error('Admin booking update failed', error);
    return NextResponse.json({ error: 'Unable to update booking.' }, { status: 500 });
  }
}
