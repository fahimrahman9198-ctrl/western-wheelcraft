/**
 * Shared types for admin client components.
 *
 * The entity types are derived from the server data-layer functions so a schema
 * change flows through automatically. These are type-only imports from a
 * `server-only` module, which the compiler erases entirely — no server code
 * ends up in the client bundle.
 */
import type {
  getAdminLeadsData,
  getAdminBookingsData,
  getAdminCustomersData,
  getAdminInvoicesData,
} from "@/lib/admin-data";

export type AdminLead = Awaited<ReturnType<typeof getAdminLeadsData>>[number];
export type AdminBooking = Awaited<ReturnType<typeof getAdminBookingsData>>[number];
export type AdminCustomer = Awaited<ReturnType<typeof getAdminCustomersData>>[number];
export type AdminInvoice = Awaited<ReturnType<typeof getAdminInvoicesData>>[number];

/** Static company details passed into lead/invoice views for display. */
export type CompanyInfo = {
  name: string;
  address: string;
  phone: string;
  email: string;
  gst?: string;
  website?: string;
  logoUrl?: string;
};
