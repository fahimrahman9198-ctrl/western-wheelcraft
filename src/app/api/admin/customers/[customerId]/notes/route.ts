import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminUser } from '@/lib/admin-auth';
import { addCustomerNote, customerNoteSchema } from '@/lib/admin-workflows';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    const customerId = z.uuid().parse((await params).customerId);
    const { body } = customerNoteSchema.parse(await request.json());
    const note = await addCustomerNote(customerId, body, admin);
    if (!note) return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid customer note.', issues: error.issues }, { status: 400 });
    }
    console.error('Admin customer note failed', error);
    return NextResponse.json({ error: 'Unable to add customer note.' }, { status: 500 });
  }
}
