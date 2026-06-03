import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { CopyLinkButton } from "@/components/admin/copy-link-button";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  approveApplication,
  deleteApplication,
  markApplicationManuallyPaid,
  rejectApplication,
  resendPaymentEmail,
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
  delete: "The application could not be deleted.",
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

function dollarsFromCents(value: number | null) {
  if (value === null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value / 100);
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

  const { data: profileByApplication } = await supabase
    .from("profiles")
    .select("*")
    .eq("linked_application_id", application.id)
    .maybeSingle();
  const { data: profileByEmail } = profileByApplication
    ? { data: null }
    : await supabase
        .from("profiles")
        .select("*")
        .eq("email", application.email)
        .maybeSingle();
  const linkedProfile = profileByApplication ?? profileByEmail;
  const { data: latestPayment } = await supabase
    .from("payments")
    .select("*")
    .eq("application_id", application.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const canTakePaymentAction =
    application.status === "approved" && application.payment_status !== "paid";

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
        ["Payment status", application.payment_status],
        ["Member number", application.member_number],
        ["Reviewed", formatDateTime(application.reviewed_at)],
        ["Reviewed by profile ID", application.reviewed_by],
      ],
    },
    {
      title: "Member Details",
      rows: [
        ["Profile ID", linkedProfile?.member_number ?? application.member_number],
        ["Member number", linkedProfile?.member_number ?? application.member_number],
        ["Member status", linkedProfile?.membership_status ?? null],
        ["Payment status", linkedProfile?.payment_status ?? null],
        ["Membership started", formatDateTime(linkedProfile?.membership_started_at ?? null)],
        ["Membership expires", formatDateTime(linkedProfile?.membership_expires_at ?? null)],
        ["Internal profile UUID", linkedProfile?.id ?? null],
      ],
    },
    {
      title: "Payment Details",
      rows: [
        ["Payment status", application.payment_status],
        ["Checkout session", application.stripe_checkout_session_id],
        ["Latest payment status", latestPayment?.status ?? null],
        ["Latest payment amount", latestPayment ? dollarsFromCents(latestPayment.amount) : null],
        ["Latest paid at", formatDateTime(latestPayment?.paid_at ?? null)],
        ["Stripe customer", latestPayment?.stripe_customer_id ?? linkedProfile?.stripe_customer_id ?? null],
        ["Stripe subscription", latestPayment?.stripe_subscription_id ?? linkedProfile?.stripe_subscription_id ?? null],
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
        <a
          href={`/admin/applications/${application.id}/pdf`}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 bg-white px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-forest-50"
        >
          Download PDF
        </a>
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

        <div className="grid gap-6">
          <section className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-forest-900">
              Review actions
            </h2>
            <p className="mt-3 text-sm leading-6 text-forest-900/70">
              Approval creates or updates a member profile, assigns a member
              number, creates a Stripe checkout link when configured, and sends
              the payment email.
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
                {application.status === "pending" ? (
                  <>
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
                  </>
                ) : null}
                {canTakePaymentAction ? (
                  <>
                    <button
                      formAction={resendPaymentEmail}
                      className="inline-flex min-h-11 items-center justify-center rounded-md bg-clay px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
                    >
                      Resend Payment Email
                    </button>
                    <ConfirmSubmitButton
                      formAction={markApplicationManuallyPaid}
                      message="Mark this membership payment as paid manually?"
                      className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-forest-50"
                    >
                      Mark Payment Manually Paid
                    </ConfirmSubmitButton>
                  </>
                ) : null}
                {linkedProfile ? (
                  <Link
                    href={`/admin/members/${linkedProfile.id}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-forest-50"
                  >
                    View Member
                  </Link>
                ) : null}
              </div>
            </form>

            <div className="mt-6 border-t border-forest-900/10 pt-5">
              <h3 className="text-sm font-semibold uppercase text-clay">
                Payment Status
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={application.payment_status} />
                {linkedProfile?.membership_status ? (
                  <StatusBadge status={linkedProfile.membership_status} />
                ) : null}
              </div>
              {application.stripe_payment_link ? (
                <div className="mt-4 grid gap-3">
                  <input
                    readOnly
                    value={application.stripe_payment_link}
                    className="min-h-11 w-full rounded-md border border-forest-900/20 bg-forest-50 px-3 py-2 text-sm text-forest-900/75"
                  />
                  <div className="flex flex-wrap gap-3">
                    <CopyLinkButton value={application.stripe_payment_link} />
                    <a
                      href={application.stripe_payment_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center justify-center rounded-md border border-forest-900/20 px-4 py-2 text-sm font-semibold text-clay transition hover:bg-forest-50"
                    >
                      Open payment link
                    </a>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-forest-900/70">
                  No Stripe payment link is stored yet. Configure Stripe or use
                  manual paid fallback after receiving payment another way.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-md border border-red-200 bg-red-50 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
            <p className="mt-3 text-sm leading-6 text-red-800">
              Delete this application only when it was entered by mistake. This
              also removes related payment records and unlinks the member profile.
            </p>
            <form className="mt-5">
              <input type="hidden" name="id" value={application.id} />
              <ConfirmSubmitButton
                formAction={deleteApplication}
                message="Delete this application permanently?"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                Delete Application
              </ConfirmSubmitButton>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
