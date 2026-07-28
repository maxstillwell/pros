"use client";

import { useMemo, useState } from "react";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];

type ShopCheckoutFormProps = {
  products: Product[];
};

const defaultPickupNote =
  "Member-only pickup at the next PROS society event. No postal delivery is available.";

function formatMoney(amount: number, currency = "aud") {
  return new Intl.NumberFormat("en-AU", {
    currency: currency.toUpperCase(),
    style: "currency",
  }).format(amount / 100);
}

function productPrice(product: Product) {
  return product.price === null
    ? "Contact PROS"
    : formatMoney(product.price, product.currency);
}

function ProductImage({ product }: { product: Product }) {
  if (product.image_url) {
    return (
      <div
        className="h-24 w-28 shrink-0 rounded-md border border-forest-900/10 bg-forest-50 bg-contain bg-center bg-no-repeat sm:h-28 sm:w-36"
        style={{ backgroundImage: `url(${product.image_url})` }}
        aria-label={`${product.name} image`}
      />
    );
  }

  return (
    <div className="flex h-24 w-28 shrink-0 items-center justify-center rounded-md border border-forest-900/10 bg-forest-50 px-3 text-center text-xs font-semibold uppercase text-forest-900/45 sm:h-28 sm:w-36">
      PROS product
    </div>
  );
}

export function ShopCheckoutForm({ products }: ShopCheckoutFormProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const selectedProducts = useMemo(
    () =>
      products.filter((product) => selected[product.id] && product.price !== null),
    [products, selected],
  );
  const total = selectedProducts.reduce((sum, product) => {
    const quantity = quantities[product.id] ?? 1;
    return sum + (product.price ?? 0) * quantity;
  }, 0);
  const hasSelection = total > 0;

  return (
    <form
      action="/api/stripe/create-shop-checkout-session"
      method="post"
      className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start"
    >
      <div className="grid gap-4">
        {products.map((product) => {
          const canBuy = product.price !== null;
          const isSelected = Boolean(selected[product.id]);
          const quantity = quantities[product.id] ?? 1;

          return (
            <article
              key={product.id}
              className={`rounded-md border bg-white p-4 shadow-sm transition ${
                isSelected
                  ? "border-forest-700 ring-2 ring-forest-700/12"
                  : "border-forest-900/10"
              }`}
            >
              <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-start">
                <div className="flex items-start gap-4">
                  <input
                    id={`product-${product.id}`}
                    name="product_id"
                    type="checkbox"
                    value={product.id}
                    checked={isSelected}
                    disabled={!canBuy}
                    onChange={(event) => {
                      setSelected((current) => ({
                        ...current,
                        [product.id]: event.target.checked,
                      }));
                    }}
                    className="mt-2 h-5 w-5 rounded border-forest-900/30 text-forest-700"
                  />
                  <ProductImage product={product} />
                </div>

                <label htmlFor={`product-${product.id}`} className="block">
                  <p className="text-xs font-semibold uppercase text-clay">
                    Member-only pickup
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-forest-900">
                    {product.name}
                  </h2>
                  <p className="mt-2 text-2xl font-semibold text-forest-900">
                    {productPrice(product)}
                  </p>
                  {product.description ? (
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-forest-900/70">
                      {product.description}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs leading-5 text-forest-900/58">
                    {product.pickup_note || defaultPickupNote}
                  </p>
                </label>

                <label className="block text-sm font-semibold text-forest-900 sm:w-24">
                  Qty
                  <input
                    name={`quantity_${product.id}`}
                    type="number"
                    min="1"
                    max="99"
                    value={quantity}
                    disabled={!isSelected}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      setQuantities((current) => ({
                        ...current,
                        [product.id]: Number.isFinite(next)
                          ? Math.min(Math.max(Math.round(next), 1), 99)
                          : 1,
                      }));
                    }}
                    className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 bg-white px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20 disabled:bg-forest-50 disabled:text-forest-900/45"
                  />
                </label>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="rounded-md border border-forest-900/10 bg-white p-5 shadow-sm lg:sticky lg:top-6">
        <p className="text-sm font-semibold uppercase text-clay">Checkout</p>
        <h2 className="mt-2 text-2xl font-semibold text-forest-900">
          Member details
        </h2>

        <div className="mt-5 grid gap-3">
          <label className="block text-sm font-semibold text-forest-900">
            Full name
            <input
              name="customer_name"
              required
              autoComplete="name"
              className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 bg-white px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
            />
          </label>
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

        <div className="mt-6 rounded-md border border-forest-900/10 bg-stone p-4">
          <div className="flex justify-between gap-4 text-sm">
            <span className="font-semibold text-forest-900">Selected items</span>
            <span className="font-semibold text-forest-900">
              {selectedProducts.length}
            </span>
          </div>
          <div className="mt-3 grid gap-2">
            {selectedProducts.length ? (
              selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between gap-3 text-xs leading-5 text-forest-900/70"
                >
                  <span>
                    {product.name} x {quantities[product.id] ?? 1}
                  </span>
                  <span className="font-semibold text-forest-900">
                    {formatMoney(
                      (product.price ?? 0) * (quantities[product.id] ?? 1),
                      product.currency,
                    )}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs leading-5 text-forest-900/58">
                Select at least one product to continue.
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-forest-900/10 pt-4">
            <span className="text-sm font-semibold text-forest-900">Total</span>
            <span className="text-2xl font-semibold text-forest-900">
              {formatMoney(total)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!hasSelection}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-red-700 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-900/35"
        >
          Secure checkout
        </button>
        <p className="mt-3 text-xs leading-5 text-forest-900/60">
          Payment opens Stripe Checkout. Orders are created only after payment
          succeeds.
        </p>
      </aside>
    </form>
  );
}
