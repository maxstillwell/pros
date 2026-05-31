"use server";

import { applicationSchema } from "@/lib/validators/application";
import {
  createSupabaseServiceClient,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/server";

export type ApplicationFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Record<string, string[] | undefined>;
  values: Record<string, string | boolean>;
};

export const initialApplicationFormState: ApplicationFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  values: {},
};

function readValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readApplicationForm(formData: FormData) {
  return {
    fullName: readValue(formData, "fullName"),
    email: readValue(formData, "email"),
    phone: readValue(formData, "phone"),
    dateOfBirth: readValue(formData, "dateOfBirth"),
    address: readValue(formData, "address"),
    emergencyContactName: readValue(formData, "emergencyContactName"),
    emergencyContactPhone: readValue(formData, "emergencyContactPhone"),
    outdoorInterests: readValue(formData, "outdoorInterests"),
    firearmsLicenceInfo: readValue(formData, "firearmsLicenceInfo"),
    referral: readValue(formData, "referral"),
    reasonForJoining: readValue(formData, "reasonForJoining"),
    agreementAccepted: formData.get("agreementAccepted") === "on",
    privacyAccepted: formData.get("privacyAccepted") === "on",
    waiverAccepted: formData.get("waiverAccepted") === "on",
    typedSignature: readValue(formData, "typedSignature"),
  };
}

export async function submitApplication(
  _previousState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const rawValues = readApplicationForm(formData);
  const parsed = applicationSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: rawValues,
    };
  }

  if (!hasSupabaseServiceConfig()) {
    return {
      status: "error",
      message:
        "Supabase is not configured yet. Add the environment variables before accepting applications.",
      fieldErrors: {},
      values: rawValues,
    };
  }

  const supabase = createSupabaseServiceClient();
  const application = parsed.data;

  const { error } = await supabase.from("applications").insert({
    full_name: application.fullName,
    email: application.email,
    phone: application.phone,
    date_of_birth: application.dateOfBirth,
    address: application.address,
    emergency_contact_name: application.emergencyContactName,
    emergency_contact_phone: application.emergencyContactPhone,
    outdoor_interests: application.outdoorInterests,
    firearms_licence_info: application.firearmsLicenceInfo,
    referral: application.referral,
    reason_for_joining: application.reasonForJoining,
    agreement_accepted: application.agreementAccepted,
    privacy_accepted: application.privacyAccepted,
    waiver_accepted: application.waiverAccepted,
    typed_signature: application.typedSignature,
    status: "pending",
  });

  if (error) {
    return {
      status: "error",
      message:
        "The application could not be submitted. Please try again or contact the committee.",
      fieldErrors: {},
      values: rawValues,
    };
  }

  return {
    status: "success",
    message:
      "Your application has been submitted. The committee will review it before any membership payment is requested.",
    fieldErrors: {},
    values: {},
  };
}
