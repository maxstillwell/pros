import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { membershipSteps } from "@/lib/site-content";

export default function MembershipPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-clay">
              Membership
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-forest-900">
              PROS is a member-only outdoor association.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-forest-900/74">
              Membership is required before a person may participate in PROS
              activities, events and member communications, unless the committee
              has approved a one-time first guest attendance nominated by a
              current member.
            </p>

            <div className="mt-8 grid gap-4">
              <section className="rounded-md border border-forest-900/10 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-forest-900">
                  Membership required
                </h2>
                <p className="mt-3 text-base leading-7 text-forest-900/74">
                  PROS activities are for approved members. Members are expected
                  to follow society rules, committee directions, activity safety
                  briefings, landowner requirements and all applicable laws,
                  including firearm, hunting, fishing, camping, access and
                  conservation requirements.
                </p>
              </section>
              <section className="rounded-md border border-forest-900/10 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-forest-900">
                  First-time guest rule
                </h2>
                <p className="mt-3 text-base leading-7 text-forest-900/74">
                  A non-member may attend one activity only if nominated by an
                  active member and approved by the committee before the event.
                  Guests must complete any required acknowledgements, meet
                  safety and legal requirements, and follow all directions. After
                  that first approved attendance, membership is required before
                  attending further activities.
                </p>
              </section>
            </div>

            <ol className="mt-12 grid gap-4">
              {membershipSteps.map((step, index) => (
                <li
                  key={step}
                  className="grid gap-4 rounded-md border border-forest-900/10 bg-white p-5 shadow-sm md:grid-cols-[7rem_1fr]"
                >
                  <span className="text-sm font-semibold text-clay">
                    Step {index + 1}
                  </span>
                  <p className="text-base leading-7 text-forest-900/78">
                    {step}
                  </p>
                </li>
              ))}
            </ol>

            <Link
              href="/apply"
              className="mt-10 inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
            >
              Apply for Membership
            </Link>
          </div>

          <div className="overflow-hidden rounded-md border border-forest-900/10 bg-forest-900 shadow-sm">
            <Image
              src="/images/pros-membership-field-day.jpg"
              alt="PROS-style outdoor field-day gathering"
              width={1600}
              height={914}
              unoptimized
              className="aspect-[4/5] w-full object-cover lg:aspect-[3/4]"
            />
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
