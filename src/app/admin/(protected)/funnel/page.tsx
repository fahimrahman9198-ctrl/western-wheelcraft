import { getEmailFunnelAdminData } from "@/lib/email-automations";
import { EmailFunnelClientPage } from "@/components/admin/EmailFunnelClientPage";

export default async function FunnelPage() {
  const data = await getEmailFunnelAdminData();

  return (
    <div className="p-6 lg:p-8">
      <EmailFunnelClientPage initialData={data} />
    </div>
  );
}
