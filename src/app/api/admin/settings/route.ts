import { NextResponse } from 'next/server';
import { z } from 'zod';
import { put, del } from '@vercel/blob';
import { db } from '@/lib/db';
import { adminSettings, adminActivities } from '@/lib/db/schema';
import { requireAdminUser } from '@/lib/admin-auth';
import { eq } from 'drizzle-orm';

const CompanySettingsSchema = z.object({
  name: z.string().min(2).max(255),
  address: z.string().min(5).max(500),
  phone: z.string().min(10).max(40),
  email: z.string().email().max(255),
  taxId: z.string().max(50).optional().or(z.literal('')),
  invoiceTerms: z.string().max(2000).optional().or(z.literal('')),
  bankDetails: z.string().max(500).optional().or(z.literal('')),
  logoBlobUrl: z.string().optional().or(z.literal('')),
});

type CompanySettingsInput = z.infer<typeof CompanySettingsSchema>;

const COMPANY_INFO_KEY = 'company_info';

export async function GET(request: Request) {
  try {
    await requireAdminUser();

    const [settings] = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.key, COMPANY_INFO_KEY))
      .limit(1);

    if (!settings) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(settings.value);
  } catch (error) {
    console.error('Failed to fetch company settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    const formData = await request.formData();

    // Extract form fields
    const data: any = {
      name: formData.get('name'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      taxId: formData.get('taxId') || '',
      invoiceTerms: formData.get('invoiceTerms') || '',
      bankDetails: formData.get('bankDetails') || '',
    };

    // Validate data
    const validated = CompanySettingsSchema.parse(data);

    // Handle logo upload
    const logoFile = formData.get('logo') as File | null;

    if (logoFile && logoFile.size > 0) {
      try {
        // Upload to Vercel Blob
        const blob = await put(`company-logo/${Date.now()}-${logoFile.name}`, logoFile, {
          access: 'public',
        });
        validated.logoBlobUrl = blob.url;
      } catch (uploadError) {
        console.error('Logo upload failed:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload logo' },
          { status: 500 }
        );
      }
    }

    // Check if settings exist
    const [existing] = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.key, COMPANY_INFO_KEY))
      .limit(1);

    if (existing) {
      // Update existing
      await db
        .update(adminSettings)
        .set({
          value: validated,
          updatedAt: new Date(),
          updatedBy: admin.id,
        })
        .where(eq(adminSettings.key, COMPANY_INFO_KEY));

      // Log activity
      await db.insert(adminActivities).values({
        adminClerkUserId: admin.id,
        adminUsername: admin.username,
        adminRole: admin.role,
        action: 'update',
        entityType: 'company_settings',
        entityId: COMPANY_INFO_KEY,
        summary: `Updated company settings: ${validated.name}`,
      });
    } else {
      // Create new
      await db.insert(adminSettings).values({
        key: COMPANY_INFO_KEY,
        value: validated,
        updatedBy: admin.id,
      });

      // Log activity
      await db.insert(adminActivities).values({
        adminClerkUserId: admin.id,
        adminUsername: admin.username,
        adminRole: admin.role,
        action: 'create',
        entityType: 'company_settings',
        entityId: COMPANY_INFO_KEY,
        summary: `Created company settings: ${validated.name}`,
      });
    }

    return NextResponse.json(validated, { status: existing ? 200 : 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid settings data', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Settings update failed:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
