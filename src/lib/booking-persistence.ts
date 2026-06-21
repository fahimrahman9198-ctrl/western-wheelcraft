import "server-only";

import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import {
  getAdminNotificationEmail,
  sendTransactionalEmail,
  type TransactionalEmailResult,
} from "@/lib/email";

export interface BookingRequestInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceType: "shop" | "mobile";
  scheduledDate: string;
  startTime: string;
  vehicleDescription: string;
  region?: string;
  notes?: string;
  estimatedTotal?: number;
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

function htmlEmail(title: string, rows: Array<[string, string | number | undefined | null]>, message?: string) {
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
    </div>
  `;
}

function lines(rows: Array<[string, string | number | undefined | null]>) {
  return rows
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

function generateBookingNumber(): string {
  const today = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `WWB-${today}-${suffix}`;
}

function toBookingTime(value: string): string {
  const match = value.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return value;

  let hour = Number(match[1]);
  const minute = match[2];
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minute}`;
}

async function findOrCreateCustomer(input: BookingRequestInput) {
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
      notes: "Created from booking request.",
    })
    .returning();

  return customer;
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
      relatedType: "booking",
      relatedId,
      providerMessageId,
    });
  } catch (error) {
    console.error("Failed to log outbound booking email", error);
  }
}

async function maybeLogBookingEmail(
  result: TransactionalEmailResult,
  data: Parameters<typeof logOutboundEmail>[0]
) {
  if (!result.ok || !result.id) return;
  await logOutboundEmail({ ...data, providerMessageId: result.id });
}

async function sendBookingEmails({
  input,
  booking,
  customerId,
}: {
  input: BookingRequestInput;
  booking: typeof schema.bookings.$inferSelect;
  customerId: string;
}) {
  const adminEmail = getAdminNotificationEmail();
  if (!adminEmail) {
    console.warn("Skipping admin booking email: ADMIN_NOTIFICATION_EMAIL is not configured.");
  }

  const amount = fmtMoney(booking.amount);
  const adminSubject = `Booking Request: ${booking.bookingNumber} - ${input.customerName}`;
  const adminRows: Array<[string, string | number | undefined | null]> = [
    ["Booking number", booking.bookingNumber],
    ["Customer", input.customerName],
    ["Email", input.customerEmail],
    ["Phone", input.customerPhone],
    ["Service type", input.serviceType === "mobile" ? "Mobile" : "Shop"],
    ["Service", booking.service],
    ["Date", input.scheduledDate],
    ["Time", input.startTime],
    ["Region", input.region],
    ["Vehicle", input.vehicleDescription],
    ["Estimated total", amount],
    ["Customer notes", input.notes],
  ];
  const adminText = lines(adminRows);

  const customerSubject = `We received your booking request - ${booking.bookingNumber}`;
  const customerMessage = "We received your booking request. Your appointment is pending confirmation.";
  const customerRows: Array<[string, string | number | undefined | null]> = [
    ["Reference", booking.bookingNumber],
    ["Service type", input.serviceType === "mobile" ? "Mobile" : "Shop"],
    ["Date", input.scheduledDate],
    ["Time", input.startTime],
    ["Region", input.region],
  ];
  const customerText = `${customerMessage}\n\n${lines(customerRows)}\n\nWestern Wheelcraft`;

  const [adminResult, customerResult] = await Promise.all([
    adminEmail
      ? sendTransactionalEmail({
          to: adminEmail,
          subject: adminSubject,
          text: adminText,
          html: htmlEmail(adminSubject, adminRows),
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
    maybeLogBookingEmail(adminResult, {
      customerId,
      subject: adminSubject,
      body: adminText,
      relatedId: booking.id,
    }),
    maybeLogBookingEmail(customerResult, {
      customerId,
      subject: customerSubject,
      body: customerText,
      relatedId: booking.id,
    }),
  ]);
}

export async function createBookingRequest(input: BookingRequestInput) {
  const customer = await findOrCreateCustomer(input);
  // Map service type to slot: mobile services use island slot
  const slot = input.serviceType === "mobile" ? "island" : "shop";
  const startTime = toBookingTime(input.startTime);
  const service = input.serviceType === "mobile" ? "Mobile Fleet Service" : "Shop Drop-Off";
  const notes = [
    `Vehicle: ${input.vehicleDescription}`,
    clean(input.notes) ? `Customer notes: ${input.notes}` : null,
    "Payment pending future production phase. Transactional email notification is attempted after save.",
  ].filter(Boolean).join("\n");

  const [booking] = await db
    .insert(schema.bookings)
    .values({
      bookingNumber: generateBookingNumber(),
      customerId: customer.id,
      service,
      serviceType: input.serviceType,
      slot,
      region: clean(input.region),
      scheduledDate: input.scheduledDate,
      startTime,
      status: "pending",
      amount: money(input.estimatedTotal),
      notes,
    })
    .returning();

  await db.insert(schema.communications).values({
    customerId: customer.id,
    type: "note",
    direction: "inbound",
    subject: "Booking request",
    body: notes,
    relatedType: "booking",
    relatedId: booking.id,
  });

  await sendBookingEmails({
    input,
    booking,
    customerId: customer.id,
  });

  return { booking, customer };
}
