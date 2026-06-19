import { z } from "zod";

export const adminRoleSchema = z.enum(["owner", "manager", "accountant", "it"]);

export const customerInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(500).optional(),
  city: z.string().trim().max(120).optional(),
  province: z.string().trim().max(80).default("BC"),
  postalCode: z.string().trim().max(20).optional(),
  type: z.enum(["individual", "trade"]).default("individual"),
  companyName: z.string().trim().max(180).optional(),
  notes: z.string().trim().max(5000).optional(),
  marketingConsent: z.boolean().default(false),
});

export const vehicleInputSchema = z.object({
  customerId: z.string().uuid(),
  year: z.number().int().min(1900).max(2100).optional(),
  make: z.string().trim().min(1).max(120),
  model: z.string().trim().min(1).max(120),
  wheelSize: z.string().trim().max(40).optional(),
  currentFinish: z.string().trim().max(120).optional(),
  color: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const contactRequestSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional(),
  region: z.string().trim().max(120).optional(),
  service: z.string().trim().max(160).optional(),
  message: z.string().trim().max(5000).optional(),
});

export const quoteInputSchema = z.object({
  customerName: z.string().trim().min(2).max(160),
  customerEmail: z.string().trim().email().max(255),
  customerPhone: z.string().trim().max(40).optional(),
  vehicleYear: z.number().int().min(1900).max(2100).optional(),
  vehicleMake: z.string().trim().max(120).optional(),
  vehicleModel: z.string().trim().max(120).optional(),
  wheelSize: z.string().trim().max(40).optional(),
  currentFinish: z.string().trim().max(120).optional(),
  requestedService: z.string().trim().max(160).optional(),
  requestedFinish: z.string().trim().max(120).optional(),
  region: z.string().trim().max(120).optional(),
  wheelCount: z.number().int().min(1).max(12).default(4),
  damageDescription: z.string().trim().max(5000).optional(),
  marketingConsent: z.boolean().default(false),
});

export const bookingInputSchema = z.object({
  customerId: z.string().uuid(),
  vehicleId: z.string().uuid().optional(),
  quoteId: z.string().uuid().optional(),
  service: z.string().trim().min(1).max(180),
  serviceType: z.enum(["shop", "mobile"]).default("shop"),
  slot: z.enum(["shop", "mobile_1", "mobile_2"]).default("shop"),
  region: z.string().trim().max(120).optional(),
  scheduledDate: z.string().date(),
  startTime: z.string().trim().min(1).max(20),
  endTime: z.string().trim().max(20).optional(),
  durationMinutes: z.number().int().positive().optional(),
  amount: z.number().nonnegative().optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const invoiceLineItemInputSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative(),
  total: z.number().nonnegative(),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const invoiceInputSchema = z.object({
  customerId: z.string().uuid(),
  bookingId: z.string().uuid().optional(),
  quoteId: z.string().uuid().optional(),
  subtotal: z.number().nonnegative(),
  gst: z.number().nonnegative(),
  total: z.number().nonnegative(),
  notes: z.string().trim().max(5000).optional(),
  internalNotes: z.string().trim().max(5000).optional(),
  dueAt: z.string().datetime().optional(),
  lineItems: z.array(invoiceLineItemInputSchema).min(1),
});
