import { redirect } from "next/navigation";
import { applicationSchema } from "@/lib/validators/application";
import {
  sendAdminNewApplicationEmail,
  sendApplicationReceivedEmail,
} from "@/lib/email/application-emails";
import {
  createSupabaseServiceClient,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/server";

export type ApplicationFormValue = string | boolean | string[];

export type ApplicationFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Record<string, string[] | undefined>;
  values: Record<string, ApplicationFormValue>;
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

function readCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function readApplicationForm(formData: FormData) {
  return {
    full_name: readValue(formData, "full_name"),
    date_of_birth: readValue(formData, "date_of_birth"),
    residential_address: readValue(formData, "residential_address"),
    phone_number: readValue(formData, "phone_number"),
    email: readValue(formData, "email"),
    occupation: readValue(formData, "occupation"),
    firearms_licence_number: readValue(formData, "firearms_licence_number"),
    licence_category: readValue(formData, "licence_category"),
    licence_expiry_date: readValue(formData, "licence_expiry_date"),
    emergency_contact_name: readValue(formData, "emergency_contact_name"),
    emergency_contact_relationship: readValue(
      formData,
      "emergency_contact_relationship",
    ),
    emergency_contact_phone: readValue(formData, "emergency_contact_phone"),
    outdoor_interests: formData
      .getAll("outdoor_interests")
      .filter((value): value is string => typeof value === "string"),
    outdoor_interests_other: readValue(formData, "outdoor_interests_other"),
    agree_safe_conduct: readCheckbox(formData, "agree_safe_conduct"),
    agree_lawful_directions: readCheckbox(formData, "agree_lawful_directions"),
    agree_regulations: readCheckbox(formData, "agree_regulations"),
    agree_respect_environment: readCheckbox(
      formData,
      "agree_respect_environment",
    ),
    agree_no_reckless_behaviour: readCheckbox(
      formData,
      "agree_no_reckless_behaviour",
    ),
    agree_no_intoxication: readCheckbox(formData, "agree_no_intoxication"),
    agree_personal_responsibility: readCheckbox(
      formData,
      "agree_personal_responsibility",
    ),
    agree_rules_consequence: readCheckbox(formData, "agree_rules_consequence"),
    accept_liability_waiver: readCheckbox(formData, "accept_liability_waiver"),
    accept_privacy_consent: readCheckbox(formData, "accept_privacy_consent"),
    applicant_signature: readValue(formData, "applicant_signature"),
    application_date: readValue(formData, "application_date"),
  };
}

export async function submitApplication(
  _previousState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  "use server";

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
  const outdoorInterests = application.outdoor_interests.join(", ");

  const { data: savedApplication, error } = await supabase
    .from("applications")
    .insert({
      full_name: application.full_name,
      email: application.email,
      phone: application.phone_number,
      phone_number: application.phone_number,
      date_of_birth: application.date_of_birth,
      address: application.residential_address,
      residential_address: application.residential_address,
      occupation: application.occupation,
      firearms_licence_number: application.firearms_licence_number,
      licence_category: application.licence_category,
      licence_expiry_date: application.licence_expiry_date,
      emergency_contact_name: application.emergency_contact_name,
      emergency_contact_relationship: application.emergency_contact_relationship,
      emergency_contact_phone: application.emergency_contact_phone,
      outdoor_interests: outdoorInterests,
      outdoor_interests_other: application.outdoor_interests_other,
      firearms_licence_info: application.firearms_licence_number,
      agreement_accepted: true,
      agree_safe_conduct: application.agree_safe_conduct,
      agree_lawful_directions: application.agree_lawful_directions,
      agree_regulations: application.agree_regulations,
      agree_respect_environment: application.agree_respect_environment,
      agree_no_reckless_behaviour: application.agree_no_reckless_behaviour,
      agree_no_intoxication: application.agree_no_intoxication,
      agree_personal_responsibility: application.agree_personal_responsibility,
      agree_rules_consequence: application.agree_rules_consequence,
      waiver_accepted: application.accept_liability_waiver,
      accept_liability_waiver: application.accept_liability_waiver,
      privacy_accepted: application.accept_privacy_consent,
      accept_privacy_consent: application.accept_privacy_consent,
      typed_signature: application.applicant_signature,
      applicant_signature: application.applicant_signature,
      application_date: application.application_date,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return {
      status: "error",
      message:
        "The application could not be submitted. Please try again or contact the committee.",
      fieldErrors: {},
      values: rawValues,
    };
  }

  await Promise.all([
    sendApplicationReceivedEmail({
      applicationId: savedApplication.id,
      fullName: application.full_name,
      email: application.email,
    }),
    sendAdminNewApplicationEmail({
      applicationId: savedApplication.id,
      fullName: application.full_name,
      email: application.email,
      phone: application.phone_number,
    }),
  ]);

  return {
    status: "success",
    message:
      "Thank you. Your membership application has been submitted and will be reviewed by the committee.",
    fieldErrors: {},
    values: {},
  };
}

export async function submitApplicationSimple(formData: FormData) {
  "use server";

  const result = await submitApplication(initialApplicationFormState, formData);

  if (result.status === "success") {
    redirect("/apply?submitted=1");
  }

  redirect("/apply?error=1");
}
