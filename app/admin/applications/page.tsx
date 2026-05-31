import Link from "next/link";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminAccess } from "@/lib/auth/profile";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export default async function AdminApplicationsPage() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  const supabase = createSupabaseServiceClient();
  const { data: applications, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase text-clay">
          Applications
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-forest-900">
          Membership applications
        </h1>
      </div>

      <div className="mt-8 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
        {error ? (
          <p className="text-sm font-medium text-red-700">
            Applications could not be loaded.
          </p>
        ) : applications?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead className="border-b border-forest-900/10 text-forest-900/60">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Applicant</th>
                  <th className="py-3 pr-4 font-semibold">Email</th>
                  <th className="py-3 pr-4 font-semibold">Phone</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Submitted</th>
                  <th className="py-3 pr-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-b border-forest-900/10 last:border-b-0"
                  >
                    <td className="py-3 pr-4 font-medium">
                      {application.full_name}
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {application.email}
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {application.phone ?? "Not set"}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={application.status} />
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {formatDateTime(application.created_at)}
                    </td>
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/applications/${application.id}`}
                        className="font-semibold text-clay hover:text-forest-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm leading-6 text-forest-900/70">
            No applications have been submitted yet.
          </p>
        )}
      </div>
    </div>
  );
}
