import "server-only";

import { and, eq, lte } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { sendTransactionalEmail, type TransactionalEmailResult } from "@/lib/email";

const FOLLOW_UP_LIMIT = 25;
const ACTIVE_QUOTE_STATUSES = ["new", "contacted", "quoted", "sent"] as const;
const STOPPED_QUOTE_STATUSES = ["accepted", "booked", "completed", "declined", "cancelled", "expired"];

const FOLLOW_UP_STEPS = [
  { step: 1, delayMs: 24 * 60 * 60 * 1000 },
  { step: 2, delayMs: 3 * 24 * 60 * 60 * 1000 },
  { step: 3, delayMs: 7 * 24 * 60 * 60 * 1000 },
] as const;

type QuoteRecord = typeof schema.quotes.$inferSelect;
type FollowUpRecord = typeof schema.quoteFollowUps.$inferSelect;

function isFollowUpEnabled() {
  return process.env.QUOTE_FOLLOW_UPS_ENABLED === "true";
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

function renderHtml(title: string, intro: string, lines: string[]) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
      <h1 style="font-size:22px;margin:0 0 12px;">${escapeHtml(title)}</h1>
      <p style="margin:0 0 16px;">${escapeHtml(intro)}</p>
      <ul style="padding-left:20px;margin:0 0 16px;">
        ${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
      </ul>
      <p style="margin:0;color:#555;">Reply to this email if you want us to update or close your quote request.</p>
    </div>
  `;
}

function buildQuoteFollowUpEmail(quote: QuoteRecord, step: number) {
  const total = fmtMoney(quote.estimatedTotal);
  const referenceLine = `Reference: ${quote.quoteNumber}`;
  const estimateLine = total ? `Estimated online total: ${total}` : undefined;
  const serviceLine = quote.requestedService ? `Service: ${quote.requestedService}` : undefined;
  const lines = [referenceLine, serviceLine, estimateLine].filter((line): line is string => Boolean(line));

  if (step === 1) {
    const subject = `Still interested in your wheel quote? ${quote.quoteNumber}`;
    const intro = "We received your wheel refinishing request and saved your details. If you want to move forward, reply here and our team can confirm final pricing and next steps.";
    return {
      subject,
      text: `${intro}\n\n${lines.join("\n")}\n\nWestern Wheelcraft`,
      html: renderHtml(subject, intro, lines),
    };
  }

  if (step === 2) {
    const subject = `Your Western Wheelcraft quote is ready for review`;
    const intro = "A quick follow-up on your wheel repair request. Photos and online estimates are used for intake only; final pricing is confirmed by the team before any work starts.";
    return {
      subject,
      text: `${intro}\n\n${lines.join("\n")}\n\nWestern Wheelcraft`,
      html: renderHtml(subject, intro, lines),
    };
  }

  const subject = `Should we keep your wheel repair request open?`;
  const intro = "We are checking whether you still want help with this wheel repair request. Reply here and we can keep it moving, or we can close the request if the timing is not right.";
  return {
    subject,
    text: `${intro}\n\n${lines.join("\n")}\n\nWestern Wheelcraft`,
    html: renderHtml(subject, intro, lines),
  };
}

async function logFollowUpEmail({
  quote,
  email,
  providerMessageId,
}: {
  quote: QuoteRecord;
  email: ReturnType<typeof buildQuoteFollowUpEmail>;
  providerMessageId?: string;
}) {
  try {
    await db.insert(schema.communications).values({
      customerId: quote.customerId,
      type: "email",
      direction: "outbound",
      subject: email.subject,
      body: email.text,
      relatedType: "quote",
      relatedId: quote.id,
      providerMessageId,
    });
  } catch (error) {
    console.error("Failed to log quote follow-up email", error);
  }
}

async function markFollowUp(
  followUpId: string,
  values: Partial<typeof schema.quoteFollowUps.$inferInsert>
) {
  await db
    .update(schema.quoteFollowUps)
    .set({
      ...values,
      updatedAt: new Date(),
    })
    .where(eq(schema.quoteFollowUps.id, followUpId));
}

async function handleSendResult({
  followUp,
  quote,
  email,
  result,
}: {
  followUp: FollowUpRecord;
  quote: QuoteRecord;
  email: ReturnType<typeof buildQuoteFollowUpEmail>;
  result: TransactionalEmailResult;
}) {
  if (result.ok) {
    await logFollowUpEmail({ quote, email, providerMessageId: result.id });
    await markFollowUp(followUp.id, {
      status: "sent",
      subject: email.subject,
      body: email.text,
      providerMessageId: result.id,
      sentAt: new Date(),
      lastError: null,
    });
    return "sent";
  }

  await markFollowUp(followUp.id, {
    status: "failed",
    subject: email.subject,
    body: email.text,
    lastError: result.error ?? "Resend did not accept the email.",
  });
  return "failed";
}

export async function queueQuoteFollowUps(quote: QuoteRecord) {
  if (!isFollowUpEnabled()) return { queued: 0, skipped: "disabled" };
  if (quote.source !== "estimator") return { queued: 0, skipped: "non_estimator" };
  if (!quote.customerEmail) return { queued: 0, skipped: "missing_email" };

  const now = Date.now();
  const rows = FOLLOW_UP_STEPS.map(({ step, delayMs }) => ({
    quoteId: quote.id,
    customerId: quote.customerId,
    sequenceStep: step,
    scheduledFor: new Date(now + delayMs),
  }));

  try {
    const queued = await db
      .insert(schema.quoteFollowUps)
      .values(rows)
      .onConflictDoNothing()
      .returning({ id: schema.quoteFollowUps.id });

    return { queued: queued.length };
  } catch (error) {
    console.error("Failed to queue quote follow-ups", error);
    return { queued: 0, error: error instanceof Error ? error.message : "Unknown queue error" };
  }
}

export async function processDueQuoteFollowUps() {
  if (!isFollowUpEnabled()) {
    return { processed: 0, sent: 0, skipped: 0, failed: 0, disabled: true };
  }

  const dueFollowUps = await db.query.quoteFollowUps.findMany({
    where: and(
      eq(schema.quoteFollowUps.status, "scheduled"),
      lte(schema.quoteFollowUps.scheduledFor, new Date())
    ),
    with: {
      quote: true,
    },
    limit: FOLLOW_UP_LIMIT,
  });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const followUp of dueFollowUps) {
    const quote = followUp.quote;

    if (!quote || !quote.customerEmail || STOPPED_QUOTE_STATUSES.includes(quote.status)) {
      await markFollowUp(followUp.id, {
        status: "skipped",
        skippedAt: new Date(),
        lastError: quote ? `Quote status is ${quote.status}.` : "Quote no longer exists.",
      });
      skipped += 1;
      continue;
    }

    if (!ACTIVE_QUOTE_STATUSES.includes(quote.status as (typeof ACTIVE_QUOTE_STATUSES)[number])) {
      await markFollowUp(followUp.id, {
        status: "skipped",
        skippedAt: new Date(),
        lastError: `Quote status is ${quote.status}.`,
      });
      skipped += 1;
      continue;
    }

    const email = buildQuoteFollowUpEmail(quote, followUp.sequenceStep);
    const result = await sendTransactionalEmail({
      to: quote.customerEmail,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
    const outcome = await handleSendResult({ followUp, quote, email, result });

    if (outcome === "sent") sent += 1;
    else failed += 1;
  }

  return {
    processed: dueFollowUps.length,
    sent,
    skipped,
    failed,
    disabled: false,
  };
}
