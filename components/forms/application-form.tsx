import {
  initialApplicationFormState,
  submitApplicationSimple,
  type ApplicationFormState,
} from "@/app/apply/actions";
import {
  acknowledgementAgreements,
  outdoorInterestOptions,
} from "@/lib/validators/application";

type FieldName = keyof ApplicationFormState["fieldErrors"];

type TextFieldProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "date";
  required?: boolean;
  state: ApplicationFormState;
  defaultValue?: string;
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function todayDate() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function getStringValue(
  state: ApplicationFormState,
  name: string,
  fallback = "",
) {
  const value = state.values?.[name];
  return typeof value === "string" ? value : fallback;
}

function isChecked(state: ApplicationFormState, name: string) {
  return state.values?.[name] === true;
}

function isInterestChecked(state: ApplicationFormState, value: string) {
  const interests = state.values?.outdoor_interests;
  return Array.isArray(interests) && interests.includes(value);
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
  defaultValue = "",
}: TextFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-forest-900">
        {label}
        {required ? <span className="text-red-700"> *</span> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={getStringValue(state, name, defaultValue)}
        className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 bg-white px-3 py-2 text-forest-900 outline-none transition focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
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
        defaultChecked={isChecked(state, name)}
        className="mt-1 size-4 rounded border-forest-900/30 text-forest-700"
      />
      <span>
        <span className="block text-sm font-semibold leading-6 text-forest-900">
          {label}
        </span>
        <FieldError state={state} name={name} />
      </span>
    </label>
  );
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-forest-900">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function SubmitButton() {
  return (
    <button
      type="submit"
      className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900 disabled:cursor-not-allowed disabled:bg-forest-500"
    >
      Submit Application
    </button>
  );
}

export function ApplicationForm({
  error = false,
  submitted = false,
}: {
  error?: boolean;
  submitted?: boolean;
}) {
  const state = initialApplicationFormState;
  const currentState: ApplicationFormState = {
    ...initialApplicationFormState,
    ...state,
    fieldErrors: state.fieldErrors ?? {},
    values: state.values ?? {},
  };

  if (submitted) {
    return (
      <div className="rounded-md border border-forest-700/20 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase text-clay">
          Application submitted
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-forest-900">
          Thank you.
        </h1>
        <p className="mt-4 text-base leading-7 text-forest-900/72">
          Thank you. Your membership application has been submitted and will be
          reviewed by the committee.
        </p>
      </div>
    );
  }

  return (
    <form action={submitApplicationSimple} className="grid gap-6">
      <div className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase text-clay">
          Prime Range Outdoor Society Inc.
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-forest-900">
          Membership Application
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-forest-900/72">
          Applications are reviewed by the committee. Please complete the
          details below accurately and acknowledge the society expectations
          before submitting.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          The application could not be submitted. Please check every required
          field and try again.
        </div>
      ) : null}

      <Section title="Applicant Details">
        <div className="grid gap-6 md:grid-cols-2">
          <TextField label="Full Name" name="full_name" state={currentState} />
          <TextField
            label="Date of Birth"
            name="date_of_birth"
            type="date"
            state={currentState}
          />
          <div className="md:col-span-2">
            <TextField
              label="Residential Address"
              name="residential_address"
              state={currentState}
            />
          </div>
          <TextField
            label="Phone Number"
            name="phone_number"
            type="tel"
            state={currentState}
          />
          <TextField
            label="Email Address"
            name="email"
            type="email"
            state={currentState}
          />
          <TextField
            label="Occupation"
            name="occupation"
            required={false}
            state={currentState}
          />
          <TextField
            label="Firearms Licence Number"
            name="firearms_licence_number"
            required={false}
            state={currentState}
          />
          <TextField
            label="Licence Category"
            name="licence_category"
            required={false}
            state={currentState}
          />
          <TextField
            label="Expiry Date"
            name="licence_expiry_date"
            type="date"
            required={false}
            state={currentState}
          />
        </div>
      </Section>

      <Section title="Emergency Contact">
        <div className="grid gap-6 md:grid-cols-3">
          <TextField label="Name" name="emergency_contact_name" state={currentState} />
          <TextField
            label="Relationship"
            name="emergency_contact_relationship"
            state={currentState}
          />
          <TextField
            label="Phone Number"
            name="emergency_contact_phone"
            type="tel"
            state={currentState}
          />
        </div>
      </Section>

      <Section title="Outdoor Interests">
        <fieldset>
          <legend className="text-sm font-semibold text-forest-900">
            Select at least one outdoor interest
          </legend>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {outdoorInterestOptions.map((interest) => (
              <label
                key={interest}
                className="flex gap-3 rounded-md border border-forest-900/10 bg-forest-50 p-4"
              >
                <input
                  name="outdoor_interests"
                  type="checkbox"
                  value={interest}
                  defaultChecked={isInterestChecked(currentState, interest)}
                  className="mt-1 size-4 rounded border-forest-900/30 text-forest-700"
                />
                <span className="text-sm font-semibold text-forest-900">
                  {interest}
                </span>
              </label>
            ))}
          </div>
          <FieldError state={currentState} name="outdoor_interests" />
        </fieldset>
        <div className="mt-6">
          <TextField
            label="Other details"
            name="outdoor_interests_other"
            required={false}
            state={currentState}
          />
        </div>
      </Section>

      <Section title="Membership Acknowledgement">
        <div className="grid gap-4 text-sm leading-7 text-forest-900/78">
          <p>
            I acknowledge that Prime Range Outdoor Society Inc. is a private
            outdoor and sporting association committed to responsible outdoor
            recreation, ethical conduct, land stewardship and respect for
            Australia&apos;s natural environment and cultural heritage.
          </p>
          <p>
            I understand that participation in outdoor activities including
            hunting, fishing, camping, hiking and recreational shooting may
            involve inherent risks, including personal injury, property damage,
            environmental hazards and other unforeseen circumstances.
          </p>
          <p className="font-semibold text-forest-900">I agree to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Conduct myself safely, responsibly and respectfully at all times;</li>
            <li>
              Comply with all lawful directions given by the Society, landowners,
              activity coordinators and Range/Safety Officers;
            </li>
            <li>
              Follow all applicable Victorian firearms, hunting, fishing and
              outdoor regulations;
            </li>
            <li>
              Respect wildlife, private property, cultural heritage and the
              natural environment;
            </li>
            <li>
              Not engage in reckless, dangerous, aggressive or unlawful behaviour;
            </li>
            <li>
              Not attend activities while affected by alcohol or illegal
              substances;
            </li>
            <li>
              Accept personal responsibility for my own actions, equipment and
              conduct.
            </li>
          </ul>
          <p>
            I understand that failure to comply with Society rules or unsafe
            conduct may result in suspension or termination of membership.
          </p>
        </div>
      </Section>

      <Section title="Membership Acknowledgement Agreements">
        <div className="grid gap-3">
          {acknowledgementAgreements.map((agreement) => (
            <CheckboxField
              key={agreement.name}
              label={agreement.label}
              name={agreement.name}
              state={currentState}
            />
          ))}
        </div>
      </Section>

      <Section title="Liability Waiver">
        <div className="grid gap-4 text-sm leading-7 text-forest-900/78">
          <p>
            To the fullest extent permitted by law, I acknowledge that Prime
            Range Outdoor Society Inc., its committee members, officers,
            volunteers, landowners and representatives shall not be held liable
            for any injury, loss, damage or expense arising from my participation
            in Society activities, except where required by law.
          </p>
          <p>I participate voluntarily and at my own risk.</p>
        </div>
        <div className="mt-5">
          <CheckboxField
            label="I acknowledge and accept the liability waiver above."
            name="accept_liability_waiver"
            state={currentState}
          />
        </div>
      </Section>

      <Section title="Privacy Consent">
        <p className="text-sm leading-7 text-forest-900/78">
          I consent to Prime Range Outdoor Society Inc. collecting and storing my
          personal information for membership administration, communication,
          safety management and lawful operational purposes.
        </p>
        <div className="mt-5">
          <CheckboxField
            label="I consent to the collection and storage of my personal information as described above."
            name="accept_privacy_consent"
            state={currentState}
          />
        </div>
      </Section>

      <Section title="Applicant Signature">
        <div className="grid gap-6 md:grid-cols-2">
          <TextField
            label="Applicant Signature / Typed Full Name"
            name="applicant_signature"
            state={currentState}
          />
          <TextField
            label="Date"
            name="application_date"
            type="date"
            state={currentState}
            defaultValue={todayDate()}
          />
        </div>
      </Section>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
