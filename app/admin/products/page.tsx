import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { getAdminAccess } from "@/lib/auth/profile";

export default async function AdminProductsPage() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  return (
    <div className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase text-clay">Products</p>
      <h1 className="mt-2 text-3xl font-semibold text-forest-900">
        Product admin placeholder
      </h1>
      <p className="mt-4 text-sm leading-6 text-forest-900/70">
        Product records are included in the schema. Stripe Checkout and shop
        checkout are left as TODOs for the next phase.
      </p>
    </div>
  );
}
