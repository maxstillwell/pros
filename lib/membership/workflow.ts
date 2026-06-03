import "server-only";

import {
  sendPaymentConfirmedWelcomeEmail,
} from "@/lib/email/application-emails";
import { createMembershipCheckoutSession } from "@/lib/payments/stripe";
import { addOneYearMelbourne } from "@/lib/time";
import type { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { Database, PaymentStatus } from "@/types/database";

type SupabaseServiceClient = ReturnType<typeof createSupabaseServiceClient>;
type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type PaymentActivationInput = {
  amount?: number | null;
  application: ApplicationRow;
  currency?: string | null;
  manual?: boolean;
  profile: ProfileRow;
  stripeCheckoutSessionId?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
};

export async function generateMemberNumber(supabase: SupabaseServiceClient) {
  const { data, error } = await supabase.rpc("generate_member_number");

  if (error || !data) {
    throw new Error(error?.message ?? "Member number could not be generated.");
  }

  return data;
}

export async function createApprovalCheckout({
  application,
  memberNumber,
  profile,
}: {
  application: ApplicationRow;
  memberNumber: string;
  profile: ProfileRow;
}) {
  try {
    return await createMembershipCheckoutSession({
      applicationId: application.id,
      email: application.email,
      memberNumber,
      profileId: profile.id,
    });
  } catch (error) {
    console.error("Stripe checkout creation failed", error);
    return null;
  }
}

export async function activateMembershipPayment(
  supabase: SupabaseServiceClient,
  {
    amount = null,
    application,
    currency = "aud",
    manual = false,
    profile,
    stripeCheckoutSessionId = null,
    stripeCustomerId = null,
    stripeSubscriptionId = null,
  }: PaymentActivationInput,
) {
  const now = new Date().toISOString();
  const expiresAt = addOneYearMelbourne(now);
  const memberNumber =
    profile.member_number ?? application.member_number ?? (await generateMemberNumber(supabase));

  if (stripeCheckoutSessionId) {
    await supabase.from("payments").upsert(
      {
        application_id: application.id,
        amount,
        currency: currency ?? "aud",
        member_number: memberNumber,
        paid_at: now,
        payment_type: manual ? "membership_manual" : "membership",
        profile_id: profile.id,
        status: "paid",
        stripe_checkout_session_id: stripeCheckoutSessionId,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
      },
      { onConflict: "stripe_checkout_session_id" },
    );
  } else {
    await supabase.from("payments").insert({
      application_id: application.id,
      amount,
      currency: currency ?? "aud",
      member_number: memberNumber,
      paid_at: now,
      payment_type: manual ? "membership_manual" : "membership",
      profile_id: profile.id,
      status: "paid",
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
    });
  }

  await supabase
    .from("applications")
    .update({
      member_number: memberNumber,
      payment_status: "paid" satisfies PaymentStatus,
      stripe_checkout_session_id:
        stripeCheckoutSessionId ?? application.stripe_checkout_session_id,
    })
    .eq("id", application.id);

  await supabase
    .from("profiles")
    .update({
      member_number: memberNumber,
      membership_expires_at: expiresAt,
      membership_started_at: now,
      membership_status: "active",
      payment_status: "paid" satisfies PaymentStatus,
      stripe_customer_id: stripeCustomerId ?? profile.stripe_customer_id,
      stripe_subscription_id:
        stripeSubscriptionId ?? profile.stripe_subscription_id,
    })
    .eq("id", profile.id);

  await sendPaymentConfirmedWelcomeEmail({
    applicationId: application.id,
    email: application.email,
    fullName: application.full_name,
    memberNumber,
    membershipExpiresAt: expiresAt,
    membershipStartedAt: now,
    profileId: profile.id,
  });
}
