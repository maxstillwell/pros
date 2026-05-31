import { z } from "zod";

export const outdoorInterestOptions = [
  "Hunting",
  "Fishing",
  "Camping",
  "Hiking / Bushcraft",
  "Conservation Activities",
  "Sporting / Recreational Shooting",
  "Outdoor Education",
  "Other",
] as const;

export const acknowledgementAgreements = [
  {
    name: "agree_safe_conduct",
    label: "I agree to conduct myself safely, responsibly and respectfully at all times.",
  },
  {
    name: "agree_lawful_directions",
    label:
      "I agree to comply with all lawful directions given by the Society, landowners, activity coordinators and Range/Safety Officers.",
  },
  {
    name: "agree_regulations",
    label:
      "I agree to follow all applicable Victorian firearms, hunting, fishing and outdoor regulations.",
  },
  {
    name: "agree_respect_environment",
    label:
      "I agree to respect wildlife, private property, cultural heritage and the natural environment.",
  },
  {
    name: "agree_no_reckless_behaviour",
    label:
      "I agree not to engage in reckless, dangerous, aggressive or unlawful behaviour.",
  },
  {
    name: "agree_no_intoxication",
    label:
      "I agree not to attend activities while affected by alcohol or illegal substances.",
  },
  {
    name: "agree_personal_responsibility",
    label:
      "I accept personal responsibility for my own actions, equipment and conduct.",
  },
  {
    name: "agree_rules_consequence",
    label:
      "I understand that failure to comply with Society rules or unsafe conduct may result in suspension or termination of membership.",
  },
] as const;

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

const requiredDate = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .regex(/^\d{4}-\d{2}-\d{2}$/, `Enter a valid ${label.toLowerCase()}.`);

const requiredCheckbox = (label: string) =>
  z.boolean().refine((value) => value, `${label} must be accepted.`);

export const applicationSchema = z.object({
  full_name: requiredText("Full Name", 160),
  date_of_birth: requiredDate("Date of Birth"),
  residential_address: requiredText("Residential Address", 500),
  phone_number: requiredText("Phone Number", 80),
  email: z
    .string()
    .trim()
    .min(1, "Email Address is required.")
    .email("Enter a valid email address.")
    .max(254, "Email must be 254 characters or fewer."),
  occupation: optionalText(160),
  firearms_licence_number: optionalText(160),
  licence_category: optionalText(160),
  licence_expiry_date: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null))
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Enter a valid expiry date.",
    }),
  emergency_contact_name: requiredText("Emergency contact name", 160),
  emergency_contact_relationship: requiredText(
    "Emergency contact relationship",
    160,
  ),
  emergency_contact_phone: requiredText("Emergency contact phone number", 80),
  outdoor_interests: z
    .array(z.enum(outdoorInterestOptions))
    .min(1, "Select at least one outdoor interest."),
  outdoor_interests_other: optionalText(500),
  agree_safe_conduct: requiredCheckbox("Safe conduct agreement"),
  agree_lawful_directions: requiredCheckbox("Lawful directions agreement"),
  agree_regulations: requiredCheckbox("Regulations agreement"),
  agree_respect_environment: requiredCheckbox("Environment agreement"),
  agree_no_reckless_behaviour: requiredCheckbox("Reckless behaviour agreement"),
  agree_no_intoxication: requiredCheckbox("Intoxication agreement"),
  agree_personal_responsibility: requiredCheckbox(
    "Personal responsibility agreement",
  ),
  agree_rules_consequence: requiredCheckbox("Rules consequence agreement"),
  accept_liability_waiver: requiredCheckbox("The liability waiver"),
  accept_privacy_consent: requiredCheckbox("The privacy consent"),
  applicant_signature: requiredText("Applicant Signature / Typed Full Name", 160),
  application_date: requiredDate("Date"),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
