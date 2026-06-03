"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value ? value : null;
}

function readBool(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function readSortOrder(formData: FormData) {
  const value = Number(readString(formData, "sort_order"));
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function readAmountCents(formData: FormData) {
  const value = readString(formData, "amount_dollars");

  if (!value) {
    return null;
  }

  const amount = Number(value.replaceAll(",", ""));
  return Number.isFinite(amount) ? Math.round(amount * 100) : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function sponsorPayload(formData: FormData) {
  const name = readString(formData, "name");
  const slug = slugify(readString(formData, "slug") || name);

  if (!name || !slug) {
    redirect("/admin/sponsors?error=sponsor-required");
  }

  return {
    active: readBool(formData, "active"),
    contact_email: readNullableString(formData, "contact_email"),
    contact_name: readNullableString(formData, "contact_name"),
    contact_phone: readNullableString(formData, "contact_phone"),
    description: readNullableString(formData, "description"),
    featured: readBool(formData, "featured"),
    logo_url: readNullableString(formData, "logo_url"),
    name,
    slug,
    sort_order: readSortOrder(formData),
    summary: readNullableString(formData, "summary"),
    tier_id: readNullableString(formData, "tier_id"),
    website_url: readNullableString(formData, "website_url"),
  };
}

function tierPayload(formData: FormData) {
  const name = readString(formData, "name");
  const slug = slugify(readString(formData, "slug") || name);
  const priceLabel = readString(formData, "price_label");

  if (!name || !slug || !priceLabel) {
    redirect("/admin/sponsors?error=tier-required");
  }

  return {
    active: readBool(formData, "active"),
    amount: readAmountCents(formData),
    benefits: readNullableString(formData, "benefits"),
    contact_required: readBool(formData, "contact_required"),
    description: readNullableString(formData, "description"),
    name,
    price_label: priceLabel,
    slug,
    sort_order: readSortOrder(formData),
  };
}

async function getSponsorActionContext(formData: FormData, idRequired = true) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    redirect("/login?redirectTo=/admin/sponsors");
  }

  const id = readString(formData, "id");

  if (idRequired && !id) {
    redirect("/admin/sponsors?error=missing-id");
  }

  return {
    id,
    supabase: createSupabaseServiceClient(),
  };
}

function revalidateSponsorPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/sponsors");
  revalidatePath("/sponsorship");
  revalidatePath("/sponsorship/become");
  revalidatePath("/admin/sponsors");

  if (slug) {
    revalidatePath(`/sponsors/${slug}`);
    revalidatePath(`/sponsorship/${slug}`);
  }
}

export async function createSponsor(formData: FormData) {
  const { supabase } = await getSponsorActionContext(formData, false);
  const payload = sponsorPayload(formData);
  const { error } = await supabase.from("sponsors").insert(payload);

  revalidateSponsorPaths(payload.slug);

  if (error) {
    redirect("/admin/sponsors?error=sponsor-create");
  }

  redirect("/admin/sponsors?saved=sponsor-created");
}

export async function updateSponsor(formData: FormData) {
  const { id, supabase } = await getSponsorActionContext(formData);
  const payload = sponsorPayload(formData);
  const { data: existing } = await supabase
    .from("sponsors")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("sponsors").update(payload).eq("id", id);

  revalidateSponsorPaths(payload.slug);

  if (existing?.slug && existing.slug !== payload.slug) {
    revalidatePath(`/sponsors/${existing.slug}`);
    revalidatePath(`/sponsorship/${existing.slug}`);
  }

  if (error) {
    redirect("/admin/sponsors?error=sponsor-update");
  }

  redirect("/admin/sponsors?saved=sponsor-updated");
}

export async function deleteSponsor(formData: FormData) {
  const { id, supabase } = await getSponsorActionContext(formData);
  const { data: existing } = await supabase
    .from("sponsors")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("sponsors").delete().eq("id", id);

  revalidateSponsorPaths(existing?.slug);

  if (error) {
    redirect("/admin/sponsors?error=sponsor-delete");
  }

  redirect("/admin/sponsors?saved=sponsor-deleted");
}

export async function updateSponsorshipTier(formData: FormData) {
  const { id, supabase } = await getSponsorActionContext(formData);
  const payload = tierPayload(formData);
  const { error } = await supabase
    .from("sponsorship_tiers")
    .update(payload)
    .eq("id", id);

  revalidateSponsorPaths();

  if (error) {
    redirect("/admin/sponsors?error=tier-update");
  }

  redirect("/admin/sponsors?saved=tier-updated");
}
