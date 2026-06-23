"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/profile";
import { sendPaymentLinkResentEmail } from "@/lib/email/application-emails";
import {
  activateMembershipPayment,
  createApprovalCheckout,
  generateMemberNumber,
} from "@/lib/membership/workflow";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { addOneYearMelbourne } from "@/lib/time";
import type { ApplicationStatus, PaymentStatus } from "@/types/database";

const memberStatuses: ApplicationStatus[] = [
  "pending",
  "approved",
  "active",
  "expired",
  "cancelled",
  "rejected",
];
const paymentStatuses: PaymentStatus[] = [
  "not_required",
  "pending_payment",
  "paid",
  "failed",
  "refunded",
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

function readStatus(formData: FormData) {
  const status = readString(formData, "membership_status");
  return memberStatuses.includes(status as ApplicationStatus)
    ? (status as ApplicationStatus)
    : "pending";
}

function readPaymentStatus(formData: FormData) {
  const status = readString(formData, "payment_status");
  return paymentStatuses.includes(status as PaymentStatus)
    ? (status as PaymentStatus)
    : "not_required";
}

function readReturnTo(formData: FormData, fallback: string) {
  const value = readString(formData, "returnTo");

  if (!value || !value.startsWith("/admin") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

async function getMemberActionContext(formData: FormData) {
  const id = readString(formData, "id");

  if (!id) {
    redirect("/admin/members?error=missing-id");
  }

  const access = await getAdminAccess();

  if (access.status !== "ok") {
    redirect("/login?redirectTo=/admin/members");
  }

  return {
    id,
    returnTo: readReturnTo(formData, `/admin/members/${id}`),
    supabase: createSupabaseServiceClient(),
  };
}

async function getMemberAndApplicationContext(formData: FormData) {
  const { id, returnTo, supabase } = await getMemberActionContext(formData);
  const { data: member } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!member) {
    redirect(`${returnTo}?error=member-not-found`);
  }

  const { data: applicationByLink } = member.linked_application_id
    ? await supabase
        .from("applications")
        .select("*")
        .eq("id", member.linked_application_id)
        .maybeSingle()
    : { data: null };
  const { data: applicationByEmail } = applicationByLink
    ? { data: null }
    : await supabase
        .from("applications")
        .select("*")
        .eq("email", member.email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

  return {
    application: applicationByLink ?? applicationByEmail,
    member,
    returnTo,
    supabase,
  };
}

export async function updateMember(formData: FormData) {
  const { id, returnTo, supabase } = await getMemberActionContext(formData);
  const email = readString(formData, "email");

  if (!email) {
    redirect(`${returnTo}?error=member-email`);
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      email,
      full_name: readNullableString(formData, "full_name"),
      member_number: readNullableString(formData, "member_number"),
      phone: readNullableString(formData, "phone"),
      notes: readNullableString(formData, "notes"),
      membership_status: readStatus(formData),
      payment_status: readPaymentStatus(formData),
      membership_started_at: readNullableString(
        formData,
        "membership_started_at",
      ),
      membership_expires_at: readNullableString(
        formData,
        "membership_expires_at",
      ),
      stripe_customer_id: readNullableString(formData, "stripe_customer_id"),
      stripe_subscription_id: readNullableString(
        formData,
        "stripe_subscription_id",
      ),
    })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${id}`);

  if (error) {
    redirect(`${returnTo}?error=member-update`);
  }

  redirect(`${returnTo}?saved=member`);
}

async function markMemberStatus(
  formData: FormData,
  membershipStatus: Extract<
    ApplicationStatus,
    "active" | "expired" | "cancelled"
  >,
) {
  const { id, returnTo, supabase } = await getMemberActionContext(formData);
  const now = new Date().toISOString();
  const update: {
    membership_expires_at?: string;
    membership_started_at?: string;
    membership_status: ApplicationStatus;
    payment_status?: PaymentStatus;
  } = {
    membership_status: membershipStatus,
  };

  if (membershipStatus === "active") {
    update.membership_expires_at = addOneYearMelbourne(now);
    update.membership_started_at = now;
    update.payment_status = "paid";
  }

  if (membershipStatus === "cancelled") {
    update.payment_status = "cancelled";
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${id}`);

  if (error) {
    redirect(`${returnTo}?error=member-status`);
  }

  redirect(`${returnTo}?saved=${membershipStatus}`);
}

export async function markMemberActive(formData: FormData) {
  return markMemberStatus(formData, "active");
}

export async function markMemberExpired(formData: FormData) {
  return markMemberStatus(formData, "expired");
}

export async function markMemberCancelled(formData: FormData) {
  return markMemberStatus(formData, "cancelled");
}

export async function resendMemberPaymentEmail(formData: FormData) {
  const { application, member, returnTo, supabase } =
    await getMemberAndApplicationContext(formData);

  if (!application) {
    redirect(`${returnTo}?error=no-application`);
  }

  const memberNumber = member.member_number ?? application.member_number;
  const checkout = await createApprovalCheckout({
    application,
    memberNumber,
    profile: member,
  });

  await supabase
    .from("profiles")
    .update({
      member_number: memberNumber,
      membership_status: "approved",
      payment_status: "pending_payment",
    })
    .eq("id", member.id);

  await supabase
    .from("applications")
    .update({
      member_number: memberNumber,
      payment_status: "pending_payment",
      status: "approved",
      stripe_checkout_session_id: checkout?.id ?? application.stripe_checkout_session_id,
      stripe_payment_link: checkout?.url ?? application.stripe_payment_link,
    })
    .eq("id", application.id);

  if (checkout?.id) {
    await supabase.from("payments").upsert(
      {
        application_id: application.id,
        member_number: memberNumber,
        payment_type: "membership",
        profile_id: member.id,
        status: "pending_payment",
        stripe_checkout_session_id: checkout.id,
      },
      { onConflict: "stripe_checkout_session_id" },
    );
  }

  await sendPaymentLinkResentEmail({
    applicationId: application.id,
    email: member.email,
    fullName: member.full_name ?? application.full_name,
    paymentLink: checkout?.url ?? application.stripe_payment_link,
    profileId: member.id,
  });

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${member.id}`);
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${application.id}`);

  redirect(`${returnTo}?saved=payment-email`);
}

export async function markMemberManuallyPaid(formData: FormData) {
  const { application, member, returnTo, supabase } =
    await getMemberAndApplicationContext(formData);

  if (application) {
    await activateMembershipPayment(supabase, {
      application,
      manual: true,
      profile: member,
    });
  } else {
    const now = new Date().toISOString();
    const expiresAt = addOneYearMelbourne(now);
    const memberNumber = member.member_number ?? (await generateMemberNumber(supabase));

    await supabase.from("payments").insert({
      amount: null,
      currency: "aud",
      member_number: memberNumber,
      paid_at: now,
      payment_type: "membership_manual",
      profile_id: member.id,
      status: "paid",
    });
    await supabase
      .from("profiles")
      .update({
        member_number: memberNumber,
        membership_expires_at: expiresAt,
        membership_started_at: now,
        membership_status: "active",
        payment_status: "paid",
      })
      .eq("id", member.id);
  }

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${member.id}`);
  revalidatePath("/admin/applications");

  redirect(`${returnTo}?saved=manual-paid`);
}

export async function deleteMember(formData: FormData) {
  const { id, returnTo, supabase } = await getMemberActionContext(formData);
  const { data: member } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!member) {
    redirect(`${returnTo}?error=member-not-found`);
  }

  await supabase.from("payments").delete().eq("profile_id", id);
  const { error } = await supabase.from("profiles").delete().eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/members");
  revalidatePath("/admin/applications");
  revalidatePath("/admin/payments");

  if (error) {
    redirect(`${returnTo}?error=member-delete`);
  }

  redirect("/admin/members?saved=deleted");
}
