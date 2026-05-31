"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

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
  const { id, notes, supabase } = await getApplicationActionContext(formData);

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

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      email: application.email,
      full_name: application.full_name,
      phone: application.phone,
      membership_status: membershipStatus,
    },
    { onConflict: "email" },
  );

  if (profileError) {
    redirect(`/admin/applications/${id}?error=profile`);
  }

  const { error: updateError } = await supabase
    .from("applications")
    .update({
      status: "approved",
      admin_notes: notes,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);

  if (updateError) {
    redirect(`/admin/applications/${id}?error=approve`);
  }

  redirect(`/admin/applications/${id}?saved=approved`);
}

export async function rejectApplication(formData: FormData) {
  const { id, notes, supabase } = await getApplicationActionContext(formData);

  const { error } = await supabase
    .from("applications")
    .update({
      status: "rejected",
      admin_notes: notes,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);

  if (error) {
    redirect(`/admin/applications/${id}?error=reject`);
  }

  redirect(`/admin/applications/${id}?saved=rejected`);
}
