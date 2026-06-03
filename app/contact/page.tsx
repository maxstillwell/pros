import { ContactForm } from "@/components/forms/contact-form";
import { SiteShell } from "@/components/layout/site-shell";

type ContactPageProps = {
  searchParams: Promise<{
    error?: string;
    submitted?: string;
    topic?: string;
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;

  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-clay">Contact</p>
            <h1 className="mt-3 text-4xl font-semibold text-forest-900">
              Contact the committee.
            </h1>
            <p className="mt-5 text-base leading-7 text-forest-900/72">
              Send a message through the website and the PROS admin team will
              review it as a ticket in the dashboard.
            </p>
            <div className="mt-8 rounded-md border border-forest-900/10 bg-forest-50 p-5 text-sm leading-6 text-forest-900/72">
              <p className="font-semibold text-forest-900">
                Prime Range Outdoor Society Inc.
              </p>
              <p className="mt-2">
                For sponsorship, membership, events, website questions or
                general club communications, use the form.
              </p>
            </div>
          </div>

          <ContactForm
            defaultTopic={params.topic}
            error={params.error}
            submitted={params.submitted === "1"}
          />
        </div>
      </main>
    </SiteShell>
  );
}
