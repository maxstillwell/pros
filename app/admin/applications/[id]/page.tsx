import { notFound } from "next/navigation";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  approveApplication,
  rejectApplication,
  saveApplicationNotes,
} from "@/app/admin/applications/actions";
import { getAdminAccess } from "@/lib/auth/profile";
import { formatDate, formatDateTime } from "@/lib/format";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type AdminApplicationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

const errorCopy: Record<string, string> = {
  notes: "Notes could not be saved.",
  approve: "The application could not be approved.",
  reject: "The application could not be rejected.",
  profile: "The profile record could not be created or updated.",
  "not-authorized": "You are not authorised to update this application.",
  "not-found": "The application could not be found.",
};

export default async function AdminApplicationDetailPage({
  params,
  searchParams,
}: AdminApplicationDetailPageProps) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  const { id } = await params;
  const messages = await searchParams;
  const supabase = createSupabaseServiceClient();
  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (!application) {
    notFound();
  }

  const detailRows = [
    ["Full name", application.full_name],
    ["Email", application.email],
    ["Phone", application.phone],
    ["Date of birth", formatDate(application.date_of_birth)],
    ["Address", application.address],
    ["Emergency contact name", application.emergency_contact_name],
    ["Emergency contact phone", application.emergency_contact_phone],
    ["Outdoor interests", application.outdoor_interests],
    ["Firearms licence information", application.firearms_licence_info],
    ["Referral", application.referral],
    ["Reason for joining", application.reason_for_joining],
    ["Typed signature", application.typed_signature],
    ["Submitted", formatDateTime(application.created_at)],
    ["Reviewed", formatDateTime(application.reviewed_at)],
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-clay">
            Application
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-forest-900">
            {application.full_name}
          </h1>
          <div className="mt-3">
            <StatusBadge status={application.status} />
          </div>
        </div>
      </div>

      {messages.saved ? (
        <div className="mt-6 rounded-md border border-forest-700/20 bg-white p-4 text-sm font-medium text-forest-900">
          Application update saved.
        </div>
      ) : null}

      {messages.error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {errorCopy[messages.error] ?? "The application could not be updated."}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <section className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-forest-900">
            Application details
          </h2>
          <dl className="mt-5 grid gap-4">
            {detailRows.map(([label, value]) => (
              <div
                key={label}
                className="grid gap-1 border-b border-forest-900/10 pb-4 last:border-b-0 last:pb-0 md:grid-cols-[14rem_1fr]"
              >
                <dt className="text-sm font-semibold text-forest-900">
                  {label}
                </dt>
                <dd className="whitespace-pre-wrap text-sm leading-6 text-forest-900/72">
                  {value || "Not set"}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-forest-900">
            Review actions
          </h2>
          <p className="mt-3 text-sm leading-6 text-forest-900/70">
            Approval creates or updates a profile with membership status
            approved. Payment remains a future Stripe step.
          </p>

          <form className="mt-6 grid gap-4">
            <input type="hidden" name="id" value={application.id} />
            <label className="block">
              <span className="text-sm font-semibold text-forest-900">
                Internal notes
              </span>
              <textarea
                name="adminNotes"
                rows={8}
                defaultValue={application.admin_notes ?? ""}
                className="mt-2 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
              />
            </label>
            <div className="grid gap-3">
              <button
                formAction={saveApplicationNotes}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-forest-50"
              >
                Save notes
              </button>
              <button
                formAction={approveApplication}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
              >
                Approve application
              </button>
              <button
                formAction={rejectApplication}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-800 transition hover:bg-red-100"
              >
                Reject application
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
