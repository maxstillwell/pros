import Link from "next/link";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  markMemberActive,
  markMemberCancelled,
  markMemberExpired,
} from "@/app/admin/members/actions";
import { getAdminAccess } from "@/lib/auth/profile";
import { formatDate, formatDateTime } from "@/lib/format";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types/database";

type AdminMembersPageProps = {
  searchParams: Promise<{
    status?: string;
    q?: string;
    saved?: string;
    error?: string;
  }>;
};

const statusFilters = [
  "all",
  "approved",
  "active",
  "expired",
  "cancelled",
  "rejected",
] as const;

type MemberStatusFilter = (typeof statusFilters)[number];

function getSafeStatus(value: string | undefined): MemberStatusFilter {
  return statusFilters.includes(value as (typeof statusFilters)[number])
    ? (value as MemberStatusFilter)
    : "all";
}

function cleanSearch(value: string | undefined) {
  return value?.trim().replaceAll(",", " ") ?? "";
}

function memberFilterHref(status: string, q: string) {
  const params = new URLSearchParams();

  if (status !== "all") {
    params.set("status", status);
  }

  if (q) {
    params.set("q", q);
  }

  return `/admin/members${params.size ? `?${params}` : ""}`;
}

export default async function AdminMembersPage({
  searchParams,
}: AdminMembersPageProps) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  const params = await searchParams;
  const activeStatus = getSafeStatus(params.status);
  const search = cleanSearch(params.q);
  const returnTo = memberFilterHref(activeStatus, search);
  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeStatus !== "all") {
    query = query.eq("membership_status", activeStatus as ApplicationStatus);
  }

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
    );
  }

  const { data: members, error } = await query;

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase text-clay">Members</p>
        <h1 className="mt-2 text-3xl font-semibold text-forest-900">
          Member management
        </h1>
      </div>

      {params.saved ? (
        <div className="mt-6 rounded-md border border-forest-700/20 bg-white p-4 text-sm font-medium text-forest-900">
          Member update saved.
        </div>
      ) : null}

      {params.error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          Member update failed.
        </div>
      ) : null}

      <div className="mt-6 rounded-md border border-forest-900/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <Link
              key={status}
              href={memberFilterHref(status, search)}
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
            Members could not be loaded.
          </p>
        ) : members?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[76rem] text-left text-sm">
              <thead className="border-b border-forest-900/10 text-forest-900/60">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Name</th>
                  <th className="py-3 pr-4 font-semibold">Email</th>
                  <th className="py-3 pr-4 font-semibold">Phone</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Start</th>
                  <th className="py-3 pr-4 font-semibold">Expiry</th>
                  <th className="py-3 pr-4 font-semibold">Stripe customer</th>
                  <th className="py-3 pr-4 font-semibold">Created</th>
                  <th className="py-3 pr-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-forest-900/10 last:border-b-0"
                  >
                    <td className="py-3 pr-4 font-medium">
                      {member.full_name ?? "Not set"}
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {member.email}
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {member.phone ?? "Not set"}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={member.membership_status} />
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {formatDate(member.membership_started_at)}
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {formatDate(member.membership_expires_at)}
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {member.stripe_customer_id ?? "Not set"}
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {formatDateTime(member.created_at)}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/members/${member.id}`}
                          className="rounded-md border border-forest-900/20 px-3 py-2 font-semibold text-clay hover:bg-forest-50"
                        >
                          View
                        </Link>
                        <form>
                          <input type="hidden" name="id" value={member.id} />
                          <input type="hidden" name="returnTo" value={returnTo} />
                          <button
                            formAction={markMemberActive}
                            className="rounded-md border border-forest-900/20 px-3 py-2 font-semibold text-forest-900 hover:bg-forest-50"
                          >
                            Mark Active
                          </button>
                        </form>
                        <form>
                          <input type="hidden" name="id" value={member.id} />
                          <input type="hidden" name="returnTo" value={returnTo} />
                          <button
                            formAction={markMemberExpired}
                            className="rounded-md border border-forest-900/20 px-3 py-2 font-semibold text-forest-900 hover:bg-forest-50"
                          >
                            Mark Expired
                          </button>
                        </form>
                        <form>
                          <input type="hidden" name="id" value={member.id} />
                          <input type="hidden" name="returnTo" value={returnTo} />
                          <ConfirmSubmitButton
                            formAction={markMemberCancelled}
                            message="Cancel this member?"
                            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 font-semibold text-red-800 hover:bg-red-100"
                          >
                            Mark Cancelled
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm leading-6 text-forest-900/70">
            No members match this view.
          </p>
        )}
      </div>
    </div>
  );
}
