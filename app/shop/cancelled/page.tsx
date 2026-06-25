import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";

export default function ShopCancelledPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-3xl rounded-md border border-forest-900/10 bg-white p-8 shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase text-clay">
            Checkout cancelled
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-forest-900">
            No shop payment was completed.
          </h1>
          <p className="mt-5 text-base leading-7 text-forest-900/72">
            You can return to the shop and try again, or contact PROS if you
            have questions about member-only pickup.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
            >
              Return to Shop
            </Link>
            <Link
              href="/contact?topic=shop"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-forest-50"
            >
              Contact PROS
            </Link>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
