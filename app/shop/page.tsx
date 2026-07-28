import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { ShopCheckoutForm } from "@/components/shop/shop-checkout-form";
import { getProducts, withPublicProductImages } from "@/lib/shop";

export default async function ShopPage() {
  const products = withPublicProductImages(await getProducts());

  return (
    <SiteShell>
      <main className="px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <section>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-clay">
                  Products
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-forest-900">
                  Available items
                </h1>
              </div>
              <Link
                href="/membership"
                className="text-sm font-semibold text-clay hover:text-forest-900"
              >
                Membership information
              </Link>
            </div>

            {products.length ? (
              <div className="mt-5">
                <ShopCheckoutForm products={products} />
              </div>
            ) : (
              <div className="mt-5 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
                <p className="text-sm leading-6 text-forest-900/70">
                  Shop products are being prepared. Contact PROS if you are a
                  member looking for a specific item.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </SiteShell>
  );
}
