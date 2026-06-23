import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const customerTypeEnum = pgEnum("customer_type", ["individual", "trade"]);
export const bookingSlotEnum = pgEnum("booking_slot", ["shop", "island", "kamloops"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["draft", "unpaid", "paid", "overdue", "void"]);
export const quoteStatusEnum = pgEnum("quote_status", [
  "new",
  "contacted",
  "quoted",
  "sent",
  "accepted",
  "booked",
  "completed",
  "declined",
  "cancelled",
  "expired",
]);
export const quoteSourceEnum = pgEnum("quote_source", [
  "estimator",
  "contact_form",
  "phone",
  "email",
  "referral",
]);
export const paymentMethodEnum = pgEnum("payment_method", ["card", "etransfer", "cash", "cheque"]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);
export const communicationTypeEnum = pgEnum("communication_type", ["email", "sms", "call", "note"]);
export const communicationDirectionEnum = pgEnum("communication_direction", [
  "inbound",
  "outbound",
  "internal",
]);
export const userRoleEnum = pgEnum("user_role", ["owner", "manager", "accountant", "it"]);
export const quotePhotoKindEnum = pgEnum("quote_photo_kind", ["damage", "full_wheel", "vehicle", "other"]);
export const aiAssessmentStatusEnum = pgEnum("ai_assessment_status", [
  "pending",
  "completed",
  "failed",
  "manual_review",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    address: text("address"),
    city: varchar("city", { length: 120 }),
    province: varchar("province", { length: 80 }).default("BC"),
    postalCode: varchar("postal_code", { length: 20 }),
    type: customerTypeEnum("type").default("individual").notNull(),
    companyName: varchar("company_name", { length: 180 }),
    notes: text("notes"),
    marketingConsent: boolean("marketing_consent").default(false).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    emailIdx: index("customers_email_idx").on(table.email),
    typeIdx: index("customers_type_idx").on(table.type),
    archivedIdx: index("customers_archived_at_idx").on(table.archivedAt),
  })
);

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    year: integer("year"),
    make: varchar("make", { length: 120 }).notNull(),
    model: varchar("model", { length: 120 }).notNull(),
    wheelSize: varchar("wheel_size", { length: 40 }),
    currentFinish: varchar("current_finish", { length: 120 }),
    color: varchar("color", { length: 120 }),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => ({
    customerIdx: index("vehicles_customer_id_idx").on(table.customerId),
  })
);

export const quotes = pgTable(
  "quotes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    quoteNumber: varchar("quote_number", { length: 40 }).notNull(),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
    customerName: varchar("customer_name", { length: 160 }).notNull(),
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 40 }),
    requestedService: varchar("requested_service", { length: 160 }),
    requestedFinish: varchar("requested_finish", { length: 120 }),
    region: varchar("region", { length: 120 }),
    wheelCount: integer("wheel_count").default(4).notNull(),
    damageDescription: text("damage_description"),
    estimatedSubtotal: numeric("estimated_subtotal", { precision: 10, scale: 2 }),
    estimatedGst: numeric("estimated_gst", { precision: 10, scale: 2 }),
    estimatedTotal: numeric("estimated_total", { precision: 10, scale: 2 }),
    status: quoteStatusEnum("status").default("new").notNull(),
    source: quoteSourceEnum("source").default("estimator").notNull(),
    pricingSnapshot: jsonb("pricing_snapshot"),
    notes: text("notes"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    quoteNumberIdx: uniqueIndex("quotes_quote_number_idx").on(table.quoteNumber),
    customerIdx: index("quotes_customer_id_idx").on(table.customerId),
    statusIdx: index("quotes_status_idx").on(table.status),
  })
);

export const quotePhotos = pgTable(
  "quote_photos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    kind: quotePhotoKindEnum("kind").default("damage").notNull(),
    storageUrl: text("storage_url").notNull(),
    fileName: varchar("file_name", { length: 255 }),
    mimeType: varchar("mime_type", { length: 120 }),
    sizeBytes: integer("size_bytes"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    quoteIdx: index("quote_photos_quote_id_idx").on(table.quoteId),
  })
);

export const aiAssessments = pgTable(
  "ai_assessments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    status: aiAssessmentStatusEnum("status").default("pending").notNull(),
    model: varchar("model", { length: 120 }),
    result: jsonb("result"),
    manualOverride: jsonb("manual_override"),
    technicianReviewRequired: boolean("technician_review_required").default(false).notNull(),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => ({
    quoteIdx: index("ai_assessments_quote_id_idx").on(table.quoteId),
  })
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingNumber: varchar("booking_number", { length: 40 }).notNull(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
    quoteId: uuid("quote_id").references(() => quotes.id, { onDelete: "set null" }),
    service: varchar("service", { length: 180 }).notNull(),
    serviceType: varchar("service_type", { length: 60 }).default("shop").notNull(),
    slot: bookingSlotEnum("slot").default("shop").notNull(),
    region: varchar("region", { length: 120 }),
    scheduledDate: date("scheduled_date").notNull(),
    startTime: varchar("start_time", { length: 20 }).notNull(),
    endTime: varchar("end_time", { length: 20 }),
    durationMinutes: integer("duration_minutes"),
    status: bookingStatusEnum("status").default("pending").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }),
    depositPaid: numeric("deposit_paid", { precision: 10, scale: 2 }).default("0").notNull(),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => ({
    bookingNumberIdx: uniqueIndex("bookings_booking_number_idx").on(table.bookingNumber),
    customerIdx: index("bookings_customer_id_idx").on(table.customerId),
    dateSlotIdx: index("bookings_date_slot_idx").on(table.scheduledDate, table.slot),
    statusIdx: index("bookings_status_idx").on(table.status),
  })
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invoiceNumber: varchar("invoice_number", { length: 40 }).notNull(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    quoteId: uuid("quote_id").references(() => quotes.id, { onDelete: "set null" }),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    gst: numeric("gst", { precision: 10, scale: 2 }).notNull(),
    pst: numeric("pst", { precision: 10, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    status: invoiceStatusEnum("status").default("draft").notNull(),
    notes: text("notes"),
    internalNotes: text("internal_notes"),
    issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    invoiceNumberIdx: uniqueIndex("invoices_invoice_number_idx").on(table.invoiceNumber),
    customerIdx: index("invoices_customer_id_idx").on(table.customerId),
    statusIdx: index("invoices_status_idx").on(table.status),
  })
);

export const invoiceLineItems = pgTable(
  "invoice_line_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 2 }).default("1").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => ({
    invoiceIdx: index("invoice_line_items_invoice_id_idx").on(table.invoiceId),
  })
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    quoteId: uuid("quote_id").references(() => quotes.id, { onDelete: "set null" }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("cad").notNull(),
    method: paymentMethodEnum("method").default("card").notNull(),
    status: paymentStatusEnum("status").default("pending").notNull(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    stripeCheckoutSessionId: varchar("stripe_checkout_session_id", { length: 255 }),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
    description: text("description"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => ({
    customerIdx: index("payments_customer_id_idx").on(table.customerId),
    statusIdx: index("payments_status_idx").on(table.status),
    stripeSessionIdx: uniqueIndex("payments_stripe_session_idx").on(table.stripeCheckoutSessionId),
    stripeIntentIdx: uniqueIndex("payments_stripe_intent_idx").on(table.stripePaymentIntentId),
  })
);

export const communications = pgTable(
  "communications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    type: communicationTypeEnum("type").notNull(),
    direction: communicationDirectionEnum("direction").notNull(),
    subject: varchar("subject", { length: 255 }),
    body: text("body").notNull(),
    createdBy: varchar("created_by", { length: 160 }),
    relatedType: varchar("related_type", { length: 40 }),
    relatedId: uuid("related_id"),
    providerMessageId: varchar("provider_message_id", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    customerIdx: index("communications_customer_id_idx").on(table.customerId),
    relatedIdx: index("communications_related_idx").on(table.relatedType, table.relatedId),
  })
);

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 160 }),
    email: varchar("email", { length: 255 }).notNull(),
    role: userRoleEnum("role").default("manager").notNull(),
    active: boolean("active").default(true).notNull(),
    ...timestamps,
  },
  (table) => ({
    clerkUserIdx: uniqueIndex("admin_users_clerk_user_id_idx").on(table.clerkUserId),
    emailIdx: uniqueIndex("admin_users_email_idx").on(table.email),
    roleIdx: index("admin_users_role_idx").on(table.role),
  })
);

export const adminActivities = pgTable(
  "admin_activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminClerkUserId: varchar("admin_clerk_user_id", { length: 255 }).notNull(),
    adminUsername: varchar("admin_username", { length: 160 }).notNull(),
    adminRole: varchar("admin_role", { length: 40 }).notNull(),
    action: varchar("action", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 40 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    entityIdx: index("admin_activities_entity_idx").on(table.entityType, table.entityId),
    adminIdx: index("admin_activities_admin_idx").on(table.adminClerkUserId),
  })
);

export const adminSettings = pgTable("admin_settings", {
  key: varchar("key", { length: 120 }).primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  updatedBy: uuid("updated_by").references(() => adminUsers.id, { onDelete: "set null" }),
});

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: varchar("provider", { length: 80 }).notNull(),
    eventId: varchar("event_id", { length: 255 }).notNull(),
    eventType: varchar("event_type", { length: 255 }).notNull(),
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    providerEventIdx: uniqueIndex("webhook_events_provider_event_idx").on(table.provider, table.eventId),
  })
);

export const customersRelations = relations(customers, ({ many }) => ({
  vehicles: many(vehicles),
  quotes: many(quotes),
  bookings: many(bookings),
  invoices: many(invoices),
  payments: many(payments),
  communications: many(communications),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  customer: one(customers, {
    fields: [vehicles.customerId],
    references: [customers.id],
  }),
  quotes: many(quotes),
  bookings: many(bookings),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  customer: one(customers, {
    fields: [quotes.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [quotes.vehicleId],
    references: [vehicles.id],
  }),
  photos: many(quotePhotos),
  aiAssessments: many(aiAssessments),
  bookings: many(bookings),
  invoices: many(invoices),
  payments: many(payments),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(customers, {
    fields: [bookings.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [bookings.vehicleId],
    references: [vehicles.id],
  }),
  quote: one(quotes, {
    fields: [bookings.quoteId],
    references: [quotes.id],
  }),
  invoices: many(invoices),
  payments: many(payments),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  booking: one(bookings, {
    fields: [invoices.bookingId],
    references: [bookings.id],
  }),
  quote: one(quotes, {
    fields: [invoices.quoteId],
    references: [quotes.id],
  }),
  lineItems: many(invoiceLineItems),
  payments: many(payments),
}));

export const communicationsRelations = relations(communications, ({ one }) => ({
  customer: one(customers, {
    fields: [communications.customerId],
    references: [customers.id],
  }),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

export type CustomerType = (typeof customerTypeEnum.enumValues)[number];
export type BookingSlot = (typeof bookingSlotEnum.enumValues)[number];
export type BookingStatus = (typeof bookingStatusEnum.enumValues)[number];
export type InvoiceStatus = (typeof invoiceStatusEnum.enumValues)[number];
export type QuoteStatus = (typeof quoteStatusEnum.enumValues)[number];
export type QuoteSource = (typeof quoteSourceEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type CommunicationType = (typeof communicationTypeEnum.enumValues)[number];
export type CommunicationDirection = (typeof communicationDirectionEnum.enumValues)[number];
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type AdminActivity = typeof adminActivities.$inferSelect;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export const healthCheck = sql`select 1`;
