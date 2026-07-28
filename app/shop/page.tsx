import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import {
  defaultPickupNote,
  formatProductPrice,
  getProducts,
  type Product,
} from "@/lib/shop";

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M7 10V8a5 5 0 0 1 10 0v2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M6 10h12v10H6z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M12 14v2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m5 12 4 4L19 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function PaymentMark({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "blue" | "dark" | "green" | "neutral";
}) {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    dark: "border-forest-900 bg-forest-900 text-white",
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
    neutral: "border-forest-900/12 bg-white text-forest-900",
  };

  return (
    <span
      className={`inline-flex min-h-9 items-center justify-center rounded-md border px-3 text-xs font-black uppercase tracking-wide shadow-sm ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function SecureCheckoutPanel() {
  const points = [
    "Card details are handled inside Stripe Checkout.",
    "PROS never stores or sees your card number.",
    "No postage. Pickup is at the next society event.",
  ];

  return (
    <aside className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-700 text-white">
          <LockIcon />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-clay">
            Secure checkout
          </p>
          <h2 className="mt-1 text-xl font-semibold leading-tight text-forest-900">
            Pay securely through Stripe.
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {points.map((point) => (
          <div key={point} className="flex gap-3 text-sm leading-6 text-forest-900/75">
            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-700/10 text-forest-700">
              <CheckIcon />
            </span>
            <span>{point}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-md border border-forest-900/10 bg-stone p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-clay">
          Checkout options
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
          <PaymentMark tone="blue">Visa</PaymentMark>
          <PaymentMark tone="neutral">Mastercard</PaymentMark>
          <PaymentMark tone="blue">Amex</PaymentMark>
          <PaymentMark tone="dark">Apple Pay</PaymentMark>
          <PaymentMark tone="neutral">Google Pay</PaymentMark>
          <PaymentMark tone="green">Stripe</PaymentMark>
        </div>
        <p className="mt-3 text-xs leading-5 text-forest-900/60">
          Available methods are shown by Stripe at checkout and may depend on
          your device and Stripe account settings.
        </p>
      </div>

      <p className="mt-5 text-xs leading-5 text-forest-900/60">
        Sold by Prime Range Outdoor Society Inc. ABN 43 632 785 626. Prices are
        in AUD.
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
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-semibold text-forest-900">
              Secure Stripe checkout
            </span>
            <span className="font-semibold text-forest-900">
              {formatProductPrice(product)}
            </span>
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
          <section className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase text-clay">
                PROS member shop
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-forest-900 md:text-5xl">
                Member products with secure pickup-only checkout.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-forest-900/72">
                Shop purchases help support Prime Range Outdoor Society
                activities, member equipment, conservation projects and outdoor
                education. Products are for current PROS members and are picked
                up in person at the next society event.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  "Member eligibility checked",
                  "No postal delivery",
                  "Stripe handles payment",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-md border border-forest-900/10 bg-white p-4 text-sm font-semibold text-forest-900 shadow-sm"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-700/10 text-forest-700">
                      <CheckIcon />
                    </span>
                    <span>{item}</span>
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
