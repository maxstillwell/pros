import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  markMemberActive,
  markMemberCancelled,
  markMemberExpired,
  updateMember,
} from "@/app/admin/members/actions";
import { getAdminAccess } from "@/lib/auth/profile";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types/database";

type AdminMemberDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

const memberStatuses: ApplicationStatus[] = [
  "pending",
  "approved",
  "active",
  "expired",
  "cancelled",
  "rejected",
];

function dateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function dollarsFromCents(value: number | null) {
  if (value === null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value / 100);
}

export default async function AdminMemberDetailPage({
  params,
  searchParams,
}: AdminMemberDetailPageProps) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  const { id } = await params;
  const messages = await searchParams;
  const supabase = createSupabaseServiceClient();
  const { data: member } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!member) {
    notFound();
  }

  const { data: linkedApplication } = member.linked_application_id
    ? await supabase
        .from("applications")
        .select("*")
        .eq("id", member.linked_application_id)
        .maybeSingle()
    : await supabase
        .from("applications")
        .select("*")
        .eq("email", member.email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("profile_id", member.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase text-clay">Member</p>
        <h1 className="mt-2 text-3xl font-semibold text-forest-900">
          {member.full_name ?? member.email}
        </h1>
        <div className="mt-3">
          <StatusBadge status={member.membership_status} />
        </div>
        <Link
          href="/admin/members"
          className="mt-4 inline-flex text-sm font-semibold text-clay hover:text-forest-900"
        >
          Back to Members
        </Link>
      </div>

      {messages.saved ? (
        <div className="mt-6 rounded-md border border-forest-700/20 bg-white p-4 text-sm font-medium text-forest-900">
          Member update saved.
        </div>
      ) : null}

      {messages.error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          Member update failed.
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <form className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
          <input type="hidden" name="id" value={member.id} />
          <input type="hidden" name="returnTo" value={`/admin/members/${member.id}`} />

          <h2 className="text-xl font-semibold text-forest-900">
            Contact Details
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-forest-900">
                Name
              </span>
              <input
                name="full_name"
                defaultValue={member.full_name ?? ""}
                className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-forest-900">
                Email
              </span>
              <input
                value={member.email}
                disabled
                className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 bg-forest-50 px-3 py-2 text-sm text-forest-900/70"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-forest-900">
                Phone
              </span>
              <input
                name="phone"
                defaultValue={member.phone ?? ""}
                className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-forest-900">
                Membership status
              </span>
              <select
                name="membership_status"
                defaultValue={member.membership_status}
                className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
              >
                {memberStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-forest-900">
                Membership start date
              </span>
              <input
                name="membership_started_at"
                type="date"
                defaultValue={dateInputValue(member.membership_started_at)}
                className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-forest-900">
                Membership expiry date
              </span>
              <input
                name="membership_expires_at"
                type="date"
                defaultValue={dateInputValue(member.membership_expires_at)}
                className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-forest-900">
                Stripe customer ID
              </span>
              <input
                name="stripe_customer_id"
                defaultValue={member.stripe_customer_id ?? ""}
                className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-forest-900">
                Notes
              </span>
              <textarea
                name="notes"
                rows={7}
                defaultValue={member.notes ?? ""}
                className="mt-2 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <button
              formAction={updateMember}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
            >
              Save Member
            </button>
            <button
              formAction={markMemberActive}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-forest-50"
            >
              Mark Active
            </button>
            <button
              formAction={markMemberExpired}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-forest-50"
            >
              Mark Expired
            </button>
            <ConfirmSubmitButton
              formAction={markMemberCancelled}
              message="Cancel this member?"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-800 transition hover:bg-red-100"
            >
              Mark Cancelled
            </ConfirmSubmitButton>
          </div>
        </form>

        <div className="grid gap-6">
          <section className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-forest-900">
              Linked Application
            </h2>
            {linkedApplication ? (
              <div className="mt-4 text-sm leading-6 text-forest-900/72">
                <p>{linkedApplication.full_name}</p>
                <p>Submitted: {formatDateTime(linkedApplication.created_at)}</p>
                <p>Reviewed: {formatDateTime(linkedApplication.reviewed_at)}</p>
                <Link
                  href={`/admin/applications/${linkedApplication.id}`}
                  className="mt-3 inline-flex font-semibold text-clay hover:text-forest-900"
                >
                  View application
                </Link>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-forest-900/70">
                No linked application was found.
              </p>
            )}
          </section>

          <section className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-forest-900">
              Emergency Contact
            </h2>
            {linkedApplication ? (
              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="font-semibold text-forest-900">Name</dt>
                  <dd className="text-forest-900/72">
                    {linkedApplication.emergency_contact_name ?? "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-forest-900">
                    Relationship
                  </dt>
                  <dd className="text-forest-900/72">
                    {linkedApplication.emergency_contact_relationship ??
                      "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-forest-900">Phone</dt>
                  <dd className="text-forest-900/72">
                    {linkedApplication.emergency_contact_phone ?? "Not set"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm leading-6 text-forest-900/70">
                Emergency contact details are stored on the linked application.
              </p>
            )}
          </section>

          <section className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-forest-900">
              Payment Details
            </h2>
            <p className="mt-3 text-sm leading-6 text-forest-900/70">
              Stripe customer ID: {member.stripe_customer_id ?? "Not set"}
            </p>
            {payments?.length ? (
              <div className="mt-4 grid gap-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-md border border-forest-900/10 p-3 text-sm text-forest-900/72"
                  >
                    <p className="font-semibold text-forest-900">
                      {payment.status ?? "Unknown"} -{" "}
                      {dollarsFromCents(payment.amount)}
                    </p>
                    <p>Type: {payment.payment_type ?? "Not set"}</p>
                    <p>Paid: {formatDateTime(payment.paid_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-forest-900/70">
                No payment records found yet.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
