import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';
import { requireAdminUser } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: {
    template: '%s | WW Admin',
    default: 'Admin | Western Wheelcraft',
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminUser = await requireAdminUser();

  return <AdminShell adminUser={adminUser}>{children}</AdminShell>;
}
