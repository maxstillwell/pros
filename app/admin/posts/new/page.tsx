import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { getAdminAccess } from "@/lib/auth/profile";

export default async function AdminNewPostPage() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  return (
    <div className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase text-clay">New post</p>
      <h1 className="mt-2 text-3xl font-semibold text-forest-900">
        Post editor placeholder
      </h1>
      <div className="mt-6 grid gap-4">
        {["Title", "Slug", "Excerpt", "Body", "Visibility", "Status"].map(
          (label) => (
            <label key={label} className="block">
              <span className="text-sm font-semibold text-forest-900">
                {label}
              </span>
              <input
                disabled
                className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 bg-forest-50 px-3 py-2 text-forest-900/60"
                placeholder="Coming soon"
              />
            </label>
          ),
        )}
      </div>
    </div>
  );
}
