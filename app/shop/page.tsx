import { SiteShell } from "@/components/layout/site-shell";
import Link from "next/link";

export default function ShopPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-md border border-forest-900/10 bg-white shadow-sm">
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase text-clay">
              Member shop
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-forest-900">
              Member-only merchandise that supports PROS.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-forest-900/72">
              Individuals can support Prime Range Outdoor Society by purchasing
              member-exclusive merchandise. Shop purchases help sponsor private
              hunting properties, organised expeditions, sporting facilities,
              boating activities, camping events and the wider member community.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                "Member-exclusive products",
                "Direct support for society activities",
                "Simple checkout when products launch",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-md border border-forest-900/10 bg-forest-50 p-5 text-sm font-semibold text-forest-900"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/membership"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-forest-50"
              >
                Membership Information
              </Link>
              <Link
                href="/contact?topic=shop"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
              >
                Contact PROS
              </Link>
            </div>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
