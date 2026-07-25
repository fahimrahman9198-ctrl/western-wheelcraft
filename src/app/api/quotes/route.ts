import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createQuoteLead,
  QuotePhotoValidationError,
  type QuotePhotoUpload,
} from "@/lib/quote-persistence";
import { enforceRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

const baseLeadSchema = z.object({
  customerName: z.string().trim().min(2).max(160),
  customerEmail: z.string().trim().email().max(255),
  customerPhone: z.string().trim().max(40).optional(),
  region: z.string().trim().max(120).optional(),
  marketingConsent: z.boolean().default(false),
});

const contactLeadSchema = baseLeadSchema.extend({
  source: z.literal("contact_form"),
  requestedService: z.string().trim().max(160).optional(),
  damageDescription: z.string().trim().max(5000).optional(),
});

const estimatorLeadSchema = baseLeadSchema.extend({
  source: z.literal("estimator"),
  vehicleYear: z.number().int().min(1900).max(2100).optional(),
  vehicleMake: z.string().trim().max(120).optional(),
  vehicleModel: z.string().trim().max(120).optional(),
  wheelSize: z.string().trim().max(40).optional(),
  currentFinish: z.string().trim().max(120).optional(),
  requestedService: z.string().trim().max(160).optional(),
  requestedFinish: z.string().trim().max(120).optional(),
  wheelCount: z.number().int().min(1).max(12),
  damageDescription: z.string().trim().max(5000).optional(),
  estimatedSubtotal: z.number().nonnegative().optional(),
  estimatedGst: z.number().nonnegative().optional(),
  estimatedTotal: z.number().nonnegative().optional(),
  pricingSnapshot: z.unknown().optional(),
});

const quoteLeadSchema = z.discriminatedUnion("source", [contactLeadSchema, estimatorLeadSchema]);

function parseMultipartPayload(formData: FormData) {
  const rawPayload = formData.get("payload");

  if (typeof rawPayload !== "string") {
    throw new QuotePhotoValidationError("Missing quote payload.");
  }

  // Union, not estimatorLeadSchema: the contact form submits photos too.
  const payload = quoteLeadSchema.parse(JSON.parse(rawPayload));
  const photos: QuotePhotoUpload[] = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)
    .map((file) => ({ file }));

  return { payload, photos };
}

export async function POST(request: Request) {
  // Rate limit check
  const rateLimitCheck = enforceRateLimit(request);
  if (!rateLimitCheck.allowed) {
    return rateLimitCheck.response!;
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    const isMultipart = contentType.includes("multipart/form-data");
    const parsed = isMultipart
      ? parseMultipartPayload(await request.formData())
      : { payload: quoteLeadSchema.parse(await request.json()), photos: [] };

    const result = await createQuoteLead(parsed.payload, { photos: parsed.photos });

    return NextResponse.json(
      {
        quoteId: result.quote.id,
        quoteNumber: result.quote.quoteNumber,
        customerId: result.customer.id,
        photoCount: result.photos.length,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldLabels: Record<string, string> = {
        customerName: "Full name",
        customerEmail: "Email address",
        customerPhone: "Phone number",
        region: "City / location",
        wheelCount: "Wheel count",
      };
      const summary = error.issues
        .map((issue) => {
          const field = fieldLabels[String(issue.path[0])] ?? String(issue.path[0] ?? "Form");
          return `${field}: ${issue.message}`;
        })
        .join(" ");
      return NextResponse.json(
        { error: summary || "Invalid quote request.", issues: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid quote request JSON." },
        { status: 400 }
      );
    }

    if (error instanceof QuotePhotoValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error("Quote lead persistence failed", error);
    return NextResponse.json(
      { error: "Unable to save quote request." },
      { status: 500 }
    );
  }
}
