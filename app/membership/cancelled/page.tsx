import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";

export default function MembershipCancelledPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-3xl rounded-md border border-forest-900/10 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase text-clay">
            Membership payment
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-forest-900">
            Payment was not completed.
          </h1>
          <p className="mt-4 text-base leading-7 text-forest-900/72">
            Your application remains approved, but membership will stay pending
            until payment is received. You can return to the payment link from
            the email whenever you are ready.
          </p>
          <Link
            href="/membership"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
          >
            Back to membership
          </Link>
        </div>
      </main>
    </SiteShell>
  );
}
