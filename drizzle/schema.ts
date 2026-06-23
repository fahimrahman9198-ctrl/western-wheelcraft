import { pgTable, uniqueIndex, uuid, varchar, jsonb, timestamp, index, boolean, foreignKey, integer, text, numeric, date, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const bookingSlot = pgEnum("booking_slot", ['shop', 'island', 'kamloops'])
export const bookingStatus = pgEnum("booking_status", ['pending', 'confirmed', 'completed', 'cancelled'])
export const communicationDirection = pgEnum("communication_direction", ['inbound', 'outbound', 'internal'])
export const communicationType = pgEnum("communication_type", ['email', 'sms', 'call', 'note'])
export const customerType = pgEnum("customer_type", ['individual', 'trade'])
export const invoiceStatus = pgEnum("invoice_status", ['draft', 'unpaid', 'paid', 'overdue', 'void'])
export const paymentMethod = pgEnum("payment_method", ['card', 'etransfer', 'cash', 'cheque'])
export const paymentStatus = pgEnum("payment_status", ['pending', 'succeeded', 'failed', 'refunded'])
export const quotePhotoKind = pgEnum("quote_photo_kind", ['damage', 'full_wheel', 'vehicle', 'other'])
export const quoteSource = pgEnum("quote_source", ['estimator', 'contact_form', 'phone', 'email', 'referral'])
export const quoteStatus = pgEnum("quote_status", ['new', 'contacted', 'quoted', 'sent', 'accepted', 'booked', 'completed', 'declined', 'cancelled', 'expired'])
export const userRole = pgEnum("user_role", ['owner', 'manager', 'accountant', 'it'])


export const webhookEvents = pgTable("webhook_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	provider: varchar({ length: 80 }).notNull(),
	eventId: varchar("event_id", { length: 255 }).notNull(),
	eventType: varchar("event_type", { length: 255 }).notNull(),
	payload: jsonb().notNull(),
	processedAt: timestamp("processed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("webhook_events_provider_event_idx").using("btree", table.provider.asc().nullsLast().op("text_ops"), table.eventId.asc().nullsLast().op("text_ops")),
]);

export const adminUsers = pgTable("admin_users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
	name: varchar({ length: 160 }),
	email: varchar({ length: 255 }).notNull(),
	role: userRole().default('manager').notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("admin_users_clerk_user_id_idx").using("btree", table.clerkUserId.asc().nullsLast().op("text_ops")),
	uniqueIndex("admin_users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("admin_users_role_idx").using("btree", table.role.asc().nullsLast().op("enum_ops")),
]);

export const adminSettings = pgTable("admin_settings", {
	key: varchar({ length: 120 }).primaryKey().notNull(),
	value: jsonb().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedBy: uuid("updated_by"),
}, (table) => [
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [adminUsers.id],
			name: "admin_settings_updated_by_admin_users_id_fk"
		}).onDelete("set null"),
]);

export const quotes = pgTable("quotes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	quoteNumber: varchar("quote_number", { length: 40 }).notNull(),
	customerId: uuid("customer_id"),
	vehicleId: uuid("vehicle_id"),
	customerName: varchar("customer_name", { length: 160 }).notNull(),
	customerEmail: varchar("customer_email", { length: 255 }).notNull(),
	customerPhone: varchar("customer_phone", { length: 40 }),
	requestedService: varchar("requested_service", { length: 160 }),
	requestedFinish: varchar("requested_finish", { length: 120 }),
	region: varchar({ length: 120 }),
	wheelCount: integer("wheel_count").default(4).notNull(),
	damageDescription: text("damage_description"),
	estimatedSubtotal: numeric("estimated_subtotal", { precision: 10, scale:  2 }),
	estimatedGst: numeric("estimated_gst", { precision: 10, scale:  2 }),
	estimatedTotal: numeric("estimated_total", { precision: 10, scale:  2 }),
	status: quoteStatus().default('new').notNull(),
	source: quoteSource().default('estimator').notNull(),
	pricingSnapshot: jsonb("pricing_snapshot"),
	notes: text(),
	sentAt: timestamp("sent_at", { withTimezone: true, mode: 'string' }),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("quotes_customer_id_idx").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("quotes_quote_number_idx").using("btree", table.quoteNumber.asc().nullsLast().op("text_ops")),
	index("quotes_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "quotes_customer_id_customers_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.vehicleId],
			foreignColumns: [vehicles.id],
			name: "quotes_vehicle_id_vehicles_id_fk"
		}).onDelete("set null"),
]);

export const vehicles = pgTable("vehicles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	customerId: uuid("customer_id").notNull(),
	year: integer(),
	make: varchar({ length: 120 }).notNull(),
	model: varchar({ length: 120 }).notNull(),
	wheelSize: varchar("wheel_size", { length: 40 }),
	currentFinish: varchar("current_finish", { length: 120 }),
	color: varchar({ length: 120 }),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("vehicles_customer_id_idx").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "vehicles_customer_id_customers_id_fk"
		}).onDelete("cascade"),
]);

export const communications = pgTable("communications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	customerId: uuid("customer_id"),
	type: communicationType().notNull(),
	direction: communicationDirection().notNull(),
	subject: varchar({ length: 255 }),
	body: text().notNull(),
	createdBy: varchar("created_by", { length: 160 }),
	relatedType: varchar("related_type", { length: 40 }),
	relatedId: uuid("related_id"),
	providerMessageId: varchar("provider_message_id", { length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("communications_customer_id_idx").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	index("communications_related_idx").using("btree", table.relatedType.asc().nullsLast().op("text_ops"), table.relatedId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "communications_customer_id_customers_id_fk"
		}).onDelete("set null"),
]);

export const invoiceLineItems = pgTable("invoice_line_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	invoiceId: uuid("invoice_id").notNull(),
	description: text().notNull(),
	quantity: numeric({ precision: 10, scale:  2 }).default('1').notNull(),
	unitPrice: numeric("unit_price", { precision: 10, scale:  2 }).notNull(),
	total: numeric({ precision: 10, scale:  2 }).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
}, (table) => [
	index("invoice_line_items_invoice_id_idx").using("btree", table.invoiceId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoices.id],
			name: "invoice_line_items_invoice_id_invoices_id_fk"
		}).onDelete("cascade"),
]);

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	customerId: uuid("customer_id").notNull(),
	invoiceId: uuid("invoice_id"),
	bookingId: uuid("booking_id"),
	quoteId: uuid("quote_id"),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	currency: varchar({ length: 3 }).default('cad').notNull(),
	method: paymentMethod().default('card').notNull(),
	status: paymentStatus().default('pending').notNull(),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
	stripeCheckoutSessionId: varchar("stripe_checkout_session_id", { length: 255 }),
	stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
	description: text(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	paidAt: timestamp("paid_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("payments_customer_id_idx").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	index("payments_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	uniqueIndex("payments_stripe_intent_idx").using("btree", table.stripePaymentIntentId.asc().nullsLast().op("text_ops")),
	uniqueIndex("payments_stripe_session_idx").using("btree", table.stripeCheckoutSessionId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "payments_customer_id_customers_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoices.id],
			name: "payments_invoice_id_invoices_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "payments_booking_id_bookings_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quotes.id],
			name: "payments_quote_id_quotes_id_fk"
		}).onDelete("set null"),
]);

export const quotePhotos = pgTable("quote_photos", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	quoteId: uuid("quote_id").notNull(),
	kind: quotePhotoKind().default('damage').notNull(),
	storageUrl: text("storage_url").notNull(),
	fileName: varchar("file_name", { length: 255 }),
	mimeType: varchar("mime_type", { length: 120 }),
	sizeBytes: integer("size_bytes"),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("quote_photos_quote_id_idx").using("btree", table.quoteId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quotes.id],
			name: "quote_photos_quote_id_quotes_id_fk"
		}).onDelete("cascade"),
]);

export const bookings = pgTable("bookings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	bookingNumber: varchar("booking_number", { length: 40 }).notNull(),
	customerId: uuid("customer_id").notNull(),
	vehicleId: uuid("vehicle_id"),
	quoteId: uuid("quote_id"),
	service: varchar({ length: 180 }).notNull(),
	serviceType: varchar("service_type", { length: 60 }).default('shop').notNull(),
	slot: bookingSlot().default('shop').notNull(),
	region: varchar({ length: 120 }),
	scheduledDate: date("scheduled_date").notNull(),
	startTime: varchar("start_time", { length: 20 }).notNull(),
	endTime: varchar("end_time", { length: 20 }),
	durationMinutes: integer("duration_minutes"),
	status: bookingStatus().default('pending').notNull(),
	amount: numeric({ precision: 10, scale:  2 }),
	depositPaid: numeric("deposit_paid", { precision: 10, scale:  2 }).default('0').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("bookings_booking_number_idx").using("btree", table.bookingNumber.asc().nullsLast().op("text_ops")),
	index("bookings_customer_id_idx").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	index("bookings_date_slot_idx").using("btree", table.scheduledDate.asc().nullsLast().op("date_ops"), table.slot.asc().nullsLast().op("enum_ops")),
	index("bookings_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "bookings_customer_id_customers_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.vehicleId],
			foreignColumns: [vehicles.id],
			name: "bookings_vehicle_id_vehicles_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quotes.id],
			name: "bookings_quote_id_quotes_id_fk"
		}).onDelete("set null"),
]);

export const customers = pgTable("customers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 160 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 40 }),
	address: text(),
	city: varchar({ length: 120 }),
	province: varchar({ length: 80 }).default('BC'),
	postalCode: varchar("postal_code", { length: 20 }),
	type: customerType().default('individual').notNull(),
	companyName: varchar("company_name", { length: 180 }),
	notes: text(),
	marketingConsent: boolean("marketing_consent").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	archivedAt: timestamp("archived_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("customers_archived_at_idx").using("btree", table.archivedAt.asc().nullsLast().op("timestamptz_ops")),
	index("customers_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("customers_type_idx").using("btree", table.type.asc().nullsLast().op("enum_ops")),
]);

export const invoices = pgTable("invoices", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	invoiceNumber: varchar("invoice_number", { length: 40 }).notNull(),
	customerId: uuid("customer_id").notNull(),
	bookingId: uuid("booking_id"),
	quoteId: uuid("quote_id"),
	subtotal: numeric({ precision: 10, scale:  2 }).notNull(),
	gst: numeric({ precision: 10, scale:  2 }).notNull(),
	total: numeric({ precision: 10, scale:  2 }).notNull(),
	status: invoiceStatus().default('draft').notNull(),
	notes: text(),
	internalNotes: text("internal_notes"),
	issuedAt: timestamp("issued_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	dueAt: timestamp("due_at", { withTimezone: true, mode: 'string' }),
	paidAt: timestamp("paid_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	pst: numeric({ precision: 10, scale:  2 }).default('0').notNull(),
}, (table) => [
	index("invoices_customer_id_idx").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("invoices_invoice_number_idx").using("btree", table.invoiceNumber.asc().nullsLast().op("text_ops")),
	index("invoices_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "invoices_customer_id_customers_id_fk"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "invoices_booking_id_bookings_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [quotes.id],
			name: "invoices_quote_id_quotes_id_fk"
		}).onDelete("set null"),
]);

export const adminActivities = pgTable("admin_activities", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	adminClerkUserId: varchar("admin_clerk_user_id", { length: 255 }).notNull(),
	adminUsername: varchar("admin_username", { length: 160 }).notNull(),
	adminRole: varchar("admin_role", { length: 40 }).notNull(),
	action: varchar({ length: 80 }).notNull(),
	entityType: varchar("entity_type", { length: 40 }).notNull(),
	entityId: uuid("entity_id").notNull(),
	summary: text().notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("admin_activities_admin_idx").using("btree", table.adminClerkUserId.asc().nullsLast().op("text_ops")),
	index("admin_activities_entity_idx").using("btree", table.entityType.asc().nullsLast().op("text_ops"), table.entityId.asc().nullsLast().op("text_ops")),
]);
