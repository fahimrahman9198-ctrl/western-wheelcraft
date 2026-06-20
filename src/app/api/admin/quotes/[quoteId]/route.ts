import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminUser } from '@/lib/admin-auth';
import { quoteWorkflowUpdateSchema, updateQuoteWorkflow } from '@/lib/admin-workflows';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    const quoteId = z.uuid().parse((await params).quoteId);
    const input = quoteWorkflowUpdateSchema.parse(await request.json());
    const quote = await updateQuoteWorkflow(quoteId, input, admin);
    if (!quote) return NextResponse.json({ error: 'Quote not found.' }, { status: 404 });
    return NextResponse.json({ quote });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid quote update.', issues: error.issues }, { status: 400 });
    }
    console.error('Admin quote update failed', error);
    return NextResponse.json({ error: 'Unable to update quote.' }, { status: 500 });
  }
}
