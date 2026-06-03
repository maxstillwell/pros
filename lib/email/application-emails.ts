import "server-only";

import { getSiteUrl } from "@/lib/supabase/env";
import { sendEmail } from "@/lib/email/resend";
import {
  generateApplicationPdf,
  getApplicationPdfFilename,
} from "@/lib/pdf/application-pdf";
import {
  formatMelbourneDate,
  formatMelbourneDateTime,
} from "@/lib/time";

type ApplicationEmailInput = {
  applicationId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  profileId?: string | null;
};

type ApplicationPdfEmailInput = ApplicationEmailInput & {
  application: Record<string, unknown> & {
    email: string;
    full_name: string;
  };
};

type PaymentEmailInput = ApplicationEmailInput & {
  memberNumber: string;
  paymentLink?: string | null;
};

type WelcomeEmailInput = ApplicationEmailInput & {
  memberNumber: string;
  membershipExpiresAt: string | null;
  membershipStartedAt: string | null;
};

export async function sendApplicationReceivedEmail({
  applicationId,
  application,
  fullName,
  email,
}: ApplicationPdfEmailInput) {
  let attachments:
    | Array<{
        content: string;
        filename: string;
      }>
    | undefined;

  try {
    attachments = [
      {
        content: generateApplicationPdf(application),
        filename: getApplicationPdfFilename(application),
      },
    ];
  } catch (error) {
    console.error("Application PDF generation failed", error);
  }

  await sendEmail({
    to: email,
    subject: "PROS Membership Application Received",
    emailType: "application_received",
    attachments,
    relatedApplicationId: applicationId,
    text: `Dear ${fullName},

Thank you for submitting your membership application to Prime Range Outdoor Society Inc.

Your application has been received and will be reviewed by the committee.

Your member reference number will be confirmed if your application is approved.

A PDF copy of your submitted application is attached for your records.

Please note:
- Submission of an application does not guarantee membership approval.
- The committee may contact you if additional information is required.
- If your application is approved, you will receive further instructions regarding the annual membership fee.

Regards,

Prime Range Outdoor Society Inc.`,
  });
}

export async function sendAdminNewApplicationEmail({
  applicationId,
  fullName,
  email,
  phone,
}: ApplicationEmailInput) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const submittedAt = formatMelbourneDateTime(new Date());

  await sendEmail({
    to: adminEmail,
    subject: "New PROS Membership Application",
    emailType: "admin_new_application",
    relatedApplicationId: applicationId,
    text: `A new membership application has been submitted.

Applicant: ${fullName}
Email: ${email}
Phone: ${phone ?? "Not provided"}
Submitted: ${submittedAt}

Review it here:
${getSiteUrl()}/admin/applications/${applicationId}`,
  });
}

export async function sendApplicationApprovedEmail({
  applicationId,
  fullName,
  email,
  memberNumber,
  paymentLink,
  profileId,
}: PaymentEmailInput) {
  await sendEmail({
    to: email,
    subject: "PROS Membership Approved - Payment Required",
    emailType: "application_approved_payment_required",
    relatedApplicationId: applicationId,
    relatedProfileId: profileId ?? null,
    text: `Dear ${fullName},

Your membership application has been approved by the committee.

Your member number is: ${memberNumber}

The next step is to complete your annual membership fee payment using the secure payment link below:

${paymentLink ?? "Payment link is not available yet. The committee will contact you with payment instructions."}

Your membership will become active once payment has been confirmed.

Regards,

Prime Range Outdoor Society Inc.`,
  });
}

export async function sendPaymentLinkResentEmail(input: PaymentEmailInput) {
  await sendEmail({
    to: input.email,
    subject: "PROS Membership Payment Link",
    emailType: "payment_link_resent",
    relatedApplicationId: input.applicationId,
    relatedProfileId: input.profileId ?? null,
    text: `Dear ${input.fullName},

Your PROS membership payment link is below.

Member number: ${input.memberNumber}

${input.paymentLink ?? "Payment link is not available yet. The committee will contact you with payment instructions."}

Regards,

Prime Range Outdoor Society Inc.`,
  });
}

export async function sendPaymentConfirmedWelcomeEmail({
  applicationId,
  email,
  fullName,
  memberNumber,
  membershipExpiresAt,
  membershipStartedAt,
  profileId,
}: WelcomeEmailInput) {
  await sendEmail({
    to: email,
    subject: "Welcome to PROS - Membership Active",
    emailType: "payment_confirmed_welcome",
    relatedApplicationId: applicationId,
    relatedProfileId: profileId ?? null,
    text: `Dear ${fullName},

Thank you. Your membership payment has been received.

Your PROS membership is now active.

Member number: ${memberNumber}
Membership status: Active
Membership start date: ${formatMelbourneDate(membershipStartedAt)}
Membership expiry date: ${formatMelbourneDate(membershipExpiresAt)}

Regards,

Prime Range Outdoor Society Inc.`,
  });
}

export async function sendApplicationRejectedEmail({
  applicationId,
  fullName,
  email,
  profileId,
}: ApplicationEmailInput) {
  await sendEmail({
    to: email,
    subject: "PROS Membership Application Update",
    emailType: "application_rejected",
    relatedApplicationId: applicationId,
    relatedProfileId: profileId ?? null,
    text: `Dear ${fullName},

Thank you for your interest in Prime Range Outdoor Society Inc.

After review, your membership application has not been approved at this time.

Regards,

Prime Range Outdoor Society Inc.`,
  });
}
