import Link from "next/link";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminAccess } from "@/lib/auth/profile";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types/database";

type AdminApplicationsPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
    status?: string;
    q?: string;
  }>;
};

const statusFilters = ["all", "pending", "approved", "rejected"] as const;

function getSafeStatus(value: string | undefined) {
  return statusFilters.includes(value as (typeof statusFilters)[number])
    ? value
    : "all";
}

function cleanSearch(value: string | undefined) {
  return value?.trim().replaceAll(",", " ") ?? "";
}

function filterHref(status: string, q: string) {
  const params = new URLSearchParams();

  if (status !== "all") {
    params.set("status", status);
  }

  if (q) {
    params.set("q", q);
  }

  return `/admin/applications${params.size ? `?${params}` : ""}`;
}

export default async function AdminApplicationsPage({
  searchParams,
}: AdminApplicationsPageProps) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  const params = await searchParams;
  const activeStatus = getSafeStatus(params.status);
  const search = cleanSearch(params.q);
  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus as ApplicationStatus);
  }

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,phone_number.ilike.%${search}%,member_number.ilike.%${search}%`,
    );
  }

  const { data: applications, error } = await query;

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

      {params.saved ? (
        <div className="mt-6 rounded-md border border-forest-700/20 bg-white p-4 text-sm font-medium text-forest-900">
          Application update saved.
        </div>
      ) : null}

      {params.error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          Application update failed.
        </div>
      ) : null}

      <div className="mt-6 rounded-md border border-forest-900/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <Link
              key={status}
              href={filterHref(status, search)}
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                activeStatus === status
                  ? "border-forest-700 bg-forest-700 text-white"
                  : "border-forest-900/15 text-forest-900 hover:bg-forest-50"
              }`}
            >
              {status === "all" ? "All" : status}
            </Link>
          ))}
        </div>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row">
          {activeStatus !== "all" ? (
            <input type="hidden" name="status" value={activeStatus} />
          ) : null}
          <input
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Search by name, email, or phone"
            className="min-h-11 flex-1 rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
          />
          <button className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white hover:bg-forest-900">
            Search
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
        {error ? (
          <p className="text-sm font-medium text-red-700">
            Applications could not be loaded.
          </p>
        ) : applications?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[68rem] text-left text-sm">
              <thead className="border-b border-forest-900/10 text-forest-900/60">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Member #</th>
                  <th className="py-3 pr-4 font-semibold">Applicant</th>
                  <th className="py-3 pr-4 font-semibold">Email</th>
                  <th className="py-3 pr-4 font-semibold">Phone</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Payment</th>
                  <th className="py-3 pr-4 font-semibold">Submitted</th>
                  <th className="py-3 pr-4 font-semibold">Reviewed</th>
                  <th className="py-3 pr-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-b border-forest-900/10 last:border-b-0"
                  >
                    <td className="py-3 pr-4 font-semibold text-clay">
                      {application.member_number ?? "Not set"}
                    </td>
                    <td className="py-3 pr-4 font-medium">
                      {application.full_name}
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {application.email}
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {application.phone_number ??
                        application.phone ??
                        "Not set"}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={application.status} />
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={application.payment_status} />
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {formatDateTime(application.created_at)}
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {formatDateTime(application.reviewed_at)}
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
