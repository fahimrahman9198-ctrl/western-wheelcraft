import { getAdminCustomersData } from '@/lib/admin-data';
import { CustomersClientPage } from '@/components/admin/CustomersClientPage';

export default async function CustomersPage() {
  const customers = await getAdminCustomersData();

  // Convert dates to serializable format for client component
  const customersForClient = customers.map((c) => ({
    ...c,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
  }));

  return (
    <div className="p-6">
      <CustomersClientPage customers={customersForClient as any} />
    </div>
  );
}
