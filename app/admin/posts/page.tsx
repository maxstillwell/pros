import Link from "next/link";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminAccess } from "@/lib/auth/profile";
import { formatDateTime } from "@/lib/format";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { PostStatus, PostVisibility } from "@/types/database";

type AdminPostsPageProps = {
  searchParams: Promise<{
    error?: string;
    q?: string;
    saved?: string;
    status?: string;
    visibility?: string;
  }>;
};

const statusFilters = ["all", "draft", "published"] as const;
const visibilityFilters = ["all", "public", "members_only"] as const;
type StatusFilter = (typeof statusFilters)[number];
type VisibilityFilter = (typeof visibilityFilters)[number];

function getSafeStatus(value: string | undefined): StatusFilter {
  return statusFilters.includes(value as (typeof statusFilters)[number])
    ? (value as StatusFilter)
    : "all";
}

function getSafeVisibility(value: string | undefined): VisibilityFilter {
  return visibilityFilters.includes(value as (typeof visibilityFilters)[number])
    ? (value as VisibilityFilter)
    : "all";
}

function cleanSearch(value: string | undefined) {
  return value?.trim().replaceAll(",", " ") ?? "";
}

function filterHref(status: string, visibility: string, q: string) {
  const params = new URLSearchParams();

  if (status !== "all") {
    params.set("status", status);
  }

  if (visibility !== "all") {
    params.set("visibility", visibility);
  }

  if (q) {
    params.set("q", q);
  }

  return `/admin/posts${params.size ? `?${params}` : ""}`;
}

export default async function AdminPostsPage({
  searchParams,
}: AdminPostsPageProps) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  const params = await searchParams;
  const activeStatus = getSafeStatus(params.status);
  const activeVisibility = getSafeVisibility(params.visibility);
  const search = cleanSearch(params.q);
  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus as PostStatus);
  }

  if (activeVisibility !== "all") {
    query = query.eq("visibility", activeVisibility as PostVisibility);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,slug.ilike.%${search}%,excerpt.ilike.%${search}%`,
    );
  }

  const { data: posts, error } = await query;

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-clay">News</p>
          <h1 className="mt-2 text-3xl font-semibold text-forest-900">
            News publishing
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-forest-900/70">
            Create, edit and publish public news posts for the website.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
        >
          New Post
        </Link>
      </div>

      {params.saved ? (
        <div className="mt-6 rounded-md border border-forest-700/20 bg-white p-4 text-sm font-medium text-forest-900">
          Post update saved.
        </div>
      ) : null}

      {params.error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          Post update failed.
        </div>
      ) : null}

      <div className="mt-6 rounded-md border border-forest-900/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <Link
              key={status}
              href={filterHref(status, activeVisibility, search)}
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                activeStatus === status
                  ? "border-forest-700 bg-forest-700 text-white"
                  : "border-forest-900/15 text-forest-900 hover:bg-forest-50"
              }`}
            >
              {status === "all" ? "All status" : status}
            </Link>
          ))}
          {visibilityFilters.map((visibility) => (
            <Link
              key={visibility}
              href={filterHref(activeStatus, visibility, search)}
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                activeVisibility === visibility
                  ? "border-clay bg-clay text-white"
                  : "border-forest-900/15 text-forest-900 hover:bg-forest-50"
              }`}
            >
              {visibility === "all"
                ? "All visibility"
                : visibility.replaceAll("_", " ")}
            </Link>
          ))}
        </div>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row">
          {activeStatus !== "all" ? (
            <input type="hidden" name="status" value={activeStatus} />
          ) : null}
          {activeVisibility !== "all" ? (
            <input type="hidden" name="visibility" value={activeVisibility} />
          ) : null}
          <input
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Search title, slug, or excerpt"
            className="min-h-11 flex-1 rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
          />
          <button className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white hover:bg-forest-900">
            Search
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
        {error ? (
          <p className="text-sm font-medium text-red-700">
            Posts could not be loaded.
          </p>
        ) : posts?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[62rem] text-left text-sm">
              <thead className="border-b border-forest-900/10 text-forest-900/60">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Title</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Visibility</th>
                  <th className="py-3 pr-4 font-semibold">Published</th>
                  <th className="py-3 pr-4 font-semibold">Updated</th>
                  <th className="py-3 pr-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-forest-900/10 last:border-b-0"
                  >
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-forest-900">
                        {post.title}
                      </p>
                      <p className="mt-1 text-xs text-forest-900/58">
                        /news/{post.slug}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {post.visibility.replaceAll("_", " ")}
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {formatDateTime(post.published_at)}
                    </td>
                    <td className="py-3 pr-4 text-forest-900/72">
                      {formatDateTime(post.updated_at)}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="font-semibold text-clay hover:text-forest-900"
                        >
                          Edit
                        </Link>
                        {post.status === "published" &&
                        post.visibility === "public" ? (
                          <Link
                            href={`/news/${post.slug}`}
                            className="font-semibold text-forest-900/68 hover:text-forest-900"
                          >
                            View
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm leading-6 text-forest-900/70">
            No posts match this view.
          </p>
        )}
      </div>
    </div>
  );
}
