import Link from "next/link";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  deleteContactTicket,
  updateContactTicket,
} from "@/app/admin/contact/actions";
import { getAdminAccess } from "@/lib/auth/profile";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ContactTicketStatus } from "@/types/database";

type AdminContactPageProps = {
  searchParams: Promise<{
    error?: string;
    q?: string;
    saved?: string;
    status?: string;
  }>;
};

const statusFilters = [
  "all",
  "new",
  "in_progress",
  "resolved",
  "archived",
] as const;
const ticketStatuses: ContactTicketStatus[] = [
  "new",
  "in_progress",
  "resolved",
  "archived",
];

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

  return `/admin/contact${params.size ? `?${params}` : ""}`;
}

export default async function AdminContactPage({
  searchParams,
}: AdminContactPageProps) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  const params = await searchParams;
  const activeStatus = getSafeStatus(params.status);
  const search = cleanSearch(params.q);
  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("contact_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus as ContactTicketStatus);
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,topic.ilike.%${search}%,subject.ilike.%${search}%`,
    );
  }

  const { data: tickets, error } = await query;

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase text-clay">
          Contact tickets
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-forest-900">
          Website enquiries
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-forest-900/70">
          Messages submitted through the public contact form appear here.
        </p>
      </div>

      {params.saved ? (
        <div className="mt-6 rounded-md border border-forest-700/20 bg-white p-4 text-sm font-medium text-forest-900">
          Contact ticket update saved.
        </div>
      ) : null}

      {params.error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          Contact ticket update failed.
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
              {status === "all" ? "All" : status.replaceAll("_", " ")}
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
            placeholder="Search name, email, phone, topic, or subject"
            className="min-h-11 flex-1 rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
          />
          <button className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white hover:bg-forest-900">
            Search
          </button>
        </form>
      </div>

      <section className="mt-8 grid gap-5">
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            Contact tickets could not be loaded.
          </div>
        ) : tickets?.length ? (
          tickets.map((ticket) => (
            <article
              key={ticket.id}
              className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={ticket.status} />
                    <span className="rounded-md border border-forest-900/10 bg-forest-50 px-2 py-1 text-xs font-semibold text-forest-900/70">
                      {ticket.topic}
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-forest-900">
                    {ticket.subject}
                  </h2>
                  <p className="mt-2 text-sm text-forest-900/62">
                    {ticket.name} | {ticket.email}
                    {ticket.phone ? ` | ${ticket.phone}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-forest-900/54">
                    Submitted {formatDateTime(ticket.created_at)}
                    {ticket.source_path ? ` from ${ticket.source_path}` : ""}
                  </p>
                </div>
                <a
                  href={`mailto:${ticket.email}`}
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-forest-900/20 px-4 py-2 text-sm font-semibold text-clay hover:bg-forest-50"
                >
                  Reply by email
                </a>
              </div>

              <div className="mt-5 whitespace-pre-line rounded-md border border-forest-900/10 bg-forest-50 p-4 text-sm leading-7 text-forest-900/76">
                {ticket.message}
              </div>

              <form className="mt-5 grid gap-4 md:grid-cols-[14rem_1fr_auto] md:items-end">
                <input type="hidden" name="id" value={ticket.id} />
                <label className="block">
                  <span className="text-sm font-semibold text-forest-900">
                    Status
                  </span>
                  <select
                    name="status"
                    defaultValue={ticket.status}
                    className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
                  >
                    {ticketStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-forest-900">
                    Admin notes
                  </span>
                  <textarea
                    name="admin_notes"
                    rows={3}
                    defaultValue={ticket.admin_notes ?? ""}
                    className="mt-2 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
                  />
                </label>
                <button
                  formAction={updateContactTicket}
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
                >
                  Save
                </button>
              </form>

              <form className="mt-3">
                <input type="hidden" name="id" value={ticket.id} />
                <ConfirmSubmitButton
                  formAction={deleteContactTicket}
                  message="Delete this contact ticket permanently?"
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100"
                >
                  Delete Ticket
                </ConfirmSubmitButton>
              </form>
            </article>
          ))
        ) : (
          <div className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
            <p className="text-sm leading-6 text-forest-900/70">
              No contact tickets match this view.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
