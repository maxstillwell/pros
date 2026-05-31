import { redirect } from "next/navigation";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminAccess } from "@/lib/auth/profile";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getAdminAccess();

  if (access.status === "unauthenticated") {
    redirect("/login?redirectTo=/admin");
  }

  return (
    <AdminShell>
      {access.status === "ok" ? children : <AdminAccessNotice access={access} />}
    </AdminShell>
  );
}
