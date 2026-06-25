import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import {
  defaultPickupNote,
  formatProductPrice,
  getProducts,
  type Product,
} from "@/lib/shop";

function PaymentBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-h-8 items-center justify-center rounded border border-forest-900/15 bg-white px-3 text-xs font-black uppercase tracking-wide text-forest-900 shadow-sm">
      {children}
    </span>
  );
}

function SecureCheckoutPanel() {
  return (
    <aside className="rounded-md border border-forest-900/10 bg-stone p-5 shadow-sm">
      <div className="rounded-md bg-red-700 px-5 py-3 text-center text-sm font-black uppercase tracking-wide text-white shadow-sm">
        Checkout securely
      </div>
      <div className="mt-4 flex items-start gap-3 text-sm font-semibold leading-5 text-forest-900/78">
        <span
          className="mt-0.5 rounded border border-forest-700/20 px-1.5 py-0.5 text-[0.65rem] font-black uppercase text-forest-700"
          aria-hidden="true"
        >
          SSL
        </span>
        <p>
          Payment and card details are handled securely by Stripe. PROS never
          stores your card number.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <PaymentBadge>Visa</PaymentBadge>
        <PaymentBadge>Mastercard</PaymentBadge>
        <PaymentBadge>Amex</PaymentBadge>
        <PaymentBadge>Apple Pay</PaymentBadge>
        <PaymentBadge>G Pay</PaymentBadge>
        <PaymentBadge>Stripe</PaymentBadge>
      </div>
      <p className="mt-4 text-xs leading-5 text-forest-900/60">
        Available payment methods are shown by Stripe at checkout.
      </p>
    </aside>
  );
}

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
  return (
    <article className="rounded-md border border-forest-900/10 bg-white p-5 shadow-sm">
      <ProductImage product={product} />
      <div className="mt-5">
        <p className="text-sm font-semibold uppercase text-clay">
          Member-only pickup
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-forest-900">
          {product.name}
        </h2>
        <p className="mt-3 text-3xl font-semibold text-forest-900">
          {formatProductPrice(product)}
        </p>
        {product.description ? (
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-forest-900/72">
            {product.description}
          </p>
        ) : null}
        <div className="mt-5 rounded-md border border-clay/25 bg-clay/5 p-4 text-sm leading-6 text-forest-900/78">
          <p className="font-semibold text-forest-900">
            Pickup at the next society event only.
          </p>
          <p className="mt-1">{product.pickup_note || defaultPickupNote}</p>
        </div>
        <form
          action="/api/stripe/create-shop-checkout-session"
          method="post"
          className="mt-5"
        >
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="quantity" value="1" />
          <button
            type="submit"
            disabled={product.price === null}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900 disabled:cursor-not-allowed disabled:bg-forest-900/35"
          >
            Buy Now with Stripe
          </button>
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
          <section className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase text-clay">
                PROS member shop
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-forest-900 md:text-5xl">
                Member-only products that support the society.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-forest-900/72">
                Shop purchases help support Prime Range Outdoor Society
                activities, member equipment, conservation projects and outdoor
                education. Products are for current PROS members and are picked
                up in person at the next society event.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  "Member-only products",
                  "Pickup at next society event",
                  "Stripe secure checkout",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-md border border-forest-900/10 bg-white p-4 text-sm font-semibold text-forest-900 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <SecureCheckoutPanel />
          </section>

          <section className="mt-10 rounded-md border border-forest-900/10 bg-white p-5 shadow-sm md:p-6">
            <p className="text-sm font-semibold uppercase text-clay">
              Important
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-forest-900">
              No postal delivery. Member pickup only.
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-forest-900/72">
              All shop items are intended for PROS members and are collected in
              person at the next society event. If you are not a current member
              and complete a purchase, PROS will contact you to discuss your
              situation and whether the product can be supplied.
            </p>
          </section>

          <section className="mt-10">
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
              <div className="mt-5 grid gap-5 md:grid-cols-2">
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
                title: "Who can buy?",
                body: "Products are intended for current PROS members. Non-member purchases are reviewed before supply.",
              },
              {
                title: "How do I receive it?",
                body: "There is no postal delivery. Items are collected in person at the next suitable society event.",
              },
              {
                title: "Who handles payment?",
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
