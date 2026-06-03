"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ContactTicketStatus } from "@/types/database";

const ticketStatuses: ContactTicketStatus[] = [
  "new",
  "in_progress",
  "resolved",
  "archived",
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
  const status = readString(formData, "status");
  return ticketStatuses.includes(status as ContactTicketStatus)
    ? (status as ContactTicketStatus)
    : "new";
}

async function getTicketActionContext(formData: FormData) {
  const id = readString(formData, "id");

  if (!id) {
    redirect("/admin/contact?error=missing-id");
  }

  const access = await getAdminAccess();

  if (access.status !== "ok") {
    redirect("/login?redirectTo=/admin/contact");
  }

  return {
    id,
    supabase: createSupabaseServiceClient(),
  };
}

export async function updateContactTicket(formData: FormData) {
  const { id, supabase } = await getTicketActionContext(formData);
  const { error } = await supabase
    .from("contact_tickets")
    .update({
      admin_notes: readNullableString(formData, "admin_notes"),
      status: readStatus(formData),
    })
    .eq("id", id);

  revalidatePath("/admin/contact");

  if (error) {
    redirect("/admin/contact?error=update");
  }

  redirect("/admin/contact?saved=1");
}

export async function deleteContactTicket(formData: FormData) {
  const { id, supabase } = await getTicketActionContext(formData);
  const { error } = await supabase.from("contact_tickets").delete().eq("id", id);

  revalidatePath("/admin/contact");

  if (error) {
    redirect("/admin/contact?error=delete");
  }

  redirect("/admin/contact?saved=deleted");
}
