"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types/database";

const memberStatuses: ApplicationStatus[] = [
  "pending",
  "approved",
  "active",
  "expired",
  "cancelled",
  "rejected",
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

export async function updateMember(formData: FormData) {
  const { id, returnTo, supabase } = await getMemberActionContext(formData);

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: readNullableString(formData, "full_name"),
      phone: readNullableString(formData, "phone"),
      notes: readNullableString(formData, "notes"),
      membership_status: readStatus(formData),
      membership_started_at: readNullableString(
        formData,
        "membership_started_at",
      ),
      membership_expires_at: readNullableString(
        formData,
        "membership_expires_at",
      ),
      stripe_customer_id: readNullableString(formData, "stripe_customer_id"),
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
  const update = {
    membership_status: membershipStatus,
    membership_started_at:
      membershipStatus === "active" ? new Date().toISOString() : undefined,
  };

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
