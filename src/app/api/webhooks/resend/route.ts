import { NextResponse } from "next/server";
import { processResendWebhook } from "@/lib/email-automations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const result = await processResendWebhook({
      rawBody,
      headers: request.headers,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Resend webhook failed", error);
    return NextResponse.json({ error: "Resend webhook failed." }, { status: 400 });
  }
}
