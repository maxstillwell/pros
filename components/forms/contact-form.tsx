import { submitContactTicket } from "@/app/contact/actions";

type ContactFormProps = {
  defaultTopic?: string;
  error?: string;
  submitted?: boolean;
};

const topicOptions = [
  { label: "General enquiry", value: "general" },
  { label: "Membership", value: "membership" },
  { label: "Sponsorship", value: "sponsorship" },
  { label: "Events", value: "events" },
  { label: "Website", value: "website" },
];

function getSafeTopic(value: string | undefined) {
  return topicOptions.some((option) => option.value === value)
    ? value
    : "general";
}

export function ContactForm({
  defaultTopic,
  error,
  submitted = false,
}: ContactFormProps) {
  const topic = getSafeTopic(defaultTopic);

  return (
    <form
      action={submitContactTicket}
      className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm"
    >
      {submitted ? (
        <div className="mb-6 rounded-md border border-forest-700/20 bg-forest-50 p-4 text-sm font-medium text-forest-900">
          Thank you. Your message has been sent to PROS.
        </div>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          Your message could not be sent. Please check the required fields and
          try again.
        </div>
      ) : null}

      <input type="hidden" name="source_path" value="/contact" />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-forest-900">
            Name <span className="text-red-700">*</span>
          </span>
          <input
            name="name"
            required
            className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-forest-900">
            Email <span className="text-red-700">*</span>
          </span>
          <input
            name="email"
            type="email"
            required
            className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-forest-900">Phone</span>
          <input
            name="phone"
            type="tel"
            className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-forest-900">Topic</span>
          <select
            name="topic"
            defaultValue={topic}
            className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
          >
            {topicOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-forest-900">
            Subject <span className="text-red-700">*</span>
          </span>
          <input
            name="subject"
            required
            defaultValue={topic === "sponsorship" ? "Sponsorship enquiry" : ""}
            className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-forest-900">
            Message <span className="text-red-700">*</span>
          </span>
          <textarea
            name="message"
            rows={8}
            required
            className="mt-2 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
          />
        </label>
      </div>

      <button className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900">
        Send Message
      </button>
    </form>
  );
}
