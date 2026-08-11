import "server-only";

import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import {
  getAdminNotificationEmail,
  getSiteBaseUrl,
  sendTransactionalEmail,
  type TransactionalEmailResult,
} from "@/lib/email";
import { queueQuoteFollowUps } from "@/lib/quote-follow-ups";

type QuoteSource = "estimator" | "contact_form";
type QuotePhotoKind = "damage" | "full_wheel" | "vehicle" | "other";

const MAX_QUOTE_PHOTOS = 8;
const MAX_QUOTE_PHOTO_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_QUOTE_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

interface BaseLeadInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  region?: string;
  marketingConsent?: boolean;
  source: QuoteSource;
}

export interface ContactLeadInput extends BaseLeadInput {
  source: "contact_form";
  requestedService?: string;
  damageDescription?: string;
}

export interface EstimatorLeadInput extends BaseLeadInput {
  source: "estimator";
  vehicleYear?: number;
  vehicleMake?: string;
  vehicleModel?: string;
  wheelSize?: string;
  currentFinish?: string;
  requestedService?: string;
  requestedFinish?: string;
  wheelCount: number;
  damageDescription?: string;
  estimatedSubtotal?: number;
  estimatedGst?: number;
  estimatedTotal?: number;
  pricingSnapshot?: unknown;
}

export type QuoteLeadInput = ContactLeadInput | EstimatorLeadInput;

/**
 * A photo the browser already uploaded directly to Vercel Blob (see
 * app/api/quotes/upload/route.ts). We store the reference, not the bytes —
 * the file never passes through this function, which is what keeps large
 * uploads from hitting the 4.5 MB serverless body limit.
 */
export interface QuotePhotoUpload {
  url: string;
  pathname?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  kind?: QuotePhotoKind;
}

export class QuotePhotoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuotePhotoValidationError";
  }
}

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function money(value: number | undefined): string | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(2) : undefined;
}

function fmtMoney(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(amount)
    : undefined;
}

function escapeHtml(value: string | undefined | null): string {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function htmlEmail(
  title: string,
  rows: Array<[string, string | number | undefined | null]>,
  message?: string,
  extraHtml?: string
) {
  const rowHtml = rows
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([label, value]) => `
      <tr>
        <td style="padding:8px 12px;color:#666;font-weight:600;border-bottom:1px solid #eee;">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;color:#111;border-bottom:1px solid #eee;">${escapeHtml(String(value))}</td>
      </tr>
    `)
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
      <h1 style="font-size:22px;margin:0 0 12px;">${escapeHtml(title)}</h1>
      ${message ? `<p style="margin:0 0 16px;">${escapeHtml(message)}</p>` : ""}
      <table style="border-collapse:collapse;width:100%;max-width:680px;">${rowHtml}</table>
      ${extraHtml ?? ""}
    </div>
  `;
}

/**
 * Photos are stored as private blobs, so the raw storage URL is not viewable
 * from an inbox. Link the admin-authenticated delivery route instead — the
 * recipient sees the image only after signing in as an admin.
 */
function photoLinksHtml(photos: Array<typeof schema.quotePhotos.$inferSelect>): string {
  if (photos.length === 0) return "";

  const baseUrl = getSiteBaseUrl();
  const items = photos
    .map((photo, index) => {
      const label = escapeHtml(photo.fileName || `Photo ${index + 1}`);
      const href = `${baseUrl}/api/admin/quote-photos/${photo.id}`;
      return `<li style="margin:0 0 6px;"><a href="${escapeHtml(href)}" style="color:#C0212B;">${label}</a></li>`;
    })
    .join("");

  return `
    <p style="margin:16px 0 6px;font-weight:600;">Customer photos (${photos.length}) — admin sign-in required:</p>
    <ul style="margin:0;padding-left:20px;">${items}</ul>
  `;
}

function photoLinksText(photos: Array<typeof schema.quotePhotos.$inferSelect>): string {
  if (photos.length === 0) return "";

  const baseUrl = getSiteBaseUrl();
  const items = photos
    .map((photo, index) => `- ${photo.fileName || `Photo ${index + 1}`}: ${baseUrl}/api/admin/quote-photos/${photo.id}`)
    .join("\n");

  return `\n\nCustomer photos (${photos.length}) — admin sign-in required:\n${items}`;
}

function lines(rows: Array<[string, string | number | undefined | null]>) {
  return rows
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

function generateQuoteNumber(): string {
  const today = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `WWQ-${today}-${suffix}`;
}

function safeFileName(fileName: string | undefined, index: number): string {
  const cleaned = fileName
    ?.trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 160);

  return cleaned || `photo-${index + 1}`;
}

function isTrustedBlobUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function validateQuotePhotos(photos: QuotePhotoUpload[], { requirePhoto = false } = {}) {
  if (requirePhoto && photos.length < 1) {
    throw new QuotePhotoValidationError("At least one wheel photo is required.");
  }

  if (photos.length > MAX_QUOTE_PHOTOS) {
    throw new QuotePhotoValidationError(`A maximum of ${MAX_QUOTE_PHOTOS} photos can be uploaded.`);
  }

  for (const [index, upload] of photos.entries()) {
    // The bytes are already in Blob, so these checks guard the reference the
    // client reports rather than the file itself. The URL check keeps a
    // tampered client from linking an arbitrary external URL to a lead.
    if (!isTrustedBlobUrl(upload.url)) {
      throw new QuotePhotoValidationError(`Photo ${index + 1} has an invalid upload reference.`);
    }

    if (!ALLOWED_QUOTE_PHOTO_TYPES.has(upload.mimeType)) {
      throw new QuotePhotoValidationError(`Photo ${index + 1} must be a JPG, PNG, WEBP, HEIC, or HEIF image.`);
    }

    if (upload.sizeBytes > MAX_QUOTE_PHOTO_SIZE_BYTES) {
      throw new QuotePhotoValidationError(`Photo ${index + 1} must be 8 MB or smaller.`);
    }
  }
}

async function findOrCreateCustomer(input: QuoteLeadInput) {
  const existing = await db.query.customers.findFirst({
    where: eq(schema.customers.email, input.customerEmail),
  });

  if (existing) return existing;

  const [customer] = await db
    .insert(schema.customers)
    .values({
      name: input.customerName,
      email: input.customerEmail,
      phone: clean(input.customerPhone),
      marketingConsent: input.marketingConsent ?? false,
      notes: input.source === "contact_form" ? "Created from contact form lead." : "Created from quote estimator.",
    })
    .returning();

  return customer;
}

async function createVehicleIfPresent(customerId: string, input: QuoteLeadInput) {
  if (input.source !== "estimator") return null;
  if (!clean(input.vehicleMake) || !clean(input.vehicleModel)) return null;

  const [vehicle] = await db
    .insert(schema.vehicles)
    .values({
      customerId,
      year: input.vehicleYear,
      make: input.vehicleMake ?? "Unknown",
      model: input.vehicleModel ?? "Unknown",
      wheelSize: clean(input.wheelSize),
      currentFinish: clean(input.currentFinish),
    })
    .returning();

  return vehicle;
}

async function persistQuotePhotos(quoteId: string, photos: QuotePhotoUpload[]) {
  if (photos.length === 0) return [];

  const rows = [];

  // The browser already uploaded each file to Blob, so we only record the
  // reference here — no put(), so no large body flows through this function.
  for (const [index, upload] of photos.entries()) {
    const fileName = safeFileName(upload.fileName, index);

    const [photo] = await db
      .insert(schema.quotePhotos)
      .values({
        quoteId,
        kind: upload.kind ?? "damage",
        storageUrl: upload.url,
        fileName: upload.fileName || fileName,
        mimeType: upload.mimeType,
        sizeBytes: upload.sizeBytes,
        sortOrder: index,
      })
      .returning();

    rows.push(photo);
  }

  return rows;
}

async function logOutboundEmail({
  customerId,
  subject,
  body,
  relatedId,
  providerMessageId,
}: {
  customerId: string;
  subject: string;
  body: string;
  relatedId: string;
  providerMessageId?: string;
}) {
  try {
    await db.insert(schema.communications).values({
      customerId,
      type: "email",
      direction: "outbound",
      subject,
      body,
      relatedType: "quote",
      relatedId,
      providerMessageId,
    });
  } catch (error) {
    console.error("Failed to log outbound quote email", error);
  }
}

async function maybeLogQuoteEmail(
  result: TransactionalEmailResult,
  data: Parameters<typeof logOutboundEmail>[0]
) {
  if (!result.ok || !result.id) return;
  await logOutboundEmail({ ...data, providerMessageId: result.id });
}

async function sendQuoteLeadEmails({
  input,
  quote,
  customerId,
  photos,
}: {
  input: QuoteLeadInput;
  quote: typeof schema.quotes.$inferSelect;
  customerId: string;
  photos: Array<typeof schema.quotePhotos.$inferSelect>;
}) {
  const photoCount = photos.length;
  const adminEmail = getAdminNotificationEmail();
  if (!adminEmail) {
    console.warn("Skipping admin quote email: ADMIN_NOTIFICATION_EMAIL is not configured.");
  }

  const estimatedTotal = fmtMoney(quote.estimatedTotal);
  const leadLabel = input.source === "contact_form" ? "Contact Form Lead" : "Quote Request";
  const adminSubject = `${leadLabel}: ${quote.quoteNumber} - ${input.customerName}`;
  const adminRows: Array<[string, string | number | undefined | null]> = [
    ["Quote number", quote.quoteNumber],
    ["Source", input.source === "contact_form" ? "Contact form" : "Quote estimator"],
    ["Customer", input.customerName],
    ["Email", input.customerEmail],
    ["Phone", input.customerPhone],
    ["Region", input.region],
    ["Requested service", input.requestedService],
    ["Wheel count", input.source === "estimator" ? input.wheelCount : quote.wheelCount],
    ["Vehicle", input.source === "estimator"
      ? [input.vehicleYear, input.vehicleMake, input.vehicleModel].filter(Boolean).join(" ")
      : undefined],
    ["Wheel size", input.source === "estimator" ? input.wheelSize : undefined],
    ["Current finish", input.source === "estimator" ? input.currentFinish : undefined],
    ["Requested finish", input.source === "estimator" ? input.requestedFinish : undefined],
    ["Estimated total", estimatedTotal],
    ["Photo count", photoCount],
    ["Damage/message", input.damageDescription],
  ];
  const adminText = `${lines(adminRows)}${photoLinksText(photos)}`;

  const customerSubject = input.source === "contact_form"
    ? `We received your message - ${quote.quoteNumber}`
    : `We received your quote request - ${quote.quoteNumber}`;
  const customerMessage = input.source === "contact_form"
    ? "We received your message. The Western Wheelcraft team will review it and follow up directly."
    : "We received your quote request. A technician/admin will review the details and confirm final pricing.";
  const customerRows: Array<[string, string | number | undefined | null]> = [
    ["Reference", quote.quoteNumber],
    ["Requested service", input.requestedService],
    ["Region", input.region],
    ["Estimated total", estimatedTotal],
  ];
  const customerText = `${customerMessage}\n\n${lines(customerRows)}\n\nWestern Wheelcraft`;

  const [adminResult, customerResult] = await Promise.all([
    adminEmail
      ? sendTransactionalEmail({
          to: adminEmail,
          subject: adminSubject,
          text: adminText,
          html: htmlEmail(adminSubject, adminRows, undefined, photoLinksHtml(photos)),
        })
      : Promise.resolve({ ok: false, skipped: true, error: "Missing admin notification email." }),
    sendTransactionalEmail({
      to: input.customerEmail,
      subject: customerSubject,
      text: customerText,
      html: htmlEmail(customerSubject, customerRows, customerMessage),
    }),
  ]);

  await Promise.all([
    maybeLogQuoteEmail(adminResult, {
      customerId,
      subject: adminSubject,
      body: adminText,
      relatedId: quote.id,
    }),
    maybeLogQuoteEmail(customerResult, {
      customerId,
      subject: customerSubject,
      body: customerText,
      relatedId: quote.id,
    }),
  ]);
}

export async function createQuoteLead(
  input: QuoteLeadInput,
  options: { photos?: QuotePhotoUpload[] } = {}
) {
  const photos = options.photos ?? [];
  validateQuotePhotos(photos, { requirePhoto: input.source === "estimator" });

  const customer = await findOrCreateCustomer(input);
  const vehicle = await createVehicleIfPresent(customer.id, input);

  const [quote] = await db
    .insert(schema.quotes)
    .values({
      quoteNumber: generateQuoteNumber(),
      customerId: customer.id,
      vehicleId: vehicle?.id,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: clean(input.customerPhone),
      requestedService: clean(input.requestedService),
      requestedFinish: input.source === "estimator" ? clean(input.requestedFinish) : undefined,
      region: clean(input.region),
      wheelCount: input.source === "estimator" ? input.wheelCount : 4,
      damageDescription: clean(input.damageDescription),
      estimatedSubtotal: input.source === "estimator" ? money(input.estimatedSubtotal) : undefined,
      estimatedGst: input.source === "estimator" ? money(input.estimatedGst) : undefined,
      estimatedTotal: input.source === "estimator" ? money(input.estimatedTotal) : undefined,
      source: input.source,
      pricingSnapshot: input.source === "estimator" ? input.pricingSnapshot : undefined,
      notes: input.source === "contact_form"
        ? "Contact form lead. Transactional email notification is attempted after save."
        : "Quote estimator lead. Photo files stored in Vercel Blob; AI analysis pending future phase.",
    })
    .returning();

  const savedPhotos = await persistQuotePhotos(quote.id, photos);

  if (input.damageDescription) {
    await db.insert(schema.communications).values({
      customerId: customer.id,
      type: "note",
      direction: "inbound",
      subject: input.source === "contact_form" ? "Contact form message" : "Quote estimator details",
      body: input.damageDescription,
      relatedType: "quote",
      relatedId: quote.id,
    });
  }

  await sendQuoteLeadEmails({
    input,
    quote,
    customerId: customer.id,
    photos: savedPhotos,
  });

  await queueQuoteFollowUps(quote);

  return {
    quote,
    customer,
    vehicle,
    photos: savedPhotos,
  };
}
