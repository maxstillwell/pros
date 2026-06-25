import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";

export default function ShopSuccessPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-3xl rounded-md border border-forest-900/10 bg-white p-8 shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase text-clay">
            Payment received
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-forest-900">
            Thank you for supporting PROS.
          </h1>
          <p className="mt-5 text-base leading-7 text-forest-900/72">
            Your shop payment was handled by Stripe. PROS will match the order
            with your membership and arrange pickup at the next suitable society
            event.
          </p>
          <div className="mt-6 rounded-md border border-clay/25 bg-clay/5 p-4 text-sm leading-6 text-forest-900/78">
            <p className="font-semibold text-forest-900">
              Member pickup only. No postal delivery.
            </p>
            <p className="mt-1">
              If you are not a current member, PROS will contact you to discuss
              whether the product can be supplied.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-forest-50"
            >
              Back to Shop
            </Link>
            <Link
              href="/contact?topic=shop"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
            >
              Contact PROS
            </Link>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
