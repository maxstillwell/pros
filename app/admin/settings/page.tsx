import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { getAdminAccess } from "@/lib/auth/profile";

export default async function AdminSettingsPage() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  return (
    <div className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase text-clay">Settings</p>
      <h1 className="mt-2 text-3xl font-semibold text-forest-900">
        Settings placeholder
      </h1>
      <p className="mt-4 text-sm leading-6 text-forest-900/70">
        Club settings can be added once the first operational workflows are in
        place.
      </p>
    </div>
  );
}
