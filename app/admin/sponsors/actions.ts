"use server";

import { randomInt } from "node:crypto";
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

function readFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "size" in value &&
    "type" in value
  ) {
    return value as File;
  }

  return null;
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

function readNullableDate(formData: FormData, key: string) {
  const value = readString(formData, key);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function melbourneDatePart() {
  const parts = new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Australia/Melbourne",
    year: "numeric",
  }).formatToParts(new Date());
  const byType = new Map(parts.map((part) => [part.type, part.value]));

  return `${byType.get("year")}${byType.get("month")}${byType.get("day")}`;
}

function generateInvoiceNumber() {
  return `INV-${melbourneDatePart()}-${randomInt(1000, 10000)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function readLogoValue(formData: FormData) {
  if (readBool(formData, "remove_logo")) {
    return null;
  }

  const logoFile = readFile(formData, "logo_file");

  if (logoFile?.size) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(logoFile.type)) {
      redirect("/admin/sponsors?error=logo-type");
    }

    if (logoFile.size > 750_000) {
      redirect("/admin/sponsors?error=logo-size");
    }

    const bytes = Buffer.from(await logoFile.arrayBuffer());
    return `data:${logoFile.type};base64,${bytes.toString("base64")}`;
  }

  return (
    readNullableString(formData, "logo_url") ??
    readNullableString(formData, "existing_logo_url")
  );
}

async function sponsorPayload(formData: FormData) {
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
    logo_url: await readLogoValue(formData),
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

function sponsorInvoicePayload(formData: FormData, invoiceNumber: string) {
  const amount = readAmountCents(formData);
  const billToName = readString(formData, "bill_to_name");
  const description = readString(formData, "description");
  const sponsorId = readNullableString(formData, "sponsor_id");

  if (!sponsorId || !billToName || !description || amount === null || amount <= 0) {
    redirect("/admin/sponsors?error=invoice-required#sponsor-invoices");
  }

  return {
    amount,
    bill_to_address: readNullableString(formData, "bill_to_address"),
    bill_to_email: readNullableString(formData, "bill_to_email"),
    bill_to_name: billToName,
    currency: "aud",
    description,
    due_at: readNullableDate(formData, "due_at"),
    invoice_number: invoiceNumber,
    issued_at: readNullableDate(formData, "issued_at") ?? undefined,
    notes: readNullableString(formData, "notes"),
    sponsor_id: sponsorId,
    status: "issued" as const,
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
  const payload = await sponsorPayload(formData);
  const { error } = await supabase.from("sponsors").insert(payload);

  revalidateSponsorPaths(payload.slug);

  if (error) {
    redirect("/admin/sponsors?error=sponsor-create");
  }

  redirect("/admin/sponsors?saved=sponsor-created");
}

export async function updateSponsor(formData: FormData) {
  const { id, supabase } = await getSponsorActionContext(formData);
  const payload = await sponsorPayload(formData);
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

export async function createSponsorInvoice(formData: FormData) {
  const { supabase } = await getSponsorActionContext(formData, false);
  const providedInvoiceNumber = readString(formData, "invoice_number");
  let lastError = false;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const invoiceNumber =
      attempt === 0 && providedInvoiceNumber
        ? providedInvoiceNumber
        : generateInvoiceNumber();
    const payload = sponsorInvoicePayload(formData, invoiceNumber);
    const { data, error } = await supabase
      .from("sponsor_invoices")
      .insert(payload)
      .select("id")
      .single();

    if (!error && data?.id) {
      revalidatePath("/admin/sponsors");
      redirect(
        `/admin/sponsors?saved=invoice-created&invoice=${data.id}#sponsor-invoices`,
      );
    }

    lastError = true;

    if (providedInvoiceNumber || error?.code !== "23505") {
      break;
    }
  }

  if (lastError) {
    redirect("/admin/sponsors?error=invoice-create#sponsor-invoices");
  }
}

export async function deleteSponsorInvoice(formData: FormData) {
  const { id, supabase } = await getSponsorActionContext(formData);
  const { error } = await supabase.from("sponsor_invoices").delete().eq("id", id);

  revalidatePath("/admin/sponsors");

  if (error) {
    redirect("/admin/sponsors?error=invoice-delete#sponsor-invoices");
  }

  redirect("/admin/sponsors?saved=invoice-deleted#sponsor-invoices");
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
