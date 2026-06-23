import "server-only";

import { sendEmail } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/supabase/env";
import { formatMelbourneDateTime } from "@/lib/time";

type ContactTicketEmailInput = {
  email: string;
  message: string;
  name: string;
  phone: string | null;
  sourcePath: string;
  subject: string;
  ticketId: string;
  topic: string;
};

export async function sendAdminContactTicketEmail({
  email,
  message,
  name,
  phone,
  sourcePath,
  subject,
  ticketId,
  topic,
}: ContactTicketEmailInput) {
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    replyTo: email,
    subject: `New PROS contact ticket - ${subject}`,
    emailType: "admin_contact_ticket",
    text: `A new contact ticket has been submitted through the PROS website.

Name: ${name}
Email: ${email}
Phone: ${phone ?? "Not provided"}
Topic: ${topic}
Source: ${sourcePath}
Ticket ID: ${ticketId}
Submitted: ${formatMelbourneDateTime(new Date())}

Subject:
${subject}

Message:
${message}

Review it here:
${getSiteUrl()}/admin/contact

You can reply directly to this email. Replies should go to the sender's email address.`,
  });
}
