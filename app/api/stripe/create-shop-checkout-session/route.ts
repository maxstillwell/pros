import { defaultPickupNote } from "@/lib/shop";
import { getSiteUrl } from "@/lib/supabase/env";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readSelectedProductIds(formData: FormData) {
  return Array.from(
    new Set(
      formData
        .getAll("product_id")
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ).slice(0, 20);
}

function readQuantity(formData: FormData, productId: string) {
  const value = Number(readFormString(formData, `quantity_${productId}`) || "1");

  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(Math.max(Math.round(value), 1), 99);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function requiredCheckoutDetails(formData: FormData) {
  const customerName = readFormString(formData, "customer_name");
  const customerEmail = readFormString(formData, "customer_email").toLowerCase();
  const customerPhone = readFormString(formData, "customer_phone");
  const memberNumber = readFormString(formData, "member_number").toUpperCase();

  if (!customerName || !isValidEmail(customerEmail) || !customerPhone || !memberNumber) {
    return null;
  }

  return {
    customerEmail,
    customerName,
    customerPhone,
    memberNumber,
  };
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

function metadataValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value).slice(0, 500);
}

function setMetadata(
  body: URLSearchParams,
  metadata: Record<string, string | number | null | undefined>,
) {
  Object.entries(metadata).forEach(([key, value]) => {
    const safeValue = metadataValue(value);

    if (!safeValue) {
      return;
    }

    body.set(`metadata[${key}]`, safeValue);
    body.set(`payment_intent_data[metadata][${key}]`, safeValue);
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
  const productIds = readSelectedProductIds(formData);
  const checkoutDetails = requiredCheckoutDetails(formData);

  if (!productIds.length) {
    return Response.json(
      { error: "Select at least one product." },
      { status: 400 },
    );
  }

  if (!checkoutDetails) {
    return Response.json(
      { error: "Name, email, phone and member number are required." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServiceClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds)
    .eq("active", true);
  const productsById = new Map((products ?? []).map((product) => [product.id, product]));
  const selectedProducts = productIds.flatMap((id) => {
    const product = productsById.get(id);
    return product && product.price && product.price > 0 ? [product] : [];
  });

  if (!selectedProducts.length) {
    return Response.json(
      { error: "Selected products are not available for checkout." },
      { status: 404 },
    );
  }

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const body = new URLSearchParams({
    mode: "payment",
    customer_creation: "always",
    customer_email: checkoutDetails.customerEmail,
    success_url: `${siteUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/shop/cancelled`,
    "phone_number_collection[enabled]": "false",
    "custom_text[submit][message]":
      "Member-only item. Pickup at the next PROS society event only. No postal delivery.",
  });

  selectedProducts.forEach((product, index) => {
    const pickupNote = product.pickup_note || defaultPickupNote;
    const quantity = readQuantity(formData, product.id);

    body.set(
      `line_items[${index}][price_data][currency]`,
      product.currency || "aud",
    );
    body.set(`line_items[${index}][price_data][unit_amount]`, String(product.price));
    body.set(`line_items[${index}][price_data][product_data][name]`, product.name);
    body.set(
      `line_items[${index}][price_data][product_data][description]`,
      stripeDescription(product.description, pickupNote).slice(0, 900),
    );
    body.set(
      `line_items[${index}][price_data][product_data][metadata][product_id]`,
      product.id,
    );
    body.set(
      `line_items[${index}][price_data][product_data][metadata][pickup_note]`,
      pickupNote.slice(0, 500),
    );
    body.set(`line_items[${index}][quantity]`, String(quantity));
  });

  setMetadata(body, {
    customer_email: checkoutDetails.customerEmail,
    customer_name: checkoutDetails.customerName,
    customer_phone: checkoutDetails.customerPhone,
    member_number: checkoutDetails.memberNumber,
    payment_type: "shop",
    pickup: "event_only",
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
    return Response.json(
      {
        error:
          payload?.error?.message ??
          `Stripe checkout could not be created (${response.status}).`,
      },
      { status: 500 },
    );
  }

  return Response.redirect(payload.url, 303);
}
