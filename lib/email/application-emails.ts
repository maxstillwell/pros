import "server-only";

import { getSiteUrl } from "@/lib/supabase/env";
import { sendEmail } from "@/lib/email/resend";

type ApplicationEmailInput = {
  applicationId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  profileId?: string | null;
};

export async function sendApplicationReceivedEmail({
  applicationId,
  fullName,
  email,
}: ApplicationEmailInput) {
  await sendEmail({
    to: email,
    subject: "PROS Membership Application Received",
    emailType: "application_received",
    relatedApplicationId: applicationId,
    text: `Dear ${fullName},

Thank you for submitting your membership application to Prime Range Outdoor Society Inc.

Your application has been received and will be reviewed by the committee.

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

  await sendEmail({
    to: adminEmail,
    subject: "New PROS Membership Application",
    emailType: "admin_new_application",
    relatedApplicationId: applicationId,
    text: `A new membership application has been submitted.

Applicant: ${fullName}
Email: ${email}
Phone: ${phone ?? "Not provided"}

Review it here:
${getSiteUrl()}/admin/applications/${applicationId}`,
  });
}

export async function sendApplicationApprovedEmail({
  applicationId,
  fullName,
  email,
  profileId,
}: ApplicationEmailInput) {
  await sendEmail({
    to: email,
    subject: "PROS Membership Application Approved",
    emailType: "application_approved",
    relatedApplicationId: applicationId,
    relatedProfileId: profileId ?? null,
    text: `Dear ${fullName},

Your membership application has been approved by the committee.

The next step is to complete the annual membership fee payment.

Payment link will be provided separately.

Please follow the payment instructions provided by PROS.

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
