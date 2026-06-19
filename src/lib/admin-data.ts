import "server-only";

import { asc, count, desc, eq, gte, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";

const DAY_MS = 24 * 60 * 60 * 1000;

function since(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
}

async function countRows<T>(query: Promise<T[]>): Promise<number> {
  const rows = await query as Array<{ value: number }>;
  return Number(rows[0]?.value ?? 0);
}

export async function getAdminOverviewData() {
  const [recentQuotes, customerCount, pendingQuoteCount, newLeadCount, bookingCount] = await Promise.all([
    db.query.quotes.findMany({
      orderBy: [desc(schema.quotes.createdAt)],
      limit: 8,
      with: { vehicle: true },
    }),
    countRows(db.select({ value: count() }).from(schema.customers)),
    countRows(
      db
        .select({ value: count() })
        .from(schema.quotes)
        .where(inArray(schema.quotes.status, ["new", "sent"]))
    ),
    countRows(
      db
        .select({ value: count() })
        .from(schema.quotes)
        .where(gte(schema.quotes.createdAt, since(1)))
    ),
    countRows(db.select({ value: count() }).from(schema.bookings)),
  ]);

  return {
    recentQuotes,
    customerCount,
    pendingQuoteCount,
    newLeadCount,
    bookingCount,
  };
}

export async function getAdminLeadsData() {
  return db.query.quotes.findMany({
    orderBy: [desc(schema.quotes.createdAt)],
    limit: 100,
    with: {
      customer: true,
      vehicle: true,
      photos: {
        orderBy: [asc(schema.quotePhotos.sortOrder)],
      },
    },
  });
}

export async function getAdminBookingsData() {
  return db.query.bookings.findMany({
    orderBy: [desc(schema.bookings.createdAt)],
    limit: 100,
    with: {
      customer: true,
      vehicle: true,
      quote: true,
    },
  });
}

export async function getAdminCustomersData() {
  const customers = await db.query.customers.findMany({
    orderBy: [desc(schema.customers.createdAt)],
    limit: 100,
    with: {
      vehicles: true,
      quotes: true,
      communications: true,
    },
  });

  return customers.map((customer) => ({
    ...customer,
    quotes: [...customer.quotes].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    ),
    communications: [...customer.communications].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    ),
  }));
}

export async function getAdminInvoicesData() {
  return db.query.invoices.findMany({
    orderBy: [desc(schema.invoices.issuedAt)],
    limit: 100,
    with: {
      customer: true,
      booking: true,
      quote: true,
      lineItems: {
        orderBy: [asc(schema.invoiceLineItems.sortOrder)],
      },
      payments: true,
    },
  });
}

function toNumber(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function percentOf(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

export async function getAdminAnalyticsData() {
  const [quotes, bookings, customers, invoices] = await Promise.all([
    db.query.quotes.findMany({
      orderBy: [desc(schema.quotes.createdAt)],
      limit: 500,
    }),
    db.query.bookings.findMany({
      orderBy: [desc(schema.bookings.createdAt)],
      limit: 500,
    }),
    db.query.customers.findMany({
      orderBy: [desc(schema.customers.createdAt)],
      limit: 500,
    }),
    db.query.invoices.findMany({
      orderBy: [desc(schema.invoices.issuedAt)],
      limit: 500,
      with: {
        customer: true,
      },
    }),
  ]);

  const quotedRevenue = quotes.reduce((sum, quote) => sum + toNumber(quote.estimatedTotal), 0);
  const bookedRevenue = bookings.reduce((sum, booking) => sum + toNumber(booking.amount), 0);
  const invoiceRevenue = invoices.reduce((sum, invoice) => sum + toNumber(invoice.total), 0);

  const sourceCounts = [
    { name: "Quote Estimator", count: quotes.filter((quote) => quote.source === "estimator").length, color: "#D81E2A" },
    { name: "Contact Form", count: quotes.filter((quote) => quote.source === "contact_form").length, color: "#3B82F6" },
    { name: "Phone", count: quotes.filter((quote) => quote.source === "phone").length, color: "#22C55E" },
    { name: "Email", count: quotes.filter((quote) => quote.source === "email").length, color: "#A855F7" },
    { name: "Referral", count: quotes.filter((quote) => quote.source === "referral").length, color: "#F97316" },
  ].filter((source) => source.count > 0);

  const serviceTotals = new Map<string, { count: number; amount: number }>();
  for (const quote of quotes) {
    const key = quote.requestedService ?? "Unspecified service";
    const current = serviceTotals.get(key) ?? { count: 0, amount: 0 };
    serviceTotals.set(key, {
      count: current.count + 1,
      amount: current.amount + toNumber(quote.estimatedTotal),
    });
  }

  const regionTotals = new Map<string, { count: number; amount: number }>();
  for (const quote of quotes) {
    const key = quote.region ?? "Region not provided";
    const current = regionTotals.get(key) ?? { count: 0, amount: 0 };
    regionTotals.set(key, {
      count: current.count + 1,
      amount: current.amount + toNumber(quote.estimatedTotal),
    });
  }

  return {
    totals: {
      leads: quotes.length,
      estimatorLeads: quotes.filter((quote) => quote.source === "estimator").length,
      contactLeads: quotes.filter((quote) => quote.source === "contact_form").length,
      bookings: bookings.length,
      customers: customers.length,
      invoices: invoices.length,
      quotedRevenue,
      bookedRevenue,
      invoiceRevenue,
      averageQuoteValue: quotes.length > 0 ? quotedRevenue / quotes.length : 0,
    },
    sourceCounts: sourceCounts.map((source) => ({
      ...source,
      pct: percentOf(source.count, quotes.length),
    })),
    serviceBreakdown: Array.from(serviceTotals.entries())
      .map(([name, value]) => ({
        name,
        count: value.count,
        amount: value.amount,
        pct: percentOf(value.amount, quotedRevenue),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8),
    regionBreakdown: Array.from(regionTotals.entries())
      .map(([name, value]) => ({
        name,
        count: value.count,
        amount: value.amount,
        pct: percentOf(value.amount, quotedRevenue),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8),
    recentInvoices: invoices.slice(0, 8),
  };
}

export async function getCustomerById(customerId: string) {
  return db.query.customers.findFirst({
    where: eq(schema.customers.id, customerId),
    with: {
      vehicles: true,
      quotes: true,
      communications: true,
    },
  });
}
