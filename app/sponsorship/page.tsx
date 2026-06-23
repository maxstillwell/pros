import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { SponsorCard } from "@/components/sponsors/sponsor-card";
import { SponsorLogoMarquee } from "@/components/sponsors/sponsor-logo-marquee";
import { getSponsors } from "@/lib/sponsors";

export default async function SponsorshipPage() {
  const sponsors = await getSponsors();

  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <div>
            <p className="text-sm font-semibold uppercase text-clay">
              Sponsorship
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-forest-900">
              Our sponsor platform.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-forest-900/74">
              PROS showcases sponsors whose values align with responsible outdoor
              recreation, member development, safety, conservation and practical
              community standards.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sponsorship/become"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
              >
                Become a Sponsor
              </Link>
              <Link
                href="/contact?topic=sponsorship"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-forest-50"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        <div className="-mx-5 mt-12">
          <SponsorLogoMarquee sponsors={sponsors} />
        </div>

        <section className="mx-auto mt-14 max-w-6xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold text-forest-900">
                Current sponsors
              </h2>
              <p className="mt-2 text-sm leading-6 text-forest-900/68">
                Each sponsor can link through to a profile with introduction
                and contact details.
              </p>
            </div>
          </div>

          {sponsors.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sponsors.map((sponsor) => (
                <SponsorCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
              <p className="text-base leading-7 text-forest-900/72">
                No sponsors have been added yet. Sponsor opportunities are
                available for organisations aligned with responsible outdoor
                recreation, safety, conservation and community standards.
              </p>
              <Link
                href="/sponsorship/become"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
              >
                Become a Sponsor
              </Link>
            </div>
          )}
        </section>
      </main>
    </SiteShell>
  );
}
