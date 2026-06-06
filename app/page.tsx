import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { SponsorLogoMarquee } from "@/components/sponsors/sponsor-logo-marquee";
import { membershipSteps } from "@/lib/site-content";
import { getSponsors } from "@/lib/sponsors";

const societyFocus = [
  "Private Hunting Properties",
  "Organised Hunting Expeditions",
  "Long Range Sporting Facilities",
  "Private Boating Activities",
  "Heritage Rural Experiences",
  "Camping & Outdoor Events",
  "Member Community",
];

export default async function HomePage() {
  const featuredSponsors = await getSponsors({ featuredOnly: true });

  return (
    <SiteShell>
      <main>
        <section className="relative flex min-h-[72svh] items-center overflow-hidden bg-forest-900 text-white">
          <Image
            src="/images/pros-hero.png"
            alt="Open bushland and distant range at golden hour"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-forest-900/58" />
          <div className="relative mx-auto w-full max-w-6xl px-5 py-20">
            <p className="text-sm font-semibold uppercase text-stone/85">
              Private member-only outdoor society
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">
              Prime Range Outdoor Society
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone/90">
              A private membership society focused on hunting properties,
              organised expeditions, sporting facilities, boating, rural
              heritage, camping and member community.
            </p>
            <div className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {societyFocus.map((item) => (
                <div
                  key={item}
                  className="rounded-md border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/apply"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
              >
                Apply for Membership
              </Link>
              <Link
                href="/membership"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/55 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Membership Information
              </Link>
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
              <div className="mt-7 overflow-hidden rounded-md border border-forest-900/10 bg-forest-900 shadow-sm">
                <Image
                  src="/images/pros-membership-field-day.jpg"
                  alt="Outdoor society field-day setup in Australian bushland"
                  width={1600}
                  height={914}
                  unoptimized
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
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
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-semibold uppercase text-clay">
              Society focus
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-forest-900">
              Built around private access, organised activities and a strong
              member community.
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {societyFocus.map((item) => (
                <article
                  key={item}
                  className="rounded-md border border-forest-900/10 bg-white p-5 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-forest-900">
                    {item}
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-stone px-5 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-clay">
                  Sponsorship
                </p>
                <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-forest-900">
                  Sponsor showcase.
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-forest-900/72">
                  This is where PROS highlights the businesses and partners who
                  support our society, member experiences and responsible
                  outdoor recreation.
                </p>
              </div>
              <div>
                <div className="overflow-hidden rounded-md border border-forest-900/10 bg-forest-900 shadow-sm">
                  <Image
                    src="/images/pros-sponsor-showcase.jpg"
                    alt="Sponsor showcase display at an outdoor field-day"
                    width={1600}
                    height={914}
                    unoptimized
                    className="aspect-[16/9] w-full object-cover"
                  />
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/sponsorship"
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-white"
                  >
                    View Sponsorship
                  </Link>
                  <Link
                    href="/sponsorship/become"
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
                  >
                    Become a Sponsor
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="-mx-5 mt-8">
            <SponsorLogoMarquee sponsors={featuredSponsors} />
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
