import { activateMembershipPayment } from "@/lib/membership/workflow";
import { verifyStripeSignature } from "@/lib/payments/stripe";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { createSupabaseServiceClient as createClientType } from "@/lib/supabase/server";
import type { Database, PaymentStatus } from "@/types/database";

export const runtime = "nodejs";

type SupabaseServiceClient = ReturnType<typeof createClientType>;
type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type StripeMetadata = Record<string, string | undefined> | null | undefined;

type StripeCheckoutSession = {
  id: string;
  amount_total?: number | null;
  currency?: string | null;
  customer?: string | { id?: string } | null;
  customer_email?: string | null;
  metadata?: StripeMetadata;
  payment_status?: string | null;
  subscription?: string | { id?: string } | null;
};

type StripeInvoice = {
  id: string;
  amount_paid?: number | null;
  amount_due?: number | null;
  currency?: string | null;
  customer?: string | { id?: string } | null;
  metadata?: StripeMetadata;
  subscription?: string | { id?: string } | null;
  subscription_details?: {
    metadata?: StripeMetadata;
  } | null;
};

type StripeSubscription = {
  id: string;
  customer?: string | { id?: string } | null;
  metadata?: StripeMetadata;
};

type StripeEvent = {
  type: string;
  data: {
    object: StripeCheckoutSession | StripeInvoice | StripeSubscription;
  };
};

function stripeId(value: string | { id?: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null;
}

async function findMembershipRecords(
  supabase: SupabaseServiceClient,
  {
    applicationId,
    email,
    profileId,
    sessionId,
    subscriptionId,
  }: {
    applicationId?: string | null;
    email?: string | null;
    profileId?: string | null;
    sessionId?: string | null;
    subscriptionId?: string | null;
  },
) {
  let application: ApplicationRow | null = null;
  let profile: ProfileRow | null = null;

  if (applicationId) {
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .maybeSingle();
    application = data;
  }

  if (!application && sessionId) {
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();
    application = data;
  }

  if (profileId) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .maybeSingle();
    profile = data;
  }

  if (!profile && subscriptionId) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();
    profile = data;
  }

  if (!profile && application) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("linked_application_id", application.id)
      .maybeSingle();
    profile = data;
  }

  if (!profile && application) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", application.email)
      .maybeSingle();
    profile = data;
  }

  if (!application && profile?.linked_application_id) {
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("id", profile.linked_application_id)
      .maybeSingle();
    application = data;
  }

  if (!application && email) {
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    application = data;
  }

  return { application, profile };
}

async function updateMembershipPaymentStatus(
  supabase: SupabaseServiceClient,
  {
    application,
    profile,
    sessionId,
    status,
    subscriptionId,
  }: {
    application: ApplicationRow | null;
    profile: ProfileRow | null;
    sessionId?: string | null;
    status: PaymentStatus;
    subscriptionId?: string | null;
  },
) {
  if (sessionId) {
    await supabase
      .from("payments")
      .update({ status })
      .eq("stripe_checkout_session_id", sessionId);
  }

  if (subscriptionId) {
    await supabase
      .from("payments")
      .update({ status })
      .eq("stripe_subscription_id", subscriptionId);
  }

  if (application) {
    await supabase
      .from("applications")
      .update({ payment_status: status })
      .eq("id", application.id);
  }

  if (profile) {
    await supabase
      .from("profiles")
      .update({
        membership_status: status === "cancelled" ? "cancelled" : profile.membership_status,
        payment_status: status,
      })
      .eq("id", profile.id);
  }
}

async function handleCheckoutCompleted(
  supabase: SupabaseServiceClient,
  session: StripeCheckoutSession,
) {
  const metadata = session.metadata ?? {};
  const applicationId = metadata.application_id ?? null;
  const profileId = metadata.profile_id ?? null;
  const memberNumber = metadata.member_number ?? null;
  const { application, profile } = await findMembershipRecords(supabase, {
    applicationId,
    email: metadata.email ?? session.customer_email ?? null,
    profileId,
    sessionId: session.id,
    subscriptionId: stripeId(session.subscription),
  });

  if (!application || !profile) {
    console.error("Stripe checkout missing membership records", {
      applicationId,
      profileId,
      sessionId: session.id,
    });
    return;
  }

  if (
    session.payment_status &&
    !["paid", "no_payment_required"].includes(session.payment_status)
  ) {
    await updateMembershipPaymentStatus(supabase, {
      application,
      profile,
      sessionId: session.id,
      status: "pending_payment",
      subscriptionId: stripeId(session.subscription),
    });
    return;
  }

  await activateMembershipPayment(supabase, {
    amount: session.amount_total ?? null,
    application: memberNumber
      ? { ...application, member_number: application.member_number ?? memberNumber }
      : application,
    currency: session.currency ?? "aud",
    profile: memberNumber
      ? { ...profile, member_number: profile.member_number ?? memberNumber }
      : profile,
    stripeCheckoutSessionId: session.id,
    stripeCustomerId: stripeId(session.customer),
    stripeSubscriptionId: stripeId(session.subscription),
  });
}

async function handleInvoiceSucceeded(
  supabase: SupabaseServiceClient,
  invoice: StripeInvoice,
) {
  const metadata = {
    ...(invoice.subscription_details?.metadata ?? {}),
    ...(invoice.metadata ?? {}),
  };
  const subscriptionId = stripeId(invoice.subscription);
  const { application, profile } = await findMembershipRecords(supabase, {
    applicationId: metadata.application_id ?? null,
    email: metadata.email ?? null,
    profileId: metadata.profile_id ?? null,
    subscriptionId,
  });

  if (!profile) {
    return;
  }

  await supabase.from("payments").insert({
    application_id: application?.id ?? null,
    amount: invoice.amount_paid ?? invoice.amount_due ?? null,
    currency: invoice.currency ?? "aud",
    member_number: profile.member_number ?? application?.member_number ?? null,
    paid_at: new Date().toISOString(),
    payment_type: "membership_invoice",
    profile_id: profile.id,
    status: "paid",
    stripe_customer_id: stripeId(invoice.customer),
    stripe_subscription_id: subscriptionId,
  });

  await supabase
    .from("profiles")
    .update({
      membership_status: "active",
      payment_status: "paid",
      stripe_customer_id: stripeId(invoice.customer) ?? profile.stripe_customer_id,
      stripe_subscription_id: subscriptionId ?? profile.stripe_subscription_id,
    })
    .eq("id", profile.id);

  if (application) {
    await supabase
      .from("applications")
      .update({ payment_status: "paid" })
      .eq("id", application.id);
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!verifyStripeSignature(rawBody, signature)) {
    return Response.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as StripeEvent;
  const supabase = createSupabaseServiceClient();

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(
      supabase,
      event.data.object as StripeCheckoutSession,
    );
  }

  if (event.type === "invoice.payment_succeeded") {
    await handleInvoiceSucceeded(supabase, event.data.object as StripeInvoice);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as StripeInvoice;
    const metadata = {
      ...(invoice.subscription_details?.metadata ?? {}),
      ...(invoice.metadata ?? {}),
    };
    const { application, profile } = await findMembershipRecords(supabase, {
      applicationId: metadata.application_id ?? null,
      email: metadata.email ?? null,
      profileId: metadata.profile_id ?? null,
      subscriptionId: stripeId(invoice.subscription),
    });

    await updateMembershipPaymentStatus(supabase, {
      application,
      profile,
      status: "failed",
      subscriptionId: stripeId(invoice.subscription),
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as StripeSubscription;
    const { application, profile } = await findMembershipRecords(supabase, {
      profileId: subscription.metadata?.profile_id ?? null,
      subscriptionId: subscription.id,
    });

    await updateMembershipPaymentStatus(supabase, {
      application,
      profile,
      status: "cancelled",
      subscriptionId: subscription.id,
    });
  }

  return Response.json({ received: true });
}
