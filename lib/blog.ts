import "server-only";

import { placeholderPosts } from "@/lib/site-content";
import {
  createSupabaseServiceClient,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type BlogPost = Database["public"]["Tables"]["posts"]["Row"];

function placeholderToPost(
  post: (typeof placeholderPosts)[number],
): BlogPost {
  return {
    body: post.body,
    created_at: post.publishedAt,
    email_sent_at: null,
    excerpt: post.excerpt,
    id: post.slug,
    published_at: post.publishedAt,
    slug: post.slug,
    status: "published",
    title: post.title,
    updated_at: post.publishedAt,
    visibility: "public",
  };
}

const fallbackPosts = placeholderPosts.map(placeholderToPost);

export async function getPublicBlogPosts() {
  if (!hasSupabaseServiceConfig()) {
    return fallbackPosts;
  }

  const { data, error } = await createSupabaseServiceClient()
    .from("posts")
    .select("*")
    .eq("status", "published")
    .eq("visibility", "public")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [] as BlogPost[];
  }

  return data;
}

export async function getPublicBlogPostBySlug(slug: string) {
  if (!hasSupabaseServiceConfig()) {
    return fallbackPosts.find((post) => post.slug === slug) ?? null;
  }

  const { data, error } = await createSupabaseServiceClient()
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("visibility", "public")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}
