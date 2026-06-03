import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";

export default function MembershipSuccessPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-3xl rounded-md border border-forest-900/10 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase text-clay">
            Membership payment
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-forest-900">
            Payment received.
          </h1>
          <p className="mt-4 text-base leading-7 text-forest-900/72">
            Thank you. Your membership payment has been received. The system
            will update your member record once Stripe confirms the payment.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
          >
            Return to site
          </Link>
        </div>
      </main>
    </SiteShell>
  );
}
