import { NextResponse } from "next/server";
import { processDueQuoteFollowUps } from "@/lib/quote-follow-ups";

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
    const result = await processDueQuoteFollowUps();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Quote follow-up cron failed", error);
    return NextResponse.json(
      { error: "Quote follow-up cron failed." },
      { status: 500 }
    );
  }
}
