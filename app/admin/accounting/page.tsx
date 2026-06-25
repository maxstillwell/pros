import Link from "next/link";
import { createInvoice, deleteInvoice } from "@/app/admin/accounting/actions";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { getAdminAccess } from "@/lib/auth/profile";
import { formatDate } from "@/lib/format";
import { getInvoices, type Invoice } from "@/lib/accounting";
import { getSponsors, type SponsorWithTier } from "@/lib/sponsors";

type AdminAccountingPageProps = {
  searchParams: Promise<{
    saved?: string;
    error?: string;
    invoice?: string;
  }>;
};

const inputClass =
  "mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20";
const textareaClass =
  "mt-2 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20";
const labelClass = "block text-sm font-semibold text-forest-900";
const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900";
const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-forest-50";
const dangerButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800";
const defaultInvoiceDescription =
  "Annual Corporate Sponsorship\n\nSupporting responsible outdoor recreation, conservation, member education and community activities.";

function moneyValue(amount: number, currency = "aud") {
  return `${currency.toUpperCase()} ${(amount / 100).toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function melbourneDateInput(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const parts = new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Australia/Melbourne",
    year: "numeric",
  }).formatToParts(date);
  const byType = new Map(parts.map((part) => [part.type, part.value]));

  return `${byType.get("year")}-${byType.get("month")}-${byType.get("day")}`;
}

function savedMessage(value: string) {
  if (value === "invoice-created") {
    return "Invoice created.";
  }

  if (value === "invoice-deleted") {
    return "Invoice deleted.";
  }

  return "Accounting update saved.";
}

function errorMessage(value: string) {
  const messages: Record<string, string> = {
    "invoice-create":
      "Invoice could not be created. Check the invoice database table has been added.",
    "invoice-delete": "Invoice could not be deleted.",
    "invoice-required":
      "Invoice needs a bill-to name, description and amount.",
    "missing-id": "Invoice id is missing.",
  };

  return messages[value] ?? "Accounting update failed.";
}

function InvoiceForm({ sponsors }: { sponsors: SponsorWithTier[] }) {
  return (
    <section className="mt-8 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-semibold text-forest-900">
            Create invoice
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-forest-900/70">
            Use this for sponsor invoices or any other PROS invoice. Sponsor is
            optional and only helps link the record internally.
          </p>
        </div>
      </div>

      <form className="mt-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            Related sponsor, optional
            <select name="sponsor_id" defaultValue="" className={inputClass}>
              <option value="">No sponsor link</option>
              {sponsors.map((sponsor) => (
                <option key={sponsor.id} value={sponsor.id}>
                  {sponsor.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Bill to
            <input
              name="bill_to_name"
              required
              placeholder="Business or person name"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Billing email
            <input
              name="bill_to_email"
              type="email"
              placeholder="accounts@example.com"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Invoice number
            <input
              name="invoice_number"
              placeholder="Leave blank to auto-generate"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Amount in dollars
            <input
              name="amount_dollars"
              type="number"
              min="0.01"
              step="0.01"
              required
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Issue date
            <input
              name="issued_at"
              type="date"
              defaultValue={melbourneDateInput()}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Due date
            <input
              name="due_at"
              type="date"
              defaultValue={melbourneDateInput(7)}
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Billing address
            <textarea
              name="bill_to_address"
              rows={3}
              placeholder="Optional billing address"
              className={textareaClass}
            />
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Description
            <textarea
              name="description"
              rows={3}
              required
              defaultValue={defaultInvoiceDescription}
              className={textareaClass}
            />
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Payment notes
            <textarea
              name="notes"
              rows={4}
              placeholder="Add bank transfer details or payment instructions here. The invoice number should be used as the payment reference."
              className={textareaClass}
            />
          </label>
        </div>
        <button formAction={createInvoice} className={`${primaryButtonClass} mt-6`}>
          Create Invoice
        </button>
      </form>
    </section>
  );
}

function InvoiceList({
  invoices,
  sponsorsById,
}: {
  invoices: Invoice[];
  sponsorsById: Map<string, SponsorWithTier>;
}) {
  return (
    <section
      id="invoices"
      className="mt-10 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-clay">Invoices</p>
          <h2 className="mt-2 text-xl font-semibold text-forest-900">
            Download invoice PDFs
          </h2>
        </div>
      </div>

      {invoices.length ? (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-forest-900/10 text-xs uppercase text-forest-900/58">
              <tr>
                <th className="py-3 pr-4 font-semibold">Invoice</th>
                <th className="py-3 pr-4 font-semibold">Bill to</th>
                <th className="py-3 pr-4 font-semibold">Sponsor</th>
                <th className="py-3 pr-4 font-semibold">Issued</th>
                <th className="py-3 pr-4 font-semibold">Amount</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-900/10">
              {invoices.map((invoice) => {
                const sponsor = invoice.sponsor_id
                  ? sponsorsById.get(invoice.sponsor_id)
                  : null;

                return (
                  <tr key={invoice.id}>
                    <td className="py-4 pr-4 font-semibold text-forest-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="py-4 pr-4 text-forest-900/70">
                      {invoice.bill_to_name}
                    </td>
                    <td className="py-4 pr-4 text-forest-900/70">
                      {sponsor ? (
                        <Link
                          href="/admin/sponsors"
                          className="font-semibold text-clay hover:text-forest-900"
                        >
                          {sponsor.name}
                        </Link>
                      ) : (
                        "Not linked"
                      )}
                    </td>
                    <td className="py-4 pr-4 text-forest-900/70">
                      {formatDate(invoice.issued_at)}
                    </td>
                    <td className="py-4 pr-4 text-forest-900/70">
                      {moneyValue(invoice.amount, invoice.currency)}
                    </td>
                    <td className="py-4 pr-4 text-forest-900/70">
                      {invoice.status}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`/admin/accounting/invoices/${invoice.id}/pdf`}
                          className={secondaryButtonClass}
                        >
                          Download PDF
                        </a>
                        <form>
                          <input type="hidden" name="id" value={invoice.id} />
                          <ConfirmSubmitButton
                            formAction={deleteInvoice}
                            message="Delete this invoice permanently?"
                            className={dangerButtonClass}
                          >
                            Delete
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-5 text-sm leading-6 text-forest-900/70">
          No invoices have been created yet.
        </p>
      )}
    </section>
  );
}

export default async function AdminAccountingPage({
  searchParams,
}: AdminAccountingPageProps) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  const params = await searchParams;
  const [invoices, sponsors] = await Promise.all([
    getInvoices(),
    getSponsors({ includeInactive: true }),
  ]);
  const sponsorsById = new Map(sponsors.map((sponsor) => [sponsor.id, sponsor]));
  const newInvoiceHref = params.invoice
    ? `/admin/accounting/invoices/${params.invoice}/pdf`
    : null;

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-clay">Accounting</p>
          <h1 className="mt-2 text-3xl font-semibold text-forest-900">
            Invoices
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-forest-900/70">
            Create and download PROS invoice PDFs. Invoices can be linked to a
            sponsor, or left as a general accounting record.
          </p>
        </div>
        <Link href="/admin/payments" className={secondaryButtonClass}>
          View Payments
        </Link>
      </div>

      {params.saved ? (
        <div className="mt-6 rounded-md border border-forest-700/20 bg-white p-4 text-sm font-medium text-forest-900">
          {savedMessage(params.saved)}
          {newInvoiceHref ? (
            <a
              href={newInvoiceHref}
              className="ml-3 font-semibold text-clay hover:text-forest-900"
            >
              Download new invoice PDF
            </a>
          ) : null}
        </div>
      ) : null}

      {params.error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {errorMessage(params.error)}
        </div>
      ) : null}

      <InvoiceForm sponsors={sponsors} />
      <InvoiceList invoices={invoices} sponsorsById={sponsorsById} />
    </div>
  );
}
