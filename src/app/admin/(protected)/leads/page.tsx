import { getAdminLeadsData } from '@/lib/admin-data';
import { LeadsClientPage } from '@/components/admin/LeadsClientPage';

const defaultCompany = {
  name: 'Western Wheelcraft',
  address: '3756 Napier St, Burnaby, BC V5C 3E5',
  phone: '(604) 710-6174',
  email: 'info@westernwheelcraft.ca',
};

export default async function LeadsPage() {
  const leads = await getAdminLeadsData();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-display-sm text-brand-white">Leads</h1>
        <p className="mt-1 text-body-sm text-brand-smoke">
          Quote requests and estimator submissions with photos, pricing, and booking creation.
        </p>
      </div>

      <LeadsClientPage leads={leads as any} company={defaultCompany} />
    </div>
  );
}
