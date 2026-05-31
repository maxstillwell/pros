import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { membershipSteps } from "@/lib/site-content";

export default function MembershipPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase text-clay">
            Membership
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-forest-900">
            Membership is by application and committee review.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-forest-900/74">
            Approved applicants receive a secure payment link for the annual
            membership fee. Payment does not automatically approve membership
            until the committee review is complete.
          </p>

          <ol className="mt-12 grid gap-4">
            {membershipSteps.map((step, index) => (
              <li
                key={step}
                className="grid gap-4 rounded-md border border-forest-900/10 bg-white p-5 shadow-sm md:grid-cols-[7rem_1fr]"
              >
                <span className="text-sm font-semibold text-clay">
                  Step {index + 1}
                </span>
                <p className="text-base leading-7 text-forest-900/78">{step}</p>
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
      </main>
    </SiteShell>
  );
}
