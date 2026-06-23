import { relations } from "drizzle-orm/relations";
import { adminUsers, adminSettings, customers, quotes, vehicles, communications, invoices, invoiceLineItems, payments, bookings, quotePhotos } from "./schema";

export const adminSettingsRelations = relations(adminSettings, ({one}) => ({
	adminUser: one(adminUsers, {
		fields: [adminSettings.updatedBy],
		references: [adminUsers.id]
	}),
}));

export const adminUsersRelations = relations(adminUsers, ({many}) => ({
	adminSettings: many(adminSettings),
}));

export const quotesRelations = relations(quotes, ({one, many}) => ({
	customer: one(customers, {
		fields: [quotes.customerId],
		references: [customers.id]
	}),
	vehicle: one(vehicles, {
		fields: [quotes.vehicleId],
		references: [vehicles.id]
	}),
	payments: many(payments),
	quotePhotos: many(quotePhotos),
	bookings: many(bookings),
	invoices: many(invoices),
}));

export const customersRelations = relations(customers, ({many}) => ({
	quotes: many(quotes),
	vehicles: many(vehicles),
	communications: many(communications),
	payments: many(payments),
	bookings: many(bookings),
	invoices: many(invoices),
}));

export const vehiclesRelations = relations(vehicles, ({one, many}) => ({
	quotes: many(quotes),
	customer: one(customers, {
		fields: [vehicles.customerId],
		references: [customers.id]
	}),
	bookings: many(bookings),
}));

export const communicationsRelations = relations(communications, ({one}) => ({
	customer: one(customers, {
		fields: [communications.customerId],
		references: [customers.id]
	}),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({one}) => ({
	invoice: one(invoices, {
		fields: [invoiceLineItems.invoiceId],
		references: [invoices.id]
	}),
}));

export const invoicesRelations = relations(invoices, ({one, many}) => ({
	invoiceLineItems: many(invoiceLineItems),
	payments: many(payments),
	customer: one(customers, {
		fields: [invoices.customerId],
		references: [customers.id]
	}),
	booking: one(bookings, {
		fields: [invoices.bookingId],
		references: [bookings.id]
	}),
	quote: one(quotes, {
		fields: [invoices.quoteId],
		references: [quotes.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	customer: one(customers, {
		fields: [payments.customerId],
		references: [customers.id]
	}),
	invoice: one(invoices, {
		fields: [payments.invoiceId],
		references: [invoices.id]
	}),
	booking: one(bookings, {
		fields: [payments.bookingId],
		references: [bookings.id]
	}),
	quote: one(quotes, {
		fields: [payments.quoteId],
		references: [quotes.id]
	}),
}));

export const bookingsRelations = relations(bookings, ({one, many}) => ({
	payments: many(payments),
	customer: one(customers, {
		fields: [bookings.customerId],
		references: [customers.id]
	}),
	vehicle: one(vehicles, {
		fields: [bookings.vehicleId],
		references: [vehicles.id]
	}),
	quote: one(quotes, {
		fields: [bookings.quoteId],
		references: [quotes.id]
	}),
	invoices: many(invoices),
}));

export const quotePhotosRelations = relations(quotePhotos, ({one}) => ({
	quote: one(quotes, {
		fields: [quotePhotos.quoteId],
		references: [quotes.id]
	}),
}));