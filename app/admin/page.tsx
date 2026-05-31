import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { getAdminAccess } from "@/lib/auth/profile";

export default async function AdminDashboardPage() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase text-clay">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-forest-900">
          Club admin overview
        </h1>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {["Pending applications", "Active members", "Published posts"].map(
          (label) => (
            <article
              key={label}
              className="rounded-md border border-forest-900/10 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-forest-900/60">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-forest-900">--</p>
            </article>
          ),
        )}
      </div>
      <div className="mt-8 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-forest-900">
          Recent applications
        </h2>
        <p className="mt-3 text-sm leading-6 text-forest-900/70">
          Application counts and recent submissions will appear here once the
          Supabase admin queries are connected.
        </p>
      </div>
    </div>
  );
}
