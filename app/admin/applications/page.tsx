import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { getAdminAccess } from "@/lib/auth/profile";

export default async function AdminApplicationsPage() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  return (
    <div className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase text-clay">Applications</p>
      <h1 className="mt-2 text-3xl font-semibold text-forest-900">
        Membership applications
      </h1>
      <p className="mt-4 text-sm leading-6 text-forest-900/70">
        The review table will be connected in the next build slice.
      </p>
    </div>
  );
}
