"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/profile";
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
} from "@/lib/email/application-emails";
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
    .select("membership_status")
    .eq("email", application.email)
    .maybeSingle();

  const membershipStatus =
    existingProfile?.membership_status === "active" ? "active" : "approved";

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        email: application.email,
        full_name: application.full_name,
        phone: application.phone_number ?? application.phone,
        membership_status: membershipStatus,
        linked_application_id: application.id,
      },
      { onConflict: "email" },
    )
    .select("id")
    .single();

  if (profileError) {
    redirect(`/admin/applications/${id}?error=profile`);
  }

  const { error: updateError } = await supabase
    .from("applications")
    .update({
      status: "approved",
      admin_notes: notes,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminProfile.id || null,
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
    fullName: application.full_name,
    email: application.email,
    profileId: profile.id,
  });

  redirect(`/admin/applications/${id}?saved=approved`);
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
