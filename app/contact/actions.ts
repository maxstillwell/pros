"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSupabaseServiceClient,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/server";

const allowedTopics = [
  "general",
  "membership",
  "sponsorship",
  "events",
  "website",
] as const;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readTopic(formData: FormData) {
  const topic = readString(formData, "topic");
  return allowedTopics.includes(topic as (typeof allowedTopics)[number])
    ? topic
    : "general";
}

function safeReturnTopic(topic: string) {
  return allowedTopics.includes(topic as (typeof allowedTopics)[number])
    ? topic
    : "general";
}

export async function submitContactTicket(formData: FormData) {
  const topic = readTopic(formData);
  const name = readString(formData, "name");
  const email = readString(formData, "email");
  const subject = readString(formData, "subject");
  const message = readString(formData, "message");
  const phone = readString(formData, "phone") || null;
  const sourcePath = readString(formData, "source_path") || "/contact";
  const returnTopic = safeReturnTopic(topic);

  if (!name || !email.includes("@") || !subject || !message) {
    redirect(`/contact?topic=${returnTopic}&error=1`);
  }

  if (!hasSupabaseServiceConfig()) {
    redirect(`/contact?topic=${returnTopic}&error=config`);
  }

  const { error } = await createSupabaseServiceClient()
    .from("contact_tickets")
    .insert({
      email,
      message,
      name,
      phone,
      source_path: sourcePath,
      subject,
      topic,
    });

  revalidatePath("/admin/contact");

  if (error) {
    redirect(`/contact?topic=${returnTopic}&error=1`);
  }

  redirect(`/contact?topic=${returnTopic}&submitted=1`);
}
