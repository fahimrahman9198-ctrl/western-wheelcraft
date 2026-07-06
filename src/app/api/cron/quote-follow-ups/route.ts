import { NextResponse } from "next/server";
import { processDueEmailAutomations } from "@/lib/email-automations";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processDueEmailAutomations();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Email automation cron failed", error);
    return NextResponse.json(
      { error: "Email automation cron failed." },
      { status: 500 }
    );
  }
}
