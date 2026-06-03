import "server-only";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { Database, EmailType } from "@/types/database";

type EmailLogInsert = Database["public"]["Tables"]["email_logs"]["Insert"];

type SendEmailInput = {
  to: string | null | undefined;
  subject: string;
  text: string;
  emailType: EmailType;
  attachments?: Array<{
    content: string;
    filename: string;
  }>;
  relatedApplicationId?: string | null;
  relatedProfileId?: string | null;
};

async function logEmail(input: EmailLogInsert) {
  try {
    const supabase = createSupabaseServiceClient();
    await supabase.from("email_logs").insert({
      ...input,
      sent_at: input.sent_at ?? new Date().toISOString(),
    });
  } catch (error) {
    console.error("Email log failed", error);
  }
}

export async function sendEmail(input: SendEmailInput) {
  const to = input.to?.trim();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const baseLog = {
    recipient_email: to ?? null,
    audience: to ?? null,
    recipient_count: to ? 1 : 0,
    subject: input.subject,
    email_type: input.emailType,
    related_application_id: input.relatedApplicationId ?? null,
    related_profile_id: input.relatedProfileId ?? null,
  } satisfies EmailLogInsert;

  if (!to) {
    await logEmail({
      ...baseLog,
      status: "skipped",
      error_message: "Missing recipient email.",
    });
    return;
  }

  if (!apiKey || !from) {
    await logEmail({
      ...baseLog,
      status: "skipped",
      error_message: "Resend is not configured.",
    });
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: input.subject,
        text: input.text,
        attachments: input.attachments?.length ? input.attachments : undefined,
      }),
    });

    const responseBody = (await response.json().catch(() => null)) as
      | { id?: string; message?: string; error?: string }
      | null;

    if (!response.ok) {
      const errorMessage =
        responseBody?.message ??
        responseBody?.error ??
        `Resend returned ${response.status}.`;
      console.error("Resend email failed", errorMessage);
      await logEmail({
        ...baseLog,
        status: "failed",
        error_message: errorMessage,
      });
      return;
    }

    await logEmail({
      ...baseLog,
      status: "sent",
      provider_message_id: responseBody?.id ?? null,
      error_message: null,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown email failure.";
    console.error("Resend email failed", error);
    await logEmail({
      ...baseLog,
      status: "failed",
      error_message: errorMessage,
    });
  }
}
