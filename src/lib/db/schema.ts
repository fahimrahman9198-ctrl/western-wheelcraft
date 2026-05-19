/**
 * Database schema definitions — Western Wheelcraft
 * For future Drizzle ORM / PostgreSQL integration.
 * The app currently uses /lib/demo-data/ files instead of a real database.
 */

export type CustomerType = 'trade' | 'individual';
export type BookingSlot = 'shop' | 'mobile_1' | 'mobile_2';
export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';
export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'draft';
export type QuoteStatus = 'new' | 'sent' | 'accepted' | 'declined' | 'expired';
export type QuoteSource = 'estimator' | 'contact_form' | 'phone' | 'email' | 'referral';
export type PaymentMethod = 'card' | 'etransfer' | 'cash' | 'cheque';
export type PaymentStatus = 'succeeded' | 'pending' | 'failed';
export type CommunicationType = 'email' | 'sms' | 'call' | 'note';
export type CommunicationDirection = 'inbound' | 'outbound';
export type UserRole = 'owner' | 'manager' | 'technician';

export interface DbCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  type: CustomerType;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbVehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  wheelSize: string;
  color: string;
  createdAt: Date;
}

export interface DbBooking {
  id: string;
  customerId: string;
  vehicleId: string | null;
  service: string;
  slot: BookingSlot;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: BookingStatus;
  amount: number;
  depositPaid: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  bookingId: string | null;
  subtotal: number;
  gst: number;
  total: number;
  status: InvoiceStatus;
  notes: string | null;
  internalNotes: string | null;
  issuedAt: Date;
  dueAt: Date;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbInvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
  sortOrder: number;
}

export interface DbQuote {
  id: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  vehicleWheelSize: string;
  currentFinish: string;
  requestedService: string;
  damageDescription: string | null;
  region: string;
  estimatedAmount: number;
  status: QuoteStatus;
  source: QuoteSource;
  notes: string | null;
  createdAt: Date;
  sentAt: Date | null;
  expiresAt: Date | null;
}

export interface DbPayment {
  id: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  description: string | null;
  createdAt: Date;
}

export interface DbCommunication {
  id: string;
  customerId: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  subject: string;
  body: string;
  createdAt: Date;
  createdBy: string;
  relatedType: 'booking' | 'invoice' | 'quote' | null;
  relatedId: string | null;
}

export interface DbUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbSetting {
  key: string;
  value: string;
  updatedAt: Date;
}
