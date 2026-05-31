import { SiteShell } from "@/components/layout/site-shell";

export default function PrivacyPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase text-clay">Privacy</p>
          <h1 className="mt-3 text-4xl font-semibold text-forest-900">
            Privacy policy placeholder.
          </h1>
          <p className="mt-5 text-base leading-7 text-forest-900/72">
            PROS will publish a complete privacy policy before launch. This
            placeholder marks the location for the final policy covering
            application data, member records, payment metadata, and club
            communications.
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
