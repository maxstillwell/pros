import { SiteShell } from "@/components/layout/site-shell";

export default function TermsPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase text-clay">Terms</p>
          <h1 className="mt-3 text-4xl font-semibold text-forest-900">
            Terms, waiver, and disclaimer placeholder.
          </h1>
          <p className="mt-5 text-base leading-7 text-forest-900/72">
            PROS will publish final terms, waiver acknowledgements, and
            disclaimers before launch. The membership application form includes
            acknowledgement fields so the final text can be attached cleanly.
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
