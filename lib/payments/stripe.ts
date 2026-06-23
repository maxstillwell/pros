import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { getSiteUrl } from "@/lib/supabase/env";

type CheckoutInput = {
  applicationId: string;
  email: string;
  memberNumber: string;
  profileId: string;
};

export type StripeCheckoutResult = {
  id: string;
  url: string | null;
};

export function getStripeMembershipConfigStatus() {
  const missingCheckout = [
    ["NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL],
    ["STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY],
    ["STRIPE_MEMBERSHIP_PRICE_ID", process.env.STRIPE_MEMBERSHIP_PRICE_ID],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
  const missingWebhook = [["STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET]]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  return {
    checkoutConfigured: missingCheckout.length === 0,
    missingCheckout,
    missingWebhook,
    mode: process.env.STRIPE_MEMBERSHIP_MODE || "payment",
    webhookConfigured: missingWebhook.length === 0,
  };
}

export async function createMembershipCheckoutSession({
  applicationId,
  email,
  memberNumber,
  profileId,
}: CheckoutInput): Promise<StripeCheckoutResult | null> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_MEMBERSHIP_PRICE_ID;

  if (!secretKey || !priceId) {
    return null;
  }

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const mode = process.env.STRIPE_MEMBERSHIP_MODE || "payment";
  const metadata = {
    application_id: applicationId,
    email,
    member_number: memberNumber,
    payment_type: "membership",
    profile_id: profileId,
  };
  const body = new URLSearchParams({
    mode,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    client_reference_id: `${applicationId}:${profileId}`,
    customer_email: email,
    success_url: `${siteUrl}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/membership/cancelled`,
  });

  Object.entries(metadata).forEach(([key, value]) => {
    body.set(`metadata[${key}]`, value);

    if (mode === "subscription") {
      body.set(`subscription_data[metadata][${key}]`, value);
    }

    if (mode === "payment") {
      body.set(`payment_intent_data[metadata][${key}]`, value);
    }
  });

  if (mode === "payment") {
    body.set("customer_creation", "always");
  }

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

  if (!response.ok || !payload?.id) {
    throw new Error(
      payload?.error?.message ?? `Stripe returned ${response.status}.`,
    );
  }

  return {
    id: payload.id,
    url: payload.url ?? null,
  };
}

export function verifyStripeSignature(rawBody: string, signature: string | null) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !signature) {
    return false;
  }

  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    }),
  );
  const timestamp = parts.t;
  const receivedSignature = parts.v1;

  if (!timestamp || !receivedSignature) {
    return false;
  }

  const expectedSignature = createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);

  return received.length === expected.length && timingSafeEqual(received, expected);
}
