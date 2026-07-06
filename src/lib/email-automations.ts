import "server-only";

import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { Resend, type WebhookEventPayload } from "resend";
import { db, schema } from "@/lib/db";
import { sendTransactionalEmail, type TransactionalEmailResult } from "@/lib/email";

const EMAIL_FUNNEL_SETTINGS_KEY = "email_funnel_settings";
const AUTOMATION_LIMIT = 35;

const ACTIVE_QUOTE_STATUSES = ["new", "contacted", "quoted", "sent"] as const;
const STOPPED_QUOTE_STATUSES = ["accepted", "booked", "completed", "declined", "cancelled", "expired"];

type QuoteRecord = typeof schema.quotes.$inferSelect;
type BookingRecord = typeof schema.bookings.$inferSelect;
type CustomerRecord = typeof schema.customers.$inferSelect;
type EmailAutomationRecord = typeof schema.emailAutomations.$inferSelect;
type EmailAutomationKind = typeof schema.emailAutomationKindEnum.enumValues[number];

type TemplateKey =
  | "quote_follow_up_1"
  | "quote_follow_up_2"
  | "quote_follow_up_3"
  | "booking_reminder_1"
  | "booking_reminder_2"
  | "missed_booking_1"
  | "post_service_review_1"
  | "post_service_care_1"
  | "post_service_referral_1"
  | "lost_quote_reactivation_1"
  | "seasonal_reminder_1";

type ResendWebhookEvent = {
  type?: string;
  created_at?: string;
  data?: Record<string, unknown>;
};

interface EmailTemplate {
  name: string;
  subject: string;
  body: string;
}

interface EmailSequenceSetting {
  enabled: boolean;
  label: string;
}

export interface EmailFunnelSettings {
  enabled: boolean;
  sequences: Record<EmailAutomationKind, EmailSequenceSetting>;
  templates: Record<TemplateKey, EmailTemplate>;
}

interface EmailRenderContext {
  customerName: string;
  customerEmail: string;
  quoteNumber?: string;
  bookingNumber?: string;
  service?: string;
  region?: string;
  estimatedTotal?: string;
  bookingDate?: string;
  bookingTime?: string;
  unsubscribeUrl?: string;
}

export const DEFAULT_EMAIL_FUNNEL_SETTINGS: EmailFunnelSettings = {
  enabled: false,
  sequences: {
    quote_follow_up: { enabled: true, label: "Quote follow-ups" },
    booking_reminder: { enabled: true, label: "Booking reminders" },
    missed_booking: { enabled: true, label: "Missed booking follow-up" },
    post_service_review: { enabled: true, label: "Review request" },
    post_service_care: { enabled: true, label: "Warranty and care instructions" },
    post_service_referral: { enabled: true, label: "Referral request" },
    lost_quote_reactivation: { enabled: true, label: "Lost quote reactivation" },
    seasonal_reminder: { enabled: true, label: "Seasonal wheel reminder" },
  },
  templates: {
    quote_follow_up_1: {
      name: "Quote follow-up 1",
      subject: "Still interested in your wheel quote? {{quoteNumber}}",
      body: "Hi {{customerName}},\n\nWe received your wheel repair quote request and saved your details. If you want to move forward, reply here and our team can confirm final pricing and next steps.\n\nReference: {{quoteNumber}}\nService: {{service}}\nEstimated online total: {{estimatedTotal}}\n\nWestern Wheelcraft",
    },
    quote_follow_up_2: {
      name: "Quote follow-up 2",
      subject: "Your Western Wheelcraft quote is ready for review",
      body: "Hi {{customerName}},\n\nA quick follow-up on your wheel repair request. Photos and online estimates are used for intake only; final pricing is confirmed by the team before work starts.\n\nReference: {{quoteNumber}}\nService: {{service}}\nEstimated online total: {{estimatedTotal}}\n\nWestern Wheelcraft",
    },
    quote_follow_up_3: {
      name: "Quote follow-up 3",
      subject: "Should we keep your wheel repair request open?",
      body: "Hi {{customerName}},\n\nWe are checking whether you still want help with this wheel repair request. Reply here and we can keep it moving, or we can close the request if the timing is not right.\n\nReference: {{quoteNumber}}\n\nWestern Wheelcraft",
    },
    booking_reminder_1: {
      name: "24-hour booking reminder",
      subject: "Reminder: your Western Wheelcraft appointment is tomorrow",
      body: "Hi {{customerName}},\n\nReminder that your Western Wheelcraft appointment is scheduled for {{bookingDate}} at {{bookingTime}}.\n\nReference: {{bookingNumber}}\nService: {{service}}\n\nIf anything changes, reply to this email.\n\nWestern Wheelcraft",
    },
    booking_reminder_2: {
      name: "Same-day booking reminder",
      subject: "Today: your Western Wheelcraft appointment",
      body: "Hi {{customerName}},\n\nYour Western Wheelcraft appointment is today at {{bookingTime}}.\n\nReference: {{bookingNumber}}\nService: {{service}}\n\nWestern Wheelcraft",
    },
    missed_booking_1: {
      name: "Missed booking follow-up",
      subject: "Do you want to reschedule your wheel service?",
      body: "Hi {{customerName}},\n\nIt looks like your appointment time has passed. If you still want help with the wheel repair, reply here and we can reschedule.\n\nReference: {{bookingNumber}}\n\nWestern Wheelcraft",
    },
    post_service_review_1: {
      name: "Review request",
      subject: "How did your Western Wheelcraft service go?",
      body: "Hi {{customerName}},\n\nThanks for choosing Western Wheelcraft. If you were happy with the result, a review helps the shop a lot.\n\nReply here if anything needs attention.\n\nWestern Wheelcraft",
    },
    post_service_care_1: {
      name: "Warranty and care instructions",
      subject: "Wheel finish care notes from Western Wheelcraft",
      body: "Hi {{customerName}},\n\nThanks for trusting Western Wheelcraft with your wheels. Avoid harsh cleaners, fresh curb contact, and aggressive pressure washing near repaired areas while the finish settles.\n\nReply here if you have any questions about care or warranty.\n\nWestern Wheelcraft",
    },
    post_service_referral_1: {
      name: "Referral request",
      subject: "Know someone with curb rash?",
      body: "Hi {{customerName}},\n\nIf someone you know needs wheel refinishing or curb-rash repair, send them our way. We appreciate the referral.\n\nWestern Wheelcraft",
    },
    lost_quote_reactivation_1: {
      name: "30-day lost quote reactivation",
      subject: "Still need the wheel repair done?",
      body: "Hi {{customerName}},\n\nChecking in on your earlier Western Wheelcraft quote request. If you still want the repair done, reply here and we can reopen the request.\n\nReference: {{quoteNumber}}\n\nWestern Wheelcraft",
    },
    seasonal_reminder_1: {
      name: "Seasonal wheel reminder",
      subject: "Seasonal wheel check-in from Western Wheelcraft",
      body: "Hi {{customerName}},\n\nSeasonal changes are a good time to check wheel finish, curb rash, corrosion, and winter/summer wheel condition. Reply here if you want us to take a look.\n\nWestern Wheelcraft",
    },
  },
};

function cloneDefaultSettings(): EmailFunnelSettings {
  return structuredClone(DEFAULT_EMAIL_FUNNEL_SETTINGS);
}

function mergeSettings(value: unknown): EmailFunnelSettings {
  const merged = cloneDefaultSettings();
  if (!value || typeof value !== "object") return merged;

  const input = value as Partial<EmailFunnelSettings>;
  merged.enabled = Boolean(input.enabled);

  if (input.sequences && typeof input.sequences === "object") {
    for (const key of Object.keys(merged.sequences) as EmailAutomationKind[]) {
      const incoming = input.sequences[key];
      if (incoming && typeof incoming === "object") {
        merged.sequences[key] = {
          ...merged.sequences[key],
          enabled: Boolean(incoming.enabled),
        };
      }
    }
  }

  if (input.templates && typeof input.templates === "object") {
    for (const key of Object.keys(merged.templates) as TemplateKey[]) {
      const incoming = input.templates[key];
      if (incoming && typeof incoming === "object") {
        merged.templates[key] = {
          ...merged.templates[key],
          subject: String(incoming.subject ?? merged.templates[key].subject).slice(0, 255),
          body: String(incoming.body ?? merged.templates[key].body).slice(0, 10000),
        };
      }
    }
  }

  return merged;
}

export async function getEmailFunnelSettings(): Promise<EmailFunnelSettings> {
  const row = await db.query.adminSettings.findFirst({
    where: eq(schema.adminSettings.key, EMAIL_FUNNEL_SETTINGS_KEY),
  });

  return mergeSettings(row?.value);
}

export async function saveEmailFunnelSettings(input: EmailFunnelSettings) {
  const settings = mergeSettings(input);

  await db
    .insert(schema.adminSettings)
    .values({
      key: EMAIL_FUNNEL_SETTINGS_KEY,
      value: settings,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.adminSettings.key,
      set: {
        value: settings,
        updatedAt: new Date(),
      },
    });

  return settings;
}

function isEmergencyDisabled() {
  return process.env.EMAIL_AUTOMATIONS_DISABLED === "true";
}

function money(value: string | null | undefined): string {
  if (!value) return "";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(amount)
    : "";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("\n", "<br />");
}

function replaceVariables(template: string, context: EmailRenderContext): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key: keyof EmailRenderContext) => {
    const value = context[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

function htmlFromText(title: string, body: string, unsubscribeUrl?: string) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#111;">
      <h1 style="font-size:22px;margin:0 0 16px;">${escapeHtml(title)}</h1>
      <p style="margin:0 0 16px;">${escapeHtml(body)}</p>
      ${
        unsubscribeUrl
          ? `<p style="margin:24px 0 0;color:#666;font-size:12px;"><a href="${escapeHtml(unsubscribeUrl)}" style="color:#666;">Unsubscribe from non-essential follow-up emails</a></p>`
          : ""
      }
    </div>
  `;
}

function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "https://westernwheelcraft.ca";
}

function unsubscribeUrl(customerId: string | null) {
  if (!customerId) return undefined;
  return `${siteUrl()}/api/email/unsubscribe?customer=${encodeURIComponent(customerId)}`;
}

function templateKey(kind: EmailAutomationKind, sequenceStep: number): TemplateKey {
  return `${kind}_${sequenceStep}` as TemplateKey;
}

function requiresOptOutCheck(kind: EmailAutomationKind) {
  return [
    "quote_follow_up",
    "post_service_review",
    "post_service_referral",
    "lost_quote_reactivation",
    "seasonal_reminder",
  ].includes(kind);
}

function requiresMarketingConsent(kind: EmailAutomationKind) {
  return ["post_service_referral", "lost_quote_reactivation", "seasonal_reminder"].includes(kind);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function bookingDateTime(booking: Pick<BookingRecord, "scheduledDate" | "startTime">) {
  return new Date(`${booking.scheduledDate}T${booking.startTime}:00`);
}

async function insertAutomations(
  rows: Array<typeof schema.emailAutomations.$inferInsert>
) {
  if (rows.length === 0) return 0;

  const inserted = await db
    .insert(schema.emailAutomations)
    .values(rows)
    .onConflictDoNothing()
    .returning({ id: schema.emailAutomations.id });

  return inserted.length;
}

export async function queueQuoteFollowUps(quote: QuoteRecord) {
  const settings = await getEmailFunnelSettings();
  if (!settings.sequences.quote_follow_up.enabled) return { queued: 0, skipped: "sequence_disabled" };
  if (quote.source !== "estimator") return { queued: 0, skipped: "non_estimator" };
  if (!quote.customerEmail) return { queued: 0, skipped: "missing_email" };

  const now = new Date();
  const rows = [
    { step: 1, scheduledFor: addDays(now, 1) },
    { step: 2, scheduledFor: addDays(now, 3) },
    { step: 3, scheduledFor: addDays(now, 7) },
  ].map(({ step, scheduledFor }) => ({
    customerId: quote.customerId,
    relatedType: "quote",
    relatedId: quote.id,
    kind: "quote_follow_up" as const,
    sequenceStep: step,
    scheduledFor,
  }));

  try {
    return { queued: await insertAutomations(rows) };
  } catch (error) {
    console.error("Failed to queue quote follow-ups", error);
    return { queued: 0, error: error instanceof Error ? error.message : "Unknown queue error" };
  }
}

export async function queueBookingAutomations(booking: BookingRecord) {
  const settings = await getEmailFunnelSettings();
  const scheduledAt = bookingDateTime(booking);
  const rows: Array<typeof schema.emailAutomations.$inferInsert> = [];

  if (settings.sequences.booking_reminder.enabled) {
    rows.push(
      {
        customerId: booking.customerId,
        relatedType: "booking",
        relatedId: booking.id,
        kind: "booking_reminder",
        sequenceStep: 1,
        scheduledFor: addDays(scheduledAt, -1),
      },
      {
        customerId: booking.customerId,
        relatedType: "booking",
        relatedId: booking.id,
        kind: "booking_reminder",
        sequenceStep: 2,
        scheduledFor: addHours(scheduledAt, -3),
      }
    );
  }

  if (settings.sequences.missed_booking.enabled) {
    rows.push({
      customerId: booking.customerId,
      relatedType: "booking",
      relatedId: booking.id,
      kind: "missed_booking",
      sequenceStep: 1,
      scheduledFor: addHours(scheduledAt, 2),
    });
  }

  return { queued: await insertAutomations(rows) };
}

async function ensureLifecycleAutomations() {
  const settings = await getEmailFunnelSettings();
  const rows: Array<typeof schema.emailAutomations.$inferInsert> = [];
  const now = new Date();

  if (settings.sequences.lost_quote_reactivation.enabled) {
    const quotes = await db.query.quotes.findMany({
      where: and(
        inArray(schema.quotes.status, [...ACTIVE_QUOTE_STATUSES]),
        lte(schema.quotes.createdAt, addDays(now, -30))
      ),
      limit: 100,
    });

    for (const quote of quotes) {
      rows.push({
        customerId: quote.customerId,
        relatedType: "quote",
        relatedId: quote.id,
        kind: "lost_quote_reactivation",
        sequenceStep: 1,
        scheduledFor: now,
      });
    }
  }

  const completedSequences = [
    ["post_service_care", 0],
    ["post_service_review", 1],
    ["post_service_referral", 7],
    ["seasonal_reminder", 180],
  ] as const;

  const completedBookings = await db.query.bookings.findMany({
    where: and(eq(schema.bookings.status, "completed"), gte(schema.bookings.updatedAt, addDays(now, -365))),
    limit: 150,
  });

  for (const booking of completedBookings) {
    for (const [kind, delayDays] of completedSequences) {
      if (!settings.sequences[kind].enabled) continue;
      rows.push({
        customerId: booking.customerId,
        relatedType: "booking",
        relatedId: booking.id,
        kind,
        sequenceStep: 1,
        scheduledFor: addDays(booking.updatedAt, delayDays),
      });
    }
  }

  return insertAutomations(rows);
}

function contextFromQuote(quote: QuoteRecord, customer?: CustomerRecord | null): EmailRenderContext {
  return {
    customerName: customer?.name ?? quote.customerName,
    customerEmail: customer?.email ?? quote.customerEmail,
    quoteNumber: quote.quoteNumber,
    service: quote.requestedService ?? "",
    region: quote.region ?? "",
    estimatedTotal: money(quote.estimatedTotal),
    unsubscribeUrl: unsubscribeUrl(quote.customerId),
  };
}

function contextFromBooking(booking: BookingRecord, customer: CustomerRecord): EmailRenderContext {
  return {
    customerName: customer.name,
    customerEmail: customer.email,
    bookingNumber: booking.bookingNumber,
    service: booking.service,
    region: booking.region ?? "",
    estimatedTotal: money(booking.amount),
    bookingDate: booking.scheduledDate,
    bookingTime: booking.startTime,
    unsubscribeUrl: unsubscribeUrl(booking.customerId),
  };
}

function renderEmail(
  automation: Pick<EmailAutomationRecord, "kind" | "sequenceStep">,
  settings: EmailFunnelSettings,
  context: EmailRenderContext
) {
  const key = templateKey(automation.kind, automation.sequenceStep);
  const template = settings.templates[key] ?? DEFAULT_EMAIL_FUNNEL_SETTINGS.templates[key];
  const subject = replaceVariables(template.subject, context);
  const body = replaceVariables(template.body, context);

  return {
    subject,
    text: body,
    html: htmlFromText(subject, body, context.unsubscribeUrl),
  };
}

async function markAutomation(
  automationId: string,
  values: Partial<typeof schema.emailAutomations.$inferInsert>
) {
  await db
    .update(schema.emailAutomations)
    .set({
      ...values,
      updatedAt: new Date(),
    })
    .where(eq(schema.emailAutomations.id, automationId));
}

async function logAutomationEmail({
  automation,
  customerId,
  email,
  providerMessageId,
}: {
  automation: EmailAutomationRecord;
  customerId: string | null;
  email: { subject: string; text: string };
  providerMessageId?: string;
}) {
  await db.insert(schema.communications).values({
    customerId,
    type: "email",
    direction: "outbound",
    subject: email.subject,
    body: email.text,
    relatedType: automation.relatedType,
    relatedId: automation.relatedId,
    providerMessageId,
    providerStatus: "sent",
    providerEventAt: new Date(),
  });
}

async function handleSendResult({
  automation,
  customerId,
  email,
  result,
}: {
  automation: EmailAutomationRecord;
  customerId: string | null;
  email: { subject: string; text: string };
  result: TransactionalEmailResult;
}) {
  if (result.ok) {
    await logAutomationEmail({ automation, customerId, email, providerMessageId: result.id });
    await markAutomation(automation.id, {
      status: "sent",
      subject: email.subject,
      body: email.text,
      providerMessageId: result.id,
      sentAt: new Date(),
      lastError: null,
    });
    return "sent";
  }

  await markAutomation(automation.id, {
    status: "failed",
    subject: email.subject,
    body: email.text,
    lastError: result.error ?? "Resend did not accept the email.",
  });
  return "failed";
}

async function shouldSkipForCustomer(customer: CustomerRecord | null | undefined, kind: EmailAutomationKind) {
  if (!customer) return "Customer no longer exists.";
  if (requiresOptOutCheck(kind) && customer.emailOptOutAt) return "Customer opted out of non-essential emails.";
  if (requiresMarketingConsent(kind) && !customer.marketingConsent) return "Customer has not opted into marketing emails.";
  return null;
}

async function processQuoteAutomation(automation: EmailAutomationRecord, settings: EmailFunnelSettings) {
  const quote = await db.query.quotes.findFirst({
    where: eq(schema.quotes.id, automation.relatedId),
    with: { customer: true, bookings: true },
  });

  if (!quote) return { skip: "Quote no longer exists." };
  if (!quote.customerEmail) return { skip: "Quote is missing customer email." };

  const customerSkip = await shouldSkipForCustomer(quote.customer, automation.kind);
  if (customerSkip) return { skip: customerSkip };

  if (automation.kind === "quote_follow_up" && !ACTIVE_QUOTE_STATUSES.includes(quote.status as never)) {
    return { skip: `Quote status is ${quote.status}.` };
  }

  if (automation.kind === "lost_quote_reactivation") {
    if (STOPPED_QUOTE_STATUSES.includes(quote.status)) return { skip: `Quote status is ${quote.status}.` };
    if (quote.bookings.length > 0) return { skip: "Quote already has a booking." };
  }

  const context = contextFromQuote(quote, quote.customer);
  return {
    to: quote.customerEmail,
    customerId: quote.customerId,
    email: renderEmail(automation, settings, context),
  };
}

async function processBookingAutomation(automation: EmailAutomationRecord, settings: EmailFunnelSettings) {
  const booking = await db.query.bookings.findFirst({
    where: eq(schema.bookings.id, automation.relatedId),
    with: { customer: true },
  });

  if (!booking) return { skip: "Booking no longer exists." };
  if (!booking.customer?.email) return { skip: "Booking customer is missing email." };

  const customerSkip = await shouldSkipForCustomer(booking.customer, automation.kind);
  if (customerSkip) return { skip: customerSkip };

  if (automation.kind === "booking_reminder" && !["pending", "confirmed"].includes(booking.status)) {
    return { skip: `Booking status is ${booking.status}.` };
  }

  if (automation.kind === "missed_booking" && ["completed", "cancelled"].includes(booking.status)) {
    return { skip: `Booking status is ${booking.status}.` };
  }

  if (automation.kind.startsWith("post_service") || automation.kind === "seasonal_reminder") {
    if (booking.status !== "completed") return { skip: `Booking status is ${booking.status}.` };
  }

  const context = contextFromBooking(booking, booking.customer);
  return {
    to: booking.customer.email,
    customerId: booking.customerId,
    email: renderEmail(automation, settings, context),
  };
}

export async function processDueEmailAutomations() {
  if (isEmergencyDisabled()) {
    return { processed: 0, sent: 0, skipped: 0, failed: 0, disabled: true, reason: "emergency_disabled" };
  }

  const settings = await getEmailFunnelSettings();
  await ensureLifecycleAutomations();

  if (!settings.enabled) {
    return { processed: 0, sent: 0, skipped: 0, failed: 0, disabled: true, reason: "admin_paused" };
  }

  const due = await db.query.emailAutomations.findMany({
    where: and(
      eq(schema.emailAutomations.status, "scheduled"),
      lte(schema.emailAutomations.scheduledFor, new Date())
    ),
    orderBy: [schema.emailAutomations.scheduledFor],
    limit: AUTOMATION_LIMIT,
  });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const automation of due) {
    if (!settings.sequences[automation.kind].enabled) {
      await markAutomation(automation.id, {
        status: "skipped",
        skippedAt: new Date(),
        lastError: "Sequence disabled in admin settings.",
      });
      skipped += 1;
      continue;
    }

    const rendered = automation.relatedType === "quote"
      ? await processQuoteAutomation(automation, settings)
      : await processBookingAutomation(automation, settings);

    if ("skip" in rendered) {
      await markAutomation(automation.id, {
        status: "skipped",
        skippedAt: new Date(),
        lastError: rendered.skip,
      });
      skipped += 1;
      continue;
    }

    const result = await sendTransactionalEmail({
      to: rendered.to,
      subject: rendered.email.subject,
      text: rendered.email.text,
      html: rendered.email.html,
    });

    const outcome = await handleSendResult({
      automation,
      customerId: rendered.customerId,
      email: rendered.email,
      result,
    });

    if (outcome === "sent") sent += 1;
    else failed += 1;
  }

  return { processed: due.length, sent, skipped, failed, disabled: false };
}

export async function getEmailFunnelAdminData() {
  const [settings, automations, counts, recentCommunications, customers, quotes, bookings] = await Promise.all([
    getEmailFunnelSettings(),
    db.query.emailAutomations.findMany({
      orderBy: [desc(schema.emailAutomations.scheduledFor)],
      limit: 100,
      with: { customer: true },
    }),
    db
      .select({
        status: schema.emailAutomations.status,
        value: sql<number>`count(*)::int`,
      })
      .from(schema.emailAutomations)
      .groupBy(schema.emailAutomations.status),
    db.query.communications.findMany({
      where: eq(schema.communications.type, "email"),
      orderBy: [desc(schema.communications.createdAt)],
      limit: 50,
      with: { customer: true },
    }),
    db.query.customers.findMany({ limit: 500 }),
    db.query.quotes.findMany({ limit: 500, with: { bookings: true } }),
    db.query.bookings.findMany({ limit: 500 }),
  ]);

  const statusCounts = Object.fromEntries(counts.map((row) => [row.status, Number(row.value)]));
  const emailsSent = recentCommunications.filter((communication) => communication.providerMessageId).length;
  const failedSends = statusCounts.failed ?? 0;
  const quoteFollowUpSends = automations.filter((item) => item.kind === "quote_follow_up" && item.status === "sent");
  const followedQuoteIds = new Set(quoteFollowUpSends.map((item) => item.relatedId));
  const convertedQuotes = quotes.filter((quote) =>
    followedQuoteIds.has(quote.id) &&
    (["accepted", "booked", "completed"].includes(quote.status) || quote.bookings.length > 0)
  );
  const bookedAfterFollowUp = bookings.filter((booking) => booking.quoteId && followedQuoteIds.has(booking.quoteId)).length;

  return {
    settings,
    automations,
    recentCommunications,
    analytics: {
      emailsSent,
      failedSends,
      quoteFollowUpConversion: quoteFollowUpSends.length > 0
        ? Math.round((convertedQuotes.length / quoteFollowUpSends.length) * 100)
        : 0,
      bookedAfterFollowUp,
      segments: {
        quoteRequestedNotBooked: quotes.filter((quote) => quote.bookings.length === 0 && ACTIVE_QUOTE_STATUSES.includes(quote.status as never)).length,
        bookedNotCompleted: bookings.filter((booking) => booking.status !== "completed" && booking.status !== "cancelled").length,
        completedService: bookings.filter((booking) => booking.status === "completed").length,
        dealershipB2BLeads: customers.filter((customer) => customer.type === "trade").length,
      },
      statusCounts,
    },
  };
}

export async function optOutCustomer(customerId: string, reason = "Customer requested unsubscribe.") {
  const [customer] = await db
    .update(schema.customers)
    .set({
      emailOptOutAt: new Date(),
      emailOptOutReason: reason,
      marketingConsent: false,
      updatedAt: new Date(),
    })
    .where(eq(schema.customers.id, customerId))
    .returning();

  return customer;
}

function webhookEventId(event: ResendWebhookEvent) {
  return [event.type ?? "unknown", getWebhookEmailId(event) ?? "unknown", event.created_at ?? Date.now()].join(":");
}

function providerStatusFromEvent(eventType: string) {
  return eventType.replace("email.", "");
}

function parseWebhookEvent(rawBody: string): ResendWebhookEvent {
  return JSON.parse(rawBody) as ResendWebhookEvent;
}

function asWebhookEvent(event: WebhookEventPayload): ResendWebhookEvent {
  return event as unknown as ResendWebhookEvent;
}

function getWebhookEmailId(event: ResendWebhookEvent) {
  const emailId = event.data?.email_id;
  return typeof emailId === "string" ? emailId : null;
}

function getWebhookProviderError(event: ResendWebhookEvent) {
  const data = event.data ?? {};
  const failed = data.failed;
  const bounce = data.bounce;
  const suppressed = data.suppressed;

  if (failed && typeof failed === "object" && "reason" in failed) {
    return String(failed.reason);
  }

  if (bounce && typeof bounce === "object" && "message" in bounce) {
    return String(bounce.message);
  }

  if (suppressed && typeof suppressed === "object" && "message" in suppressed) {
    return String(suppressed.message);
  }

  return null;
}

export async function processResendWebhook({
  rawBody,
  headers,
}: {
  rawBody: string;
  headers: Headers;
}) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  let event: ResendWebhookEvent;

  if (webhookSecret) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    event = asWebhookEvent(resend.webhooks.verify({
      webhookSecret,
      payload: rawBody,
      headers: {
        id: headers.get("webhook-id") ?? "",
        timestamp: headers.get("webhook-timestamp") ?? "",
        signature: headers.get("webhook-signature") ?? "",
      },
    }));
  } else {
    console.warn("Processing Resend webhook without signature verification. Set RESEND_WEBHOOK_SECRET before production use.");
    event = parseWebhookEvent(rawBody);
  }

  const eventType = String(event.type ?? "unknown");
  const eventId = webhookEventId(event);
  const emailId = getWebhookEmailId(event);
  const eventAt = event.created_at ? new Date(event.created_at) : new Date();

  await db
    .insert(schema.webhookEvents)
    .values({
      provider: "resend",
      eventId,
      eventType,
      payload: event,
      processedAt: new Date(),
    })
    .onConflictDoNothing();

  if (emailId) {
    await db
      .update(schema.communications)
      .set({
        providerStatus: providerStatusFromEvent(eventType),
        providerEventAt: eventAt,
        providerError: getWebhookProviderError(event),
      })
      .where(eq(schema.communications.providerMessageId, emailId));

    if (["email.bounced", "email.complained", "email.suppressed"].includes(eventType)) {
      const communication = await db.query.communications.findFirst({
        where: eq(schema.communications.providerMessageId, emailId),
      });

      if (communication?.customerId) {
        await optOutCustomer(communication.customerId, `Resend ${eventType}`);
      }
    }
  }

  return { ok: true, eventType };
}
