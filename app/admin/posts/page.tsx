import Link from "next/link";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { getAdminAccess } from "@/lib/auth/profile";

export default async function AdminPostsPage() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  return (
    <div className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase text-clay">Posts</p>
      <h1 className="mt-2 text-3xl font-semibold text-forest-900">
        Posts admin placeholder
      </h1>
      <p className="mt-4 text-sm leading-6 text-forest-900/70">
        The first framework prepares public and members-only post fields without
        adding a complex CMS.
      </p>
      <Link
        href="/admin/posts/new"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
      >
        New post placeholder
      </Link>
    </div>
  );
}
