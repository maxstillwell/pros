import Link from "next/link";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { PostFormFields } from "@/components/admin/post-form";
import { createPost } from "@/app/admin/posts/actions";
import { getAdminAccess } from "@/lib/auth/profile";

export default async function AdminNewPostPage() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase text-clay">New post</p>
        <h1 className="mt-2 text-3xl font-semibold text-forest-900">
          Create blog article
        </h1>
        <Link
          href="/admin/posts"
          className="mt-4 inline-flex text-sm font-semibold text-clay hover:text-forest-900"
        >
          Back to posts
        </Link>
      </div>

      <form className="mt-8 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
        <PostFormFields />
        <button
          formAction={createPost}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
        >
          Save Post
        </button>
      </form>
    </div>
  );
}
