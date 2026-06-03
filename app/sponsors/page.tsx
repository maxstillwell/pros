import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { SponsorCard } from "@/components/sponsors/sponsor-card";
import { benefitsList, getSponsors, getSponsorshipTiers } from "@/lib/sponsors";

export default async function SponsorsPage() {
  const [sponsors, tiers] = await Promise.all([
    getSponsors(),
    getSponsorshipTiers(),
  ]);

  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase text-clay">
            Partnerships
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-forest-900">
            Sponsors who support responsible outdoor recreation.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-forest-900/74">
            Sponsorship support helps PROS activities, field events, member
            experiences and careful stewardship of long-term association
            standards.
          </p>

          <section className="mt-12">
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
              <Link
                href="/sponsorship"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
              >
                Become a Sponsor
              </Link>
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
              </div>
            )}
          </section>

          <section className="mt-14 rounded-md border border-forest-900/10 bg-forest-50 p-6">
            <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="text-sm font-semibold uppercase text-clay">
                  Sponsor levels
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-forest-900">
                  Three clear ways to support PROS.
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {tiers.map((tier) => (
                  <article
                    key={tier.id}
                    className="rounded-md border border-forest-900/10 bg-white p-5"
                  >
                    <p className="text-sm font-semibold text-clay">
                      {tier.price_label}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-forest-900">
                      {tier.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-forest-900/68">
                      {tier.description}
                    </p>
                    {benefitsList(tier.benefits).length ? (
                      <ul className="mt-4 grid gap-2 text-sm leading-6 text-forest-900/72">
                        {benefitsList(tier.benefits)
                          .slice(0, 3)
                          .map((benefit) => (
                            <li key={benefit}>{benefit}</li>
                          ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </SiteShell>
  );
}
