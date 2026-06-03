import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { SponsorCard } from "@/components/sponsors/sponsor-card";
import { LinkButton } from "@/components/ui/link-button";
import { membershipSteps } from "@/lib/site-content";
import { getSponsors, getSponsorshipTiers } from "@/lib/sponsors";

export default async function HomePage() {
  const [featuredSponsors, sponsorshipTiers] = await Promise.all([
    getSponsors({ featuredOnly: true }),
    getSponsorshipTiers(),
  ]);

  return (
    <SiteShell>
      <main>
        <section className="relative flex min-h-[72svh] items-center overflow-hidden bg-forest-900 text-white">
          <Image
            src="/images/pros-hero.png"
            alt="Open bushland and distant range at golden hour"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-forest-900/55" />
          <div className="relative mx-auto w-full max-w-6xl px-5 py-20">
            <p className="text-sm font-semibold uppercase text-stone/85">
              Private outdoor society
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">
              Prime Range Outdoor Society Inc.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone/90">
              A private outdoor society for members who value responsible
              recreation, safety, community, and respect for the outdoors.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/apply">Apply for Membership</LinkButton>
              <LinkButton href="/news" variant="secondary">
                Read Club News
              </LinkButton>
            </div>
          </div>
        </section>

        <section className="bg-stone px-5 py-16">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="text-sm font-semibold uppercase text-clay">
                Membership
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-forest-900">
                Simple application, careful review, clear next steps.
              </h2>
              <p className="mt-5 text-base leading-7 text-forest-900/72">
                Membership is by application and committee review. Approved
                applicants receive a secure payment link for the annual fee
                after review.
              </p>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {membershipSteps.map((step, index) => (
                <li
                  key={step}
                  className="rounded-md border border-forest-900/10 bg-white p-5 shadow-sm"
                >
                  <span className="text-sm font-semibold text-clay">
                    Step {index + 1}
                  </span>
                  <p className="mt-2 text-sm leading-6 text-forest-900/78">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-white px-5 py-16">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {[
              {
                title: "Responsible recreation",
                body: "A club foundation built around safety, clear expectations, and care for outdoor spaces.",
              },
              {
                title: "Community first",
                body: "A private member environment for people who value practical support and shared standards.",
              },
              {
                title: "Easy to maintain",
                body: "The new website keeps the public pages, applications, and admin workflows simple.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-md border border-forest-900/10 p-6"
              >
                <h3 className="text-xl font-semibold text-forest-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-forest-900/70">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-stone px-5 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-clay">
                  Partnerships
                </p>
                <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-forest-900">
                  Our sponsors support society activities and member
                  experiences.
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-forest-900/72">
                  PROS welcomes sponsors whose values align with responsible
                  outdoor recreation, safety, conservation and community
                  standards.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/sponsors"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-white"
                >
                  View Sponsors
                </Link>
                <Link
                  href="/sponsorship"
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
                >
                  Become a Sponsor
                </Link>
              </div>
            </div>

            {featuredSponsors.length ? (
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {featuredSponsors.map((sponsor) => (
                  <SponsorCard key={sponsor.id} sponsor={sponsor} />
                ))}
              </div>
            ) : (
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {sponsorshipTiers.map((tier) => (
                  <article
                    key={tier.id}
                    className="rounded-md border border-forest-900/10 bg-white p-5 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-clay">
                      {tier.price_label}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-forest-900">
                      {tier.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-forest-900/70">
                      {tier.description}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-forest-50 px-5 py-16">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-semibold text-forest-900">
                Ready to apply?
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-forest-900/72">
                Start with the application form. The committee reviews every
                application before payment or member access is activated.
              </p>
            </div>
            <Link
              href="/apply"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
            >
              Apply for Membership
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
