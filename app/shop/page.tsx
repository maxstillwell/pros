import { SiteShell } from "@/components/layout/site-shell";
import Link from "next/link";

export default function ShopPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-md border border-[#d6ad45]/24 bg-[#070604] shadow-sm">
          <div className="p-8 text-[#d6ad45] md:p-10">
            <p className="text-sm font-semibold uppercase text-[#f1d991]/78">
              Member shop
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-[#f3d77a]">
              Member-only merchandise that supports PROS.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#f6e8b5]/78">
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
                  className="rounded-md border border-[#d6ad45]/20 bg-[#0f0c08] p-5 text-sm font-semibold text-[#f3d77a]"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/membership"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d6ad45]/35 px-5 py-3 text-sm font-semibold text-[#f3d77a] transition hover:bg-[#d6ad45] hover:text-black"
              >
                Membership Information
              </Link>
              <Link
                href="/contact?topic=shop"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#d6ad45] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#f3d77a]"
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
