"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  initialApplicationFormState,
  submitApplication,
  type ApplicationFormState,
} from "@/app/apply/actions";

type FieldName = keyof ApplicationFormState["fieldErrors"];

type TextFieldProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "date";
  required?: boolean;
  state: ApplicationFormState;
};

type TextAreaProps = {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
  state: ApplicationFormState;
};

function getValue(state: ApplicationFormState, name: string) {
  const value = state.values?.[name];
  return typeof value === "string" ? value : "";
}

function FieldError({
  state,
  name,
}: {
  state: ApplicationFormState;
  name: string;
}) {
  const errors = state.fieldErrors?.[name as FieldName];

  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-sm font-medium text-red-700">{errors[0]}</p>;
}

function TextField({
  label,
  name,
  type = "text",
  required = true,
  state,
}: TextFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-forest-900">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={getValue(state, name)}
        className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 bg-white px-3 py-2 text-forest-900 outline-none transition focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
      />
      <FieldError state={state} name={name} />
    </label>
  );
}

function TextArea({
  label,
  name,
  required = true,
  rows = 4,
  state,
}: TextAreaProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-forest-900">{label}</span>
      <textarea
        name={name}
        required={required}
        rows={rows}
        defaultValue={getValue(state, name)}
        className="mt-2 w-full rounded-md border border-forest-900/20 bg-white px-3 py-2 text-forest-900 outline-none transition focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
      />
      <FieldError state={state} name={name} />
    </label>
  );
}

function CheckboxField({
  label,
  name,
  state,
}: {
  label: string;
  name: string;
  state: ApplicationFormState;
}) {
  return (
    <label className="flex gap-3 rounded-md border border-forest-900/10 bg-forest-50 p-4">
      <input
        name={name}
        type="checkbox"
        defaultChecked={state.values?.[name] === true}
        className="mt-1 size-4 rounded border-forest-900/30 text-forest-700"
      />
      <span>
        <span className="block text-sm font-semibold text-forest-900">
          {label}
        </span>
        <FieldError state={state} name={name} />
      </span>
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900 disabled:cursor-not-allowed disabled:bg-forest-500"
    >
      {pending ? "Submitting..." : "Submit application"}
    </button>
  );
}

export function ApplicationForm() {
  const [state, formAction] = useActionState(
    submitApplication,
    initialApplicationFormState,
  );
  const currentState: ApplicationFormState = {
    ...initialApplicationFormState,
    ...state,
    fieldErrors: state.fieldErrors ?? {},
    values: state.values ?? {},
  };

  if (currentState.status === "success") {
    return (
      <div className="rounded-md border border-forest-700/20 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase text-clay">
          Application submitted
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-forest-900">
          Thank you for applying.
        </h1>
        <p className="mt-4 text-base leading-7 text-forest-900/72">
          {currentState.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-md bg-white p-6 shadow-sm">
      <div className="border-b border-forest-900/10 pb-6">
        <p className="text-sm font-semibold uppercase text-clay">
          Membership application
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-forest-900">
          Apply for PROS membership.
        </h1>
        <p className="mt-4 text-sm leading-6 text-forest-900/70">
          The committee reviews each application before payment or member access
          is activated.
        </p>
      </div>

      {currentState.status === "error" ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {currentState.message}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <TextField label="Full name" name="fullName" state={currentState} />
        <TextField label="Email" name="email" type="email" state={currentState} />
        <TextField label="Phone" name="phone" type="tel" state={currentState} />
        <TextField
          label="Date of birth"
          name="dateOfBirth"
          type="date"
          state={currentState}
        />
        <div className="md:col-span-2">
          <TextArea
            label="Address"
            name="address"
            rows={3}
            state={currentState}
          />
        </div>
        <TextField
          label="Emergency contact name"
          name="emergencyContactName"
          state={currentState}
        />
        <TextField
          label="Emergency contact phone"
          name="emergencyContactPhone"
          type="tel"
          state={currentState}
        />
        <div className="md:col-span-2">
          <TextArea
            label="Outdoor interests"
            name="outdoorInterests"
            rows={4}
            state={currentState}
          />
        </div>
        <div className="md:col-span-2">
          <TextArea
            label="Firearms licence information, optional"
            name="firearmsLicenceInfo"
            required={false}
            rows={3}
            state={currentState}
          />
        </div>
        <div className="md:col-span-2">
          <TextArea
            label="Referral or how you heard about PROS"
            name="referral"
            rows={3}
            state={currentState}
          />
        </div>
        <div className="md:col-span-2">
          <TextArea
            label="Reason for joining"
            name="reasonForJoining"
            rows={5}
            state={currentState}
          />
        </div>
        <TextField
          label="Typed signature"
          name="typedSignature"
          state={currentState}
        />
      </div>

      <div className="mt-8 grid gap-3">
        <CheckboxField
          label="I agree to follow club rules and committee requirements."
          name="agreementAccepted"
          state={currentState}
        />
        <CheckboxField
          label="I consent to PROS storing and using my information for membership administration."
          name="privacyAccepted"
          state={currentState}
        />
        <CheckboxField
          label="I acknowledge the club waiver and outdoor activity risks."
          name="waiverAccepted"
          state={currentState}
        />
      </div>

      <div className="mt-8">
        <SubmitButton />
      </div>
    </form>
  );
}
