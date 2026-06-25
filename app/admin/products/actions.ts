"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/profile";
import { defaultPickupNote } from "@/lib/shop";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ShopPickupStatus } from "@/types/database";

const pickupStatuses: ShopPickupStatus[] = [
  "pending_event_pickup",
  "ready_for_pickup",
  "picked_up",
  "contact_required",
  "cancelled",
];

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

function readAmountCents(formData: FormData) {
  const value = readString(formData, "price_dollars");

  if (!value) {
    return null;
  }

  const amount = Number(value.replaceAll(",", ""));
  return Number.isFinite(amount) ? Math.round(amount * 100) : null;
}

function readSortOrder(formData: FormData) {
  const value = Number(readString(formData, "sort_order"));
  return Number.isFinite(value) ? Math.round(value) : 0;
}

async function readImageValue(formData: FormData) {
  if (readBool(formData, "remove_image")) {
    return null;
  }

  const imageFile = readFile(formData, "image_file");

  if (imageFile?.size) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(imageFile.type)) {
      redirect("/admin/products?error=image-type");
    }

    if (imageFile.size > 1_200_000) {
      redirect("/admin/products?error=image-size");
    }

    const bytes = Buffer.from(await imageFile.arrayBuffer());
    return `data:${imageFile.type};base64,${bytes.toString("base64")}`;
  }

  return (
    readNullableString(formData, "image_url") ??
    readNullableString(formData, "existing_image_url")
  );
}

async function productPayload(formData: FormData) {
  const name = readString(formData, "name");
  const price = readAmountCents(formData);

  if (!name || price === null || price <= 0) {
    redirect("/admin/products?error=product-required");
  }

  return {
    active: readBool(formData, "active"),
    currency: "aud",
    description: readNullableString(formData, "description"),
    image_url: await readImageValue(formData),
    name,
    pickup_note: readNullableString(formData, "pickup_note") ?? defaultPickupNote,
    price,
    sort_order: readSortOrder(formData),
  };
}

async function getProductActionContext(formData: FormData, idRequired = true) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    redirect("/login?redirectTo=/admin/products");
  }

  const id = readString(formData, "id");

  if (idRequired && !id) {
    redirect("/admin/products?error=missing-id");
  }

  return {
    id,
    supabase: createSupabaseServiceClient(),
  };
}

function revalidateProductPaths() {
  revalidatePath("/shop");
  revalidatePath("/admin/products");
}

export async function createProduct(formData: FormData) {
  const { supabase } = await getProductActionContext(formData, false);
  const payload = await productPayload(formData);
  const { error } = await supabase.from("products").insert(payload);

  revalidateProductPaths();

  if (error) {
    redirect("/admin/products?error=product-create");
  }

  redirect("/admin/products?saved=product-created");
}

export async function updateProduct(formData: FormData) {
  const { id, supabase } = await getProductActionContext(formData);
  const payload = await productPayload(formData);
  const { error } = await supabase.from("products").update(payload).eq("id", id);

  revalidateProductPaths();

  if (error) {
    redirect("/admin/products?error=product-update");
  }

  redirect("/admin/products?saved=product-updated");
}

export async function deleteProduct(formData: FormData) {
  const { id, supabase } = await getProductActionContext(formData);
  const { error } = await supabase.from("products").delete().eq("id", id);

  revalidateProductPaths();

  if (error) {
    redirect("/admin/products?error=product-delete");
  }

  redirect("/admin/products?saved=product-deleted");
}

export async function updateShopOrderPickupStatus(formData: FormData) {
  const { id, supabase } = await getProductActionContext(formData);
  const pickupStatus = readString(formData, "pickup_status") as ShopPickupStatus;

  if (!pickupStatuses.includes(pickupStatus)) {
    redirect("/admin/products?error=pickup-status#orders");
  }

  const { error } = await supabase
    .from("shop_orders")
    .update({ pickup_status: pickupStatus })
    .eq("id", id);

  revalidatePath("/admin/products");

  if (error) {
    redirect("/admin/products?error=pickup-update#orders");
  }

  redirect("/admin/products?saved=pickup-updated#orders");
}
