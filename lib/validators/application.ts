import { z } from "zod";

const requiredText = (label: string, max = 500) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

const optionalText = (max = 1000) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .optional()
    .transform((value) => (value ? value : null));

const requiredCheckbox = (label: string) =>
  z.boolean().refine((value) => value, `${label} must be accepted.`);

export const applicationSchema = z.object({
  fullName: requiredText("Full name", 160),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address.")
    .max(254, "Email must be 254 characters or fewer."),
  phone: requiredText("Phone", 80),
  dateOfBirth: z
    .string()
    .trim()
    .min(1, "Date of birth is required.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date of birth."),
  address: requiredText("Address", 500),
  emergencyContactName: requiredText("Emergency contact name", 160),
  emergencyContactPhone: requiredText("Emergency contact phone", 80),
  outdoorInterests: requiredText("Outdoor interests", 1200),
  firearmsLicenceInfo: optionalText(500),
  referral: requiredText("Referral", 500),
  reasonForJoining: requiredText("Reason for joining", 1500),
  agreementAccepted: requiredCheckbox("The membership agreement"),
  privacyAccepted: requiredCheckbox("The privacy consent"),
  waiverAccepted: requiredCheckbox("The waiver acknowledgement"),
  typedSignature: requiredText("Typed signature", 160),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
