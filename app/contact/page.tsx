import { SiteShell } from "@/components/layout/site-shell";

export default function ContactPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase text-clay">Contact</p>
          <h1 className="mt-3 text-4xl font-semibold text-forest-900">
            Contact the committee.
          </h1>
          <p className="mt-5 text-base leading-7 text-forest-900/72">
            For membership enquiries or club communications, contact the
            committee by email.
          </p>
          <a
            href="mailto:info@pros.org.au"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
          >
            info@pros.org.au
          </a>
        </div>
      </main>
    </SiteShell>
  );
}
