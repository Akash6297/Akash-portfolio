import { requireAdminPage } from '@/lib/auth/session';
import { isDbConfigured } from '@/lib/db/connect';
import { AdminShell } from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  return (
    <AdminShell user={{ username: session.username, email: session.email, superAdmin: session.superAdmin }} dbConfigured={isDbConfigured()}>
      {children}
    </AdminShell>
  );
}
