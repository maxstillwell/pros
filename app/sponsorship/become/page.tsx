import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { benefitsList, getSponsorshipTiers } from "@/lib/sponsors";

const sponsorshipInquiryHref = "/contact?topic=sponsorship";

export default async function BecomeSponsorPage() {
  const tiers = await getSponsorshipTiers();

  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase text-clay">
            Become a sponsor
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-forest-900">
            Partner with a responsible, members-only outdoor society.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-forest-900/74">
            PROS welcomes considered sponsorship from organisations whose values
            align with safety, lawful outdoor recreation, conservation,
            fellowship and practical member development.
          </p>

          <section className="mt-12 grid gap-5 lg:grid-cols-3">
            {tiers.map((tier) => (
              <article
                key={tier.id}
                className="flex h-full flex-col rounded-md border border-forest-900/10 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-semibold uppercase text-clay">
                  {tier.name}
                </p>
                <p className="mt-3 text-3xl font-semibold text-forest-900">
                  {tier.price_label}
                </p>
                <p className="mt-4 flex-1 text-sm leading-6 text-forest-900/72">
                  {tier.description}
                </p>
                <ul className="mt-5 grid gap-3 text-sm leading-6 text-forest-900/76">
                  {benefitsList(tier.benefits).map((benefit) => (
                    <li
                      key={benefit}
                      className="border-t border-forest-900/10 pt-3"
                    >
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Link
                  href={sponsorshipInquiryHref}
                  className={`mt-6 inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition ${
                    tier.contact_required
                      ? "bg-clay text-white hover:bg-forest-900"
                      : "bg-forest-700 text-white hover:bg-forest-900"
                  }`}
                >
                  {tier.contact_required ? "Contact Committee" : "Inquire Now"}
                </Link>
              </article>
            ))}
          </section>

          <section className="mt-14 grid gap-8 rounded-md border border-forest-900/10 bg-forest-50 p-6 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase text-clay">
                Recognition
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-forest-900">
                Tasteful exposure, practical support.
              </h2>
            </div>
            <div className="text-base leading-8 text-forest-900/76">
              <p>
                Sponsor recognition can include website placement, links to a
                sponsor profile, selected member communication and suitable
                acknowledgement around society activities.
              </p>
              <p className="mt-4">
                All sponsorship is reviewed by the committee before public
                listing so PROS standards and sponsor fit stay clear.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/sponsorship"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-white"
                >
                  View Sponsors
                </Link>
                <Link
                  href={sponsorshipInquiryHref}
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
                >
                  Contact PROS
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </SiteShell>
  );
}
