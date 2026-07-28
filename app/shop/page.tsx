import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import {
  defaultPickupNote,
  formatProductPrice,
  getProducts,
  type Product,
} from "@/lib/shop";

function ProductImage({ product }: { product: Product }) {
  if (product.image_url) {
    return (
      <div
        className="aspect-[4/3] w-full rounded-md border border-forest-900/10 bg-forest-50 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${product.image_url})` }}
        aria-label={`${product.name} image`}
      />
    );
  }

  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-md border border-forest-900/10 bg-forest-50 px-6 text-center text-sm font-semibold uppercase text-forest-900/45">
      PROS member product
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const checkoutAvailable = product.price !== null;

  return (
    <article className="grid overflow-hidden rounded-md border border-forest-900/10 bg-white shadow-sm md:grid-cols-[minmax(14rem,0.9fr)_1fr]">
      <ProductImage product={product} />
      <div className="p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-clay">
              Member-only pickup
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-forest-900">
              {product.name}
            </h2>
          </div>
          <p className="text-3xl font-semibold text-forest-900 sm:text-right">
            {formatProductPrice(product)}
          </p>
        </div>

        {product.description ? (
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-forest-900/72">
            {product.description}
          </p>
        ) : null}

        <div className="mt-5 grid gap-3 rounded-md border border-forest-900/10 bg-forest-50 p-4 text-sm leading-6 text-forest-900/75">
          <div className="flex justify-between gap-4">
            <span className="text-forest-900/62">Supply</span>
            <span className="text-right font-semibold text-forest-900">
              Current PROS members
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-forest-900/62">Collection</span>
            <span className="text-right font-semibold text-forest-900">
              Next society event
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-forest-900/62">Delivery</span>
            <span className="text-right font-semibold text-forest-900">
              No postage
            </span>
          </div>
          <p className="border-t border-forest-900/10 pt-3 text-xs leading-5 text-forest-900/62">
            {product.pickup_note || defaultPickupNote}
          </p>
        </div>

        <form
          action="/api/stripe/create-shop-checkout-session"
          method="post"
          className="mt-5 rounded-md border border-forest-900/10 bg-stone p-4"
        >
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="quantity" value="1" />
          <div className="grid gap-3">
            <label className="block text-sm font-semibold text-forest-900">
              Full name
              <input
                name="customer_name"
                required
                autoComplete="name"
                className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 bg-white px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-forest-900">
                Email
                <input
                  name="customer_email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 bg-white px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
                />
              </label>
              <label className="block text-sm font-semibold text-forest-900">
                Phone
                <input
                  name="customer_phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 bg-white px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
                />
              </label>
            </div>
            <label className="block text-sm font-semibold text-forest-900">
              PROS member number
              <input
                name="member_number"
                required
                placeholder="PROS-001"
                className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 bg-white px-3 py-2 text-sm uppercase outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
              />
            </label>
          </div>
          <div className="mt-5 border-t border-forest-900/10 pt-4">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-forest-900">
                Secure Stripe checkout
              </span>
              <span className="font-semibold text-forest-900">
                {formatProductPrice(product)}
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={!checkoutAvailable}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-red-700 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-900/35"
          >
            {checkoutAvailable ? "Checkout securely" : "Contact PROS"}
          </button>
          <p className="mt-3 text-xs leading-5 text-forest-900/60">
            Payment opens Stripe Checkout. PROS will confirm member eligibility
            before supplying any item.
          </p>
        </form>
      </div>
    </article>
  );
}

export default async function ShopPage() {
  const products = await getProducts();

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
                <h2 className="mt-2 text-3xl font-semibold text-forest-900">
                  Available items
                </h2>
              </div>
              <Link
                href="/membership"
                className="text-sm font-semibold text-clay hover:text-forest-900"
              >
                Membership information
              </Link>
            </div>
            {products.length ? (
              <div className="mt-5 grid gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
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

          <section className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Member supply",
                body: "Products are intended for current PROS members. Non-member purchases are reviewed before supply.",
              },
              {
                title: "Pickup only",
                body: "There is no postal delivery. Items are collected in person at the next suitable society event.",
              },
              {
                title: "Secure payment",
                body: "Stripe handles card and payment details. PROS receives the order record and follows up if needed.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-md border border-forest-900/10 bg-white p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-forest-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-forest-900/70">
                  {item.body}
                </p>
              </div>
            ))}
          </section>
        </div>
      </main>
    </SiteShell>
  );
}
