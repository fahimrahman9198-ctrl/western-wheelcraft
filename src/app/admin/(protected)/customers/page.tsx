import { getAdminCustomersData } from '@/lib/admin-data';
import { CustomersClientPage, type Customer } from '@/components/admin/CustomersClientPage';

export default async function CustomersPage() {
  const customers = await getAdminCustomersData();

  // Map DB rows (nullable columns) to the client component's shape, which uses
  // optional properties rather than nulls.
  const customersForClient: Customer[] = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone ?? undefined,
    address: c.address ?? undefined,
    city: c.city ?? undefined,
    province: c.province ?? undefined,
    postalCode: c.postalCode ?? undefined,
    type: c.type,
    companyName: c.companyName ?? undefined,
    marketingConsent: c.marketingConsent,
    notes: c.notes ?? undefined,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
  }));

  return (
    <div className="p-6">
      <CustomersClientPage customers={customersForClient} />
    </div>
  );
}
