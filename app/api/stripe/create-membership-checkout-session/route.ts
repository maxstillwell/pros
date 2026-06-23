import { getAdminAccess } from "@/lib/auth/profile";
import {
  createApprovalCheckout,
} from "@/lib/membership/workflow";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return Response.json({ error: "Not authorised." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { applicationId?: string }
    | null;
  const applicationId = body?.applicationId;

  if (!applicationId) {
    return Response.json({ error: "Missing applicationId." }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .single();

  if (!application) {
    return Response.json({ error: "Application not found." }, { status: 404 });
  }

  const { data: profileByApplication } = await supabase
    .from("profiles")
    .select("*")
    .eq("linked_application_id", application.id)
    .maybeSingle();
  const { data: profileByEmail } = profileByApplication
    ? { data: null }
    : await supabase
        .from("profiles")
        .select("*")
        .eq("email", application.email)
        .maybeSingle();
  const existingProfile = profileByApplication ?? profileByEmail;
  const memberNumber =
    existingProfile?.member_number ??
    application.member_number;

  const profileWrite = existingProfile
    ? await supabase
        .from("profiles")
        .update({
          full_name: application.full_name,
          linked_application_id: application.id,
          member_number: memberNumber,
          membership_status: "approved",
          payment_status: "pending_payment",
          phone: application.phone_number ?? application.phone,
        })
        .eq("id", existingProfile.id)
        .select("*")
        .single()
    : await supabase
        .from("profiles")
        .insert({
          email: application.email,
          full_name: application.full_name,
          linked_application_id: application.id,
          member_number: memberNumber,
          membership_status: "approved",
          payment_status: "pending_payment",
          phone: application.phone_number ?? application.phone,
        })
        .select("*")
        .single();

  if (profileWrite.error || !profileWrite.data) {
    return Response.json(
      { error: "Profile could not be created or updated." },
      { status: 500 },
    );
  }

  const checkout = await createApprovalCheckout({
    application,
    memberNumber,
    profile: profileWrite.data,
  });

  await supabase
    .from("applications")
    .update({
      member_number: memberNumber,
      payment_status: "pending_payment",
      reviewed_at: new Date().toISOString(),
      reviewed_by: access.profile.id || null,
      status: "approved",
      stripe_checkout_session_id: checkout?.id ?? null,
      stripe_payment_link: checkout?.url ?? null,
    })
    .eq("id", application.id);

  if (checkout?.id) {
    await supabase.from("payments").upsert(
      {
        application_id: application.id,
        member_number: memberNumber,
        payment_type: "membership",
        profile_id: profileWrite.data.id,
        status: "pending_payment",
        stripe_checkout_session_id: checkout.id,
      },
      { onConflict: "stripe_checkout_session_id" },
    );
  }

  return Response.json({
    checkoutSessionId: checkout?.id ?? null,
    checkoutUrl: checkout?.url ?? null,
    memberNumber,
    profileId: profileWrite.data.id,
  });
}
