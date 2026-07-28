import "server-only";

import {
  createSupabaseServiceClient,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ShopOrder = Database["public"]["Tables"]["shop_orders"]["Row"];

export const defaultPickupNote =
  "Member-only pickup at the next PROS society event. No postal delivery is available.";

export function formatProductPrice(product: Pick<Product, "currency" | "price">) {
  if (product.price === null) {
    return "Contact PROS";
  }

  return new Intl.NumberFormat("en-AU", {
    currency: product.currency.toUpperCase(),
    style: "currency",
  }).format(product.price / 100);
}

export function publicProductImageUrl(
  product: Pick<Product, "id" | "image_url">,
) {
  if (!product.image_url) {
    return null;
  }

  if (product.image_url.startsWith("data:image/")) {
    return `/api/products/${product.id}/image`;
  }

  return product.image_url;
}

export function withPublicProductImages<T extends Pick<Product, "id" | "image_url">>(
  products: T[],
) {
  return products.map((product) => ({
    ...product,
    image_url: publicProductImageUrl(product),
  }));
}

export async function getProducts({
  includeInactive = false,
}: {
  includeInactive?: boolean;
} = {}) {
  if (!hasSupabaseServiceConfig()) {
    return [] as Product[];
  }

  let query = createSupabaseServiceClient()
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!includeInactive) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [] as Product[];
  }

  return data;
}

export async function getShopOrders({ limit = 50 }: { limit?: number } = {}) {
  if (!hasSupabaseServiceConfig()) {
    return [] as ShopOrder[];
  }

  const { data, error } = await createSupabaseServiceClient()
    .from("shop_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [] as ShopOrder[];
  }

  return data;
}
