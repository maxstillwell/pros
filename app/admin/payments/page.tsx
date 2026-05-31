import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { getAdminAccess } from "@/lib/auth/profile";

export default async function AdminPaymentsPage() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  return (
    <div className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase text-clay">Payments</p>
      <h1 className="mt-2 text-3xl font-semibold text-forest-900">
        Payment records
      </h1>
      <p className="mt-4 text-sm leading-6 text-forest-900/70">
        Payment records are stored in the database for the membership workflow.
        Stripe payment link automation remains a later step.
      </p>
    </div>
  );
}
