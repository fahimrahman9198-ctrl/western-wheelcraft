import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAdminUser } from '@/lib/admin-auth';
import {
  getAdminSettings,
  parseAdminSettingsUpdate,
  saveAdminSetting,
} from '@/lib/admin-settings';

async function requireApiAdmin() {
  const adminUser = await getCurrentAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const unauthorized = await requireApiAdmin();
  if (unauthorized) return unauthorized;

  try {
    const settings = await getAdminSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Admin settings load failed', error);
    return NextResponse.json({ error: 'Unable to load admin settings.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireApiAdmin();
  if (unauthorized) return unauthorized;

  try {
    const update = parseAdminSettingsUpdate(await request.json());
    const settings = await saveAdminSetting(update.section, update.value);
    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid settings payload.', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Admin settings save failed', error);
    return NextResponse.json({ error: 'Unable to save admin settings.' }, { status: 500 });
  }
}
