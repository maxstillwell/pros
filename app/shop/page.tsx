import { SiteShell } from "@/components/layout/site-shell";

export default function ShopPage() {
  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-3xl rounded-md border border-forest-900/10 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase text-clay">Shop</p>
          <h1 className="mt-3 text-4xl font-semibold text-forest-900">
            Club merchandise coming soon.
          </h1>
          <p className="mt-5 text-base leading-7 text-forest-900/72">
            This first build keeps the shop simple. Product records and Stripe
            Checkout links can be added later without introducing a full cart.
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
