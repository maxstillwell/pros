import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PostFormFields } from "@/components/admin/post-form";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  deletePost,
  publishPost,
  unpublishPost,
  updatePost,
} from "@/app/admin/posts/actions";
import { getAdminAccess } from "@/lib/auth/profile";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type AdminPostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function AdminPostDetailPage({
  params,
  searchParams,
}: AdminPostDetailPageProps) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  const { id } = await params;
  const messages = await searchParams;
  const { data: post } = await createSupabaseServiceClient()
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-clay">Edit post</p>
          <h1 className="mt-2 text-3xl font-semibold text-forest-900">
            {post.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status={post.status} />
            <span className="rounded-md border border-forest-900/10 bg-forest-50 px-2 py-1 text-xs font-semibold text-forest-900/70">
              {post.visibility.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-3 text-xs text-forest-900/58">
            Published {formatDateTime(post.published_at)} | Updated{" "}
            {formatDateTime(post.updated_at)}
          </p>
          <Link
            href="/admin/posts"
            className="mt-4 inline-flex text-sm font-semibold text-clay hover:text-forest-900"
          >
            Back to posts
          </Link>
        </div>
        {post.status === "published" && post.visibility === "public" ? (
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-forest-50"
          >
            View public article
          </Link>
        ) : null}
      </div>

      {messages.saved ? (
        <div className="mt-6 rounded-md border border-forest-700/20 bg-white p-4 text-sm font-medium text-forest-900">
          Post update saved.
        </div>
      ) : null}

      {messages.error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          Post update failed.
        </div>
      ) : null}

      <form className="mt-8 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
        <input type="hidden" name="id" value={post.id} />
        <PostFormFields post={post} />
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            formAction={updatePost}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
          >
            Save Post
          </button>
          {post.status === "published" ? (
            <button
              formAction={unpublishPost}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-forest-50"
            >
              Move to Draft
            </button>
          ) : (
            <button
              formAction={publishPost}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-clay px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
            >
              Publish Now
            </button>
          )}
        </div>
      </form>

      <form className="mt-6 rounded-md border border-red-200 bg-red-50 p-6 shadow-sm">
        <input type="hidden" name="id" value={post.id} />
        <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
        <p className="mt-3 text-sm leading-6 text-red-800">
          Delete this post only when it was created by mistake.
        </p>
        <ConfirmSubmitButton
          formAction={deletePost}
          message="Delete this post permanently?"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          Delete Post
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
