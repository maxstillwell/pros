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
  const body = new URLSearchParams({
    mode: process.env.STRIPE_MEMBERSHIP_MODE || "payment",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    customer_email: email,
    success_url: `${siteUrl}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/membership/cancelled`,
    "metadata[application_id]": applicationId,
    "metadata[profile_id]": profileId,
    "metadata[member_number]": memberNumber,
    "metadata[email]": email,
    "metadata[payment_type]": "membership",
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
