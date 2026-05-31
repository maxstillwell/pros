import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
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

type DetailSection = {
  title: string;
  rows: Array<[string, string | boolean | null]>;
};

const errorCopy: Record<string, string> = {
  notes: "Notes could not be saved.",
  approve: "The application could not be approved.",
  reject: "The application could not be rejected.",
  profile: "The profile record could not be created or updated.",
  "not-authorized": "You are not authorised to update this application.",
  "not-found": "The application could not be found.",
};

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

function renderValue(value: string | boolean | null) {
  if (typeof value === "boolean") {
    return yesNo(value);
  }

  return value || "Not set";
}

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

  const detailSections: DetailSection[] = [
    {
      title: "Applicant Details",
      rows: [
        ["Full Name", application.full_name],
        ["Date of Birth", formatDate(application.date_of_birth)],
        [
          "Residential Address",
          application.residential_address ?? application.address,
        ],
        ["Phone Number", application.phone_number ?? application.phone],
        ["Email Address", application.email],
        ["Occupation", application.occupation],
        ["Firearms Licence Number", application.firearms_licence_number],
        ["Licence Category", application.licence_category],
        ["Expiry Date", formatDate(application.licence_expiry_date)],
      ],
    },
    {
      title: "Emergency Contact",
      rows: [
        ["Name", application.emergency_contact_name],
        ["Relationship", application.emergency_contact_relationship],
        ["Phone Number", application.emergency_contact_phone],
      ],
    },
    {
      title: "Outdoor Interests",
      rows: [
        ["Selected interests", application.outdoor_interests],
        ["Other details", application.outdoor_interests_other],
      ],
    },
    {
      title: "Membership Acknowledgement",
      rows: [
        [
          "Acknowledgement",
          "Applicant acknowledged the Society expectations, activity risks, and agreement to conduct requirements shown on the application form.",
        ],
      ],
    },
    {
      title: "Membership Acknowledgement Agreements",
      rows: [
        ["Safe conduct", application.agree_safe_conduct],
        ["Lawful directions", application.agree_lawful_directions],
        ["Victorian regulations", application.agree_regulations],
        ["Respect environment", application.agree_respect_environment],
        ["No reckless behaviour", application.agree_no_reckless_behaviour],
        ["No intoxication", application.agree_no_intoxication],
        [
          "Personal responsibility",
          application.agree_personal_responsibility,
        ],
        ["Rules consequence", application.agree_rules_consequence],
      ],
    },
    {
      title: "Liability Waiver",
      rows: [["Accepted", application.accept_liability_waiver]],
    },
    {
      title: "Privacy Consent",
      rows: [["Accepted", application.accept_privacy_consent]],
    },
    {
      title: "Signature",
      rows: [
        [
          "Applicant Signature / Typed Full Name",
          application.applicant_signature ?? application.typed_signature,
        ],
        ["Date", formatDate(application.application_date)],
        ["Submitted", formatDateTime(application.created_at)],
        ["Reviewed", formatDateTime(application.reviewed_at)],
      ],
    },
    {
      title: "Admin Notes",
      rows: [["Internal notes", application.admin_notes]],
    },
    {
      title: "Review History",
      rows: [
        ["Status", application.status],
        ["Reviewed", formatDateTime(application.reviewed_at)],
        ["Reviewed by profile ID", application.reviewed_by],
      ],
    },
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
          <Link
            href="/admin/applications"
            className="mt-4 inline-flex text-sm font-semibold text-clay hover:text-forest-900"
          >
            Back to Applications
          </Link>
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
        <div className="grid gap-6">
          {detailSections.map((section) => (
            <section
              key={section.title}
              className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-forest-900">
                {section.title}
              </h2>
              <dl className="mt-5 grid gap-4">
                {section.rows.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid gap-1 border-b border-forest-900/10 pb-4 last:border-b-0 last:pb-0 md:grid-cols-[14rem_1fr]"
                  >
                    <dt className="text-sm font-semibold text-forest-900">
                      {label}
                    </dt>
                    <dd className="whitespace-pre-wrap text-sm leading-6 text-forest-900/72">
                      {renderValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

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
                Save Notes
              </button>
              <button
                formAction={approveApplication}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
              >
                Approve Application
              </button>
              <ConfirmSubmitButton
                formAction={rejectApplication}
                message="Reject this application?"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-800 transition hover:bg-red-100"
              >
                Reject Application
              </ConfirmSubmitButton>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
