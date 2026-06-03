import Link from "next/link";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminAccess } from "@/lib/auth/profile";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

function dollarsFromCents(value: number | null) {
  if (value === null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value / 100);
}

export default async function AdminPaymentsPage() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  const supabase = createSupabaseServiceClient();
  const { data: payments, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase text-clay">Payments</p>
        <h1 className="mt-2 text-3xl font-semibold text-forest-900">
          Payment records
        </h1>
      </div>

      <div className="mt-8 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
        {error ? (
          <p className="text-sm font-medium text-red-700">
            Payment records could not be loaded.
          </p>
        ) : payments?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[70rem] text-left text-sm">
              <thead className="border-b border-forest-900/10 text-forest-900/60">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Member #</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Amount</th>
                  <th className="py-3 pr-4 font-semibold">Type</th>
                  <th className="py-3 pr-4 font-semibold">Paid</th>
                  <th className="py-3 pr-4 font-semibold">Application</th>
                  <th className="py-3 pr-4 font-semibold">Member</th>
                  <th className="py-3 pr-4 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-forest-900/10 last:border-b-0"
                  >
                    <td className="py-3 pr-4 font-semibold text-clay">
                      {payment.member_number ?? "Not set"}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={payment.status ?? "not_required"} />
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {dollarsFromCents(payment.amount)}
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {payment.payment_type ?? "Not set"}
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {formatDateTime(payment.paid_at)}
                    </td>
                    <td className="py-3 pr-4">
                      {payment.application_id ? (
                        <Link
                          href={`/admin/applications/${payment.application_id}`}
                          className="font-semibold text-clay hover:text-forest-900"
                        >
                          View
                        </Link>
                      ) : (
                        "Not linked"
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {payment.profile_id ? (
                        <Link
                          href={`/admin/members/${payment.profile_id}`}
                          className="font-semibold text-clay hover:text-forest-900"
                        >
                          View
                        </Link>
                      ) : (
                        "Not linked"
                      )}
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {formatDateTime(payment.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm leading-6 text-forest-900/70">
            No payment records found yet.
          </p>
        )}
      </div>
    </div>
  );
}
