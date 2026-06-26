import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db, schema } from "@/lib/db";

// GET /api/bookings/availability?date=YYYY-MM-DD
// Returns the list of already-taken start times (24h "HH:mm") for that date,
// so the booking wizard can disable them and prevent double-booking.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "A valid date (YYYY-MM-DD) is required." }, { status: 400 });
  }

  try {
    const rows = await db
      .select({ startTime: schema.bookings.startTime })
      .from(schema.bookings)
      .where(
        and(
          eq(schema.bookings.scheduledDate, date),
          ne(schema.bookings.status, "cancelled")
        )
      );

    const taken = Array.from(new Set(rows.map((r) => r.startTime).filter(Boolean)));
    return NextResponse.json({ date, taken });
  } catch (error) {
    console.error("Availability lookup failed", error);
    return NextResponse.json({ error: "Unable to load availability." }, { status: 500 });
  }
}
