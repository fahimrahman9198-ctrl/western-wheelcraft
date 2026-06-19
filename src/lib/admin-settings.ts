import 'server-only';

import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import {
  DEFAULT_ADMIN_SETTINGS,
  type AdminSettingsPayload,
  type AdminSettingsSection,
} from '@/lib/admin-settings-data';

const settingKeys = {
  business: 'business_info',
  pricing: 'pricing',
  emailTemplates: 'email_templates',
} as const satisfies Record<AdminSettingsSection, string>;

const businessSchema = z.object({
  companyName: z.string().trim().min(1).max(160),
  address: z.string().trim().max(500),
  phone: z.string().trim().max(40),
  email: z.string().trim().email().max(255),
  gst: z.string().trim().max(80),
  website: z.string().trim().max(160),
});

const pricingRowSchema = z.object({
  label: z.string().trim().min(1).max(160),
  value: z.number().finite().min(0).max(100000),
  unit: z.string().trim().min(1).max(40),
});

const pricingSchema = z.object({
  base: z.array(pricingRowSchema).min(1).max(40),
  size: z.array(pricingRowSchema).max(40),
  region: z.array(pricingRowSchema).max(40),
  discounts: z.array(pricingRowSchema).max(40),
});

const emailTemplateSchema = z.object({
  id: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(500),
  variables: z.array(z.string().trim().max(80)).max(30),
  content: z.string().trim().min(1).max(10000),
});

const sectionSchemas = {
  business: businessSchema,
  pricing: pricingSchema,
  emailTemplates: z.array(emailTemplateSchema).min(1).max(40),
} as const;

function isSettingsSection(value: unknown): value is AdminSettingsSection {
  return typeof value === 'string' && value in settingKeys;
}

function mergeSettings(rows: Array<{ key: string; value: unknown }>): AdminSettingsPayload {
  const settings: AdminSettingsPayload = structuredClone(DEFAULT_ADMIN_SETTINGS);

  for (const row of rows) {
    if (row.key === settingKeys.business) {
      settings.business = sectionSchemas.business.parse(row.value);
    }
    if (row.key === settingKeys.pricing) {
      settings.pricing = sectionSchemas.pricing.parse(row.value);
    }
    if (row.key === settingKeys.emailTemplates) {
      settings.emailTemplates = sectionSchemas.emailTemplates.parse(row.value);
    }
  }

  return settings;
}

export function parseAdminSettingsUpdate(payload: unknown): {
  section: AdminSettingsSection;
  value: AdminSettingsPayload[AdminSettingsSection];
} {
  const envelope = z
    .object({
      section: z.string(),
      value: z.unknown(),
    })
    .parse(payload);

  if (!isSettingsSection(envelope.section)) {
    throw new z.ZodError([
      {
        code: 'custom',
        path: ['section'],
        message: 'Unsupported settings section.',
      },
    ]);
  }

  const section = envelope.section;
  const value = sectionSchemas[section].parse(envelope.value);
  return { section, value };
}

export async function getAdminSettings(): Promise<AdminSettingsPayload> {
  const rows = await db
    .select({
      key: schema.adminSettings.key,
      value: schema.adminSettings.value,
    })
    .from(schema.adminSettings);

  return mergeSettings(rows);
}

export async function saveAdminSetting(
  section: AdminSettingsSection,
  value: AdminSettingsPayload[AdminSettingsSection]
): Promise<AdminSettingsPayload> {
  const key = settingKeys[section];

  await db
    .insert(schema.adminSettings)
    .values({
      key,
      value,
      updatedAt: sql`now()`,
    })
    .onConflictDoUpdate({
      target: schema.adminSettings.key,
      set: {
        value,
        updatedAt: sql`now()`,
      },
    });

  return getAdminSettings();
}
