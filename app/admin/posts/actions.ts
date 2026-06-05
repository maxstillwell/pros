"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { PostStatus, PostVisibility } from "@/types/database";

const postStatuses: PostStatus[] = ["draft", "published"];
const postVisibilities: PostVisibility[] = ["public", "members_only"];

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value ? value : null;
}

function readStatus(formData: FormData) {
  const status = readString(formData, "status");
  return postStatuses.includes(status as PostStatus)
    ? (status as PostStatus)
    : "draft";
}

function readVisibility(formData: FormData) {
  const visibility = readString(formData, "visibility");
  return postVisibilities.includes(visibility as PostVisibility)
    ? (visibility as PostVisibility)
    : "public";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function readPublishedAt(formData: FormData, status: PostStatus) {
  if (status !== "published") {
    return null;
  }

  const existing = readNullableString(formData, "existing_published_at");

  if (existing) {
    return existing;
  }

  return new Date().toISOString();
}

function postPayload(formData: FormData) {
  const title = readString(formData, "title");
  const slug = slugify(readString(formData, "slug") || title);
  const status = readStatus(formData);

  if (!title || !slug) {
    redirect("/admin/posts?error=post-required");
  }

  return {
    body: readNullableString(formData, "body"),
    excerpt: readNullableString(formData, "excerpt"),
    published_at: readPublishedAt(formData, status),
    slug,
    status,
    title,
    visibility: readVisibility(formData),
  };
}

async function getPostActionContext(formData: FormData, idRequired = true) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    redirect("/login?redirectTo=/admin/posts");
  }

  const id = readString(formData, "id");

  if (idRequired && !id) {
    redirect("/admin/posts?error=missing-id");
  }

  return {
    id,
    supabase: createSupabaseServiceClient(),
  };
}

function revalidatePostPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/posts");

  if (slug) {
    revalidatePath(`/news/${slug}`);
  }
}

export async function createPost(formData: FormData) {
  const { supabase } = await getPostActionContext(formData, false);
  const payload = postPayload(formData);
  const { data, error } = await supabase
    .from("posts")
    .insert(payload)
    .select("id, slug")
    .single();

  revalidatePostPaths(payload.slug);

  if (error || !data) {
    redirect("/admin/posts?error=create");
  }

  redirect(`/admin/posts/${data.id}?saved=created`);
}

export async function updatePost(formData: FormData) {
  const { id, supabase } = await getPostActionContext(formData);
  const payload = postPayload(formData);
  const { data: existing } = await supabase
    .from("posts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("posts").update(payload).eq("id", id);

  revalidatePostPaths(payload.slug);

  if (existing?.slug && existing.slug !== payload.slug) {
    revalidatePath(`/news/${existing.slug}`);
  }

  if (error) {
    redirect(`/admin/posts/${id}?error=update`);
  }

  redirect(`/admin/posts/${id}?saved=updated`);
}

export async function deletePost(formData: FormData) {
  const { id, supabase } = await getPostActionContext(formData);
  const { data: existing } = await supabase
    .from("posts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("posts").delete().eq("id", id);

  revalidatePostPaths(existing?.slug);

  if (error) {
    redirect(`/admin/posts/${id}?error=delete`);
  }

  redirect("/admin/posts?saved=deleted");
}

async function setPostStatus(formData: FormData, status: PostStatus) {
  const { id, supabase } = await getPostActionContext(formData);
  const { data: existing } = await supabase
    .from("posts")
    .select("slug, published_at")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase
    .from("posts")
    .update({
      published_at:
        status === "published"
          ? existing?.published_at ?? new Date().toISOString()
          : null,
      status,
    })
    .eq("id", id);

  revalidatePostPaths(existing?.slug);

  if (error) {
    redirect(`/admin/posts/${id}?error=status`);
  }

  redirect(`/admin/posts/${id}?saved=${status}`);
}

export async function publishPost(formData: FormData) {
  return setPostStatus(formData, "published");
}

export async function unpublishPost(formData: FormData) {
  return setPostStatus(formData, "draft");
}
