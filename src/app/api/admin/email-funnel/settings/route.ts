import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/admin-auth";
import {
  DEFAULT_EMAIL_FUNNEL_SETTINGS,
  getEmailFunnelSettings,
  saveEmailFunnelSettings,
} from "@/lib/email-automations";

export const runtime = "nodejs";

const sequenceKeys = Object.keys(DEFAULT_EMAIL_FUNNEL_SETTINGS.sequences);
const templateKeys = Object.keys(DEFAULT_EMAIL_FUNNEL_SETTINGS.templates);

const sequenceSchema = z.object({
  enabled: z.boolean(),
  label: z.string().min(1).max(160),
});

const templateSchema = z.object({
  name: z.string().min(1).max(160),
  subject: z.string().min(1).max(255),
  body: z.string().min(1).max(10000),
});

const settingsSchema = z.object({
  enabled: z.boolean(),
  sequences: z.record(z.string(), sequenceSchema).refine(
    (value) => sequenceKeys.every((key) => key in value),
    "Missing one or more email sequence settings."
  ),
  templates: z.record(z.string(), templateSchema).refine(
    (value) => templateKeys.every((key) => key in value),
    "Missing one or more email templates."
  ),
});

export async function GET() {
  try {
    await requireAdminUser();
    return NextResponse.json(await getEmailFunnelSettings());
  } catch (error) {
    console.error("Failed to fetch email funnel settings", error);
    return NextResponse.json({ error: "Failed to fetch email funnel settings." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminUser();
    const parsed = settingsSchema.parse(await request.json());
    const settings = await saveEmailFunnelSettings(parsed);
    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email funnel settings.", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("Failed to save email funnel settings", error);
    return NextResponse.json({ error: "Failed to save email funnel settings." }, { status: 500 });
  }
}
