"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/profile";
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendPaymentLinkResentEmail,
} from "@/lib/email/application-emails";
import {
  activateMembershipPayment,
  createApprovalCheckout,
  generateMemberNumber,
} from "@/lib/membership/workflow";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types/database";

function readId(formData: FormData) {
  const id = formData.get("id");
  return typeof id === "string" ? id : "";
}

function readNotes(formData: FormData) {
  const notes = formData.get("adminNotes");
  return typeof notes === "string" && notes.trim() ? notes.trim() : null;
}

async function getApplicationActionContext(formData: FormData) {
  const id = readId(formData);

  if (!id) {
    redirect("/admin/applications?error=missing-id");
  }

  const access = await getAdminAccess();

  if (access.status !== "ok") {
    redirect(`/admin/applications/${id}?error=not-authorized`);
  }

  return {
    id,
    notes: readNotes(formData),
    adminProfile: access.profile,
    supabase: createSupabaseServiceClient(),
  };
}

export async function saveApplicationNotes(formData: FormData) {
  const { id, notes, supabase } = await getApplicationActionContext(formData);

  const { error } = await supabase
    .from("applications")
    .update({ admin_notes: notes })
    .eq("id", id);

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);

  if (error) {
    redirect(`/admin/applications/${id}?error=notes`);
  }

  redirect(`/admin/applications/${id}?saved=notes`);
}

export async function approveApplication(formData: FormData) {
  const { id, notes, adminProfile, supabase } =
    await getApplicationActionContext(formData);

  const { data: application, error: readError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (readError || !application) {
    redirect(`/admin/applications/${id}?error=not-found`);
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", application.email)
    .maybeSingle();
  const memberNumber =
    existingProfile?.member_number ?? (await generateMemberNumber(supabase));

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
    redirect(`/admin/applications/${id}?error=profile`);
  }

  const profile = profileWrite.data;
  const checkout = await createApprovalCheckout({
    application,
    memberNumber,
    profile,
  });

  if (checkout?.id) {
    await supabase.from("payments").upsert(
      {
        application_id: application.id,
        member_number: memberNumber,
        payment_type: "membership",
        profile_id: profile.id,
        status: "pending_payment",
        stripe_checkout_session_id: checkout.id,
      },
      { onConflict: "stripe_checkout_session_id" },
    );
  }

  const { error: updateError } = await supabase
    .from("applications")
    .update({
      admin_notes: notes,
      member_number: memberNumber,
      payment_status: "pending_payment",
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminProfile.id || null,
      status: "approved",
      stripe_checkout_session_id: checkout?.id ?? null,
      stripe_payment_link: checkout?.url ?? null,
    })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);

  if (updateError) {
    redirect(`/admin/applications/${id}?error=approve`);
  }

  await sendApplicationApprovedEmail({
    applicationId: application.id,
    email: application.email,
    fullName: application.full_name,
    memberNumber,
    paymentLink: checkout?.url ?? null,
    profileId: profile.id,
  });

  redirect(`/admin/applications/${id}?saved=approved`);
}

async function getApprovedPaymentContext(formData: FormData) {
  const { id, supabase } = await getApplicationActionContext(formData);
  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (!application) {
    redirect(`/admin/applications/${id}?error=not-found`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("linked_application_id", application.id)
    .maybeSingle();
  const resolvedProfile =
    profile ??
    (
      await supabase
        .from("profiles")
        .select("*")
        .eq("email", application.email)
        .maybeSingle()
    ).data;

  if (!resolvedProfile) {
    redirect(`/admin/applications/${id}?error=profile`);
  }

  return {
    application,
    profile: resolvedProfile,
    supabase,
  };
}

export async function resendPaymentEmail(formData: FormData) {
  const { application, profile, supabase } =
    await getApprovedPaymentContext(formData);
  const memberNumber =
    profile.member_number ??
    application.member_number ??
    (await generateMemberNumber(supabase));
  let paymentLink = application.stripe_payment_link;
  let checkoutSessionId = application.stripe_checkout_session_id;

  if (!paymentLink) {
    const checkout = await createApprovalCheckout({
      application,
      memberNumber,
      profile,
    });

    paymentLink = checkout?.url ?? null;
    checkoutSessionId = checkout?.id ?? null;

    await supabase
      .from("applications")
      .update({
        member_number: memberNumber,
        payment_status: "pending_payment",
        stripe_checkout_session_id: checkoutSessionId,
        stripe_payment_link: paymentLink,
      })
      .eq("id", application.id);

    if (checkoutSessionId) {
      await supabase.from("payments").upsert(
        {
          application_id: application.id,
          member_number: memberNumber,
          payment_type: "membership",
          profile_id: profile.id,
          status: "pending_payment",
          stripe_checkout_session_id: checkoutSessionId,
        },
        { onConflict: "stripe_checkout_session_id" },
      );
    }
  }

  await supabase
    .from("profiles")
    .update({
      member_number: memberNumber,
      membership_status: "approved",
      payment_status: "pending_payment",
    })
    .eq("id", profile.id);

  await sendPaymentLinkResentEmail({
    applicationId: application.id,
    email: application.email,
    fullName: application.full_name,
    memberNumber,
    paymentLink,
    profileId: profile.id,
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${application.id}`);
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${profile.id}`);

  redirect(`/admin/applications/${application.id}?saved=payment-email`);
}

export async function markApplicationManuallyPaid(formData: FormData) {
  const { application, profile, supabase } =
    await getApprovedPaymentContext(formData);

  await activateMembershipPayment(supabase, {
    application,
    manual: true,
    profile,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${application.id}`);
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${profile.id}`);

  redirect(`/admin/applications/${application.id}?saved=manual-paid`);
}

export async function deleteApplication(formData: FormData) {
  const { id, supabase } = await getApplicationActionContext(formData);

  await supabase
    .from("profiles")
    .update({ linked_application_id: null })
    .eq("linked_application_id", id);
  await supabase.from("payments").delete().eq("application_id", id);

  const { error } = await supabase.from("applications").delete().eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath("/admin/members");
  revalidatePath("/admin/payments");

  if (error) {
    redirect(`/admin/applications/${id}?error=delete`);
  }

  redirect("/admin/applications?saved=deleted");
}

export async function rejectApplication(formData: FormData) {
  const { id, notes, adminProfile, supabase } =
    await getApplicationActionContext(formData);

  const { data: application, error: readError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (readError || !application) {
    redirect(`/admin/applications/${id}?error=not-found`);
  }

  const { data: matchingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", application.email)
    .maybeSingle();

  const { error } = await supabase
    .from("applications")
    .update({
      status: "rejected",
      admin_notes: notes,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminProfile.id || null,
    })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);

  if (error) {
    redirect(`/admin/applications/${id}?error=reject`);
  }

  if (matchingProfile?.id) {
    await supabase
      .from("profiles")
      .update({ membership_status: "rejected" })
      .eq("id", matchingProfile.id);
  }

  await sendApplicationRejectedEmail({
    applicationId: application.id,
    fullName: application.full_name,
    email: application.email,
    profileId: matchingProfile?.id ?? null,
  });

  redirect(`/admin/applications/${id}?saved=rejected`);
}

export async function setApplicationStatus(
  formData: FormData,
  status: Extract<ApplicationStatus, "approved" | "rejected">,
) {
  if (status === "approved") {
    return approveApplication(formData);
  }

  return rejectApplication(formData);
}
