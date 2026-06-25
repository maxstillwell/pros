import { defaultPickupNote } from "@/lib/shop";
import { getSiteUrl } from "@/lib/supabase/env";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readQuantity(formData: FormData) {
  const value = Number(readFormString(formData, "quantity") || "1");

  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(Math.max(Math.round(value), 1), 10);
}

function stripeDescription(value: string | null, pickupNote: string) {
  const description = value?.trim();
  const rows = [
    description,
    "Member-only item. Pickup at the next PROS society event.",
    pickupNote,
  ].filter(Boolean);

  return rows.join(" ");
}

function setMetadata(
  body: URLSearchParams,
  metadata: Record<string, string | null | undefined>,
) {
  Object.entries(metadata).forEach(([key, value]) => {
    if (!value) {
      return;
    }

    body.set(`metadata[${key}]`, value);
    body.set(`payment_intent_data[metadata][${key}]`, value);
  });
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return Response.json(
      { error: "Stripe is not configured." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const productId = readFormString(formData, "productId");
  const quantity = readQuantity(formData);

  if (!productId) {
    return Response.json({ error: "Missing product." }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("active", true)
    .single();

  if (!product || !product.price || product.price <= 0) {
    return Response.json(
      { error: "Product is not available for checkout." },
      { status: 404 },
    );
  }

  const pickupNote = product.pickup_note || defaultPickupNote;
  const amount = product.price * quantity;
  const { data: order, error: orderError } = await supabase
    .from("shop_orders")
    .insert({
      amount,
      currency: product.currency || "aud",
      pickup_note: pickupNote,
      pickup_status: "pending_event_pickup",
      product_id: product.id,
      product_name: product.name,
      quantity,
      status: "pending_payment",
    })
    .select("*")
    .single();

  if (orderError || !order) {
    return Response.json(
      { error: "Order could not be created." },
      { status: 500 },
    );
  }

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const body = new URLSearchParams({
    mode: "payment",
    client_reference_id: order.id,
    customer_creation: "always",
    success_url: `${siteUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/shop/cancelled?order=${order.id}`,
    "phone_number_collection[enabled]": "true",
    "line_items[0][price_data][currency]": product.currency || "aud",
    "line_items[0][price_data][unit_amount]": String(product.price),
    "line_items[0][price_data][product_data][name]": product.name,
    "line_items[0][price_data][product_data][description]": stripeDescription(
      product.description,
      pickupNote,
    ).slice(0, 900),
    "line_items[0][quantity]": String(quantity),
    "custom_text[submit][message]":
      "Member-only item. Pickup at the next PROS society event only. No postal delivery.",
    "custom_fields[0][key]": "pros_member_number",
    "custom_fields[0][label][type]": "custom",
    "custom_fields[0][label][custom]": "PROS member number (if applicable)",
    "custom_fields[0][type]": "text",
    "custom_fields[0][optional]": "true",
  });

  setMetadata(body, {
    order_id: order.id,
    payment_type: "shop",
    pickup: "event_only",
    product_id: product.id,
    product_name: product.name,
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const payload = (await response.json().catch(() => null)) as
    | { id?: string; url?: string; error?: { message?: string } }
    | null;

  if (!response.ok || !payload?.id || !payload.url) {
    await supabase
      .from("shop_orders")
      .update({ status: "failed" })
      .eq("id", order.id);

    return Response.json(
      {
        error:
          payload?.error?.message ??
          `Stripe checkout could not be created (${response.status}).`,
      },
      { status: 500 },
    );
  }

  await supabase
    .from("shop_orders")
    .update({ stripe_checkout_session_id: payload.id })
    .eq("id", order.id);

  return Response.redirect(payload.url, 303);
}
