import { NextResponse } from "next/server";
import { z } from "zod";
import { createBookingRequest } from "@/lib/booking-persistence";
import { enforceRateLimit } from "@/lib/rate-limit";

const bookingRequestSchema = z.object({
  customerName: z.string().trim().min(2).max(160),
  customerEmail: z.string().trim().email().max(255),
  customerPhone: z.string().trim().max(40).optional(),
  serviceType: z.enum(["shop", "mobile"]),
  scheduledDate: z.string().date(),
  startTime: z.string().trim().min(1).max(20),
  vehicleDescription: z.string().trim().min(2).max(500),
  region: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(5000).optional(),
  estimatedTotal: z.number().nonnegative().optional(),
});

export async function POST(request: Request) {
  // Rate limit check
  const rateLimitCheck = enforceRateLimit(request);
  if (!rateLimitCheck.allowed) {
    return rateLimitCheck.response!;
  }

  try {
    const payload = bookingRequestSchema.parse(await request.json());
    const result = await createBookingRequest(payload);

    return NextResponse.json(
      {
        bookingId: result.booking.id,
        bookingNumber: result.booking.bookingNumber,
        customerId: result.customer.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid booking request.", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("Booking persistence failed", error);
    return NextResponse.json(
      { error: "Unable to save booking request." },
      { status: 500 }
    );
  }
}
