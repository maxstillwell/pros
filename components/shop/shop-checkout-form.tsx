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

function clampQuantity(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(Math.max(Math.round(value), 1), 99);
}

function ProductImageButton({
  onOpen,
  product,
}: {
  onOpen: (product: Product) => void;
  product: Product;
}) {
  if (!product.image_url) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-t-md bg-forest-50 px-5 text-center text-sm font-semibold uppercase text-forest-900/45">
        PROS product
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      className="group relative block aspect-[4/3] w-full overflow-hidden rounded-t-md bg-forest-50 text-left"
      aria-label={`Open larger image of ${product.name}`}
    >
      <span
        className="absolute inset-0 bg-contain bg-center bg-no-repeat transition duration-300 group-hover:scale-[1.03]"
        style={{ backgroundImage: `url(${product.image_url})` }}
      />
      <span className="absolute right-3 top-3 rounded-md bg-white/92 px-3 py-2 text-xs font-semibold text-forest-900 shadow-sm transition group-hover:bg-forest-900 group-hover:text-white">
        View image
      </span>
    </button>
  );
}

function ProductImageModal({
  onClose,
  product,
}: {
  onClose: () => void;
  product: Product | null;
}) {
  if (!product?.image_url) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-forest-900/78"
        onClick={onClose}
        aria-label="Close product image"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} image`}
        className="relative w-full max-w-5xl rounded-md bg-white p-4 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-clay">
              Product image
            </p>
            <h2 className="mt-1 text-xl font-semibold text-forest-900">
              {product.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-forest-900/15 px-3 py-2 text-sm font-semibold text-forest-900 transition hover:bg-forest-50"
          >
            Close
          </button>
        </div>
        <div
          className="mt-4 h-[72vh] max-h-[46rem] min-h-[20rem] rounded-md border border-forest-900/10 bg-forest-50 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${product.image_url})` }}
        />
      </div>
    </div>
  );
}

export function ShopCheckoutForm({ products }: ShopCheckoutFormProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [openImage, setOpenImage] = useState<Product | null>(null);
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

  function updateQuantity(productId: string, value: number) {
    setQuantities((current) => ({
      ...current,
      [productId]: clampQuantity(value),
    }));
  }

  function adjustQuantity(productId: string, delta: number) {
    const current = quantities[productId] ?? 1;
    updateQuantity(productId, current + delta);
  }

  return (
    <>
      <form
        action="/api/stripe/create-shop-checkout-session"
        method="post"
        className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {products.map((product) => {
            const canBuy = product.price !== null;
            const isSelected = Boolean(selected[product.id]);
            const quantity = quantities[product.id] ?? 1;
            const description = product.description?.trim() ?? "";
            const hasLongDescription = description.length > 260;
            const isExpanded = Boolean(expanded[product.id]);

            return (
              <article
                key={product.id}
                className={`overflow-hidden rounded-md border bg-white shadow-sm transition ${
                  isSelected
                    ? "border-forest-700 shadow-md ring-2 ring-forest-700/12"
                    : "border-forest-900/10 hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <ProductImageButton product={product} onOpen={setOpenImage} />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-clay">
                        Member-only pickup
                      </p>
                      <h2 className="mt-1 text-xl font-semibold leading-7 text-forest-900">
                        {product.name}
                      </h2>
                    </div>
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
                      className="mt-1 h-5 w-5 shrink-0 rounded border-forest-900/30 text-forest-700"
                    />
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-4">
                    <p className="text-2xl font-semibold text-forest-900">
                      {productPrice(product)}
                    </p>
                    <label
                      htmlFor={`product-${product.id}`}
                      className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition ${
                        isSelected
                          ? "border-forest-700 bg-forest-700 text-white"
                          : "border-forest-900/20 text-forest-900 hover:bg-forest-50"
                      } ${!canBuy ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </label>
                  </div>

                  {description ? (
                    <div className="mt-4">
                      <p
                        className={`whitespace-pre-line text-sm leading-6 text-forest-900/70 ${
                          hasLongDescription && !isExpanded
                            ? "max-h-32 overflow-hidden"
                            : ""
                        }`}
                      >
                        {description}
                      </p>
                      {hasLongDescription ? (
                        <button
                          type="button"
                          onClick={() => {
                            setExpanded((current) => ({
                              ...current,
                              [product.id]: !isExpanded,
                            }));
                          }}
                          className="mt-2 text-sm font-semibold text-clay hover:text-forest-900"
                        >
                          {isExpanded ? "Show less" : "Show more"}
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-5 grid gap-4 border-t border-forest-900/10 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
                    <p className="text-xs leading-5 text-forest-900/58">
                      {product.pickup_note || defaultPickupNote}
                    </p>
                    <div>
                      <p className="text-xs font-semibold uppercase text-forest-900/58">
                        Qty
                      </p>
                      <div className="mt-2 flex h-11 overflow-hidden rounded-md border border-forest-900/20 bg-white">
                        <button
                          type="button"
                          disabled={!isSelected}
                          onClick={() => adjustQuantity(product.id, -1)}
                          className="w-10 font-semibold text-forest-900 transition hover:bg-forest-50 disabled:cursor-not-allowed disabled:text-forest-900/30"
                          aria-label={`Decrease ${product.name} quantity`}
                        >
                          -
                        </button>
                        <input
                          name={`quantity_${product.id}`}
                          type="number"
                          min="1"
                          max="99"
                          value={quantity}
                          disabled={!isSelected}
                          onChange={(event) => {
                            updateQuantity(product.id, Number(event.target.value));
                          }}
                          className="w-14 border-x border-forest-900/10 text-center text-sm font-semibold outline-none disabled:bg-forest-50 disabled:text-forest-900/45"
                        />
                        <button
                          type="button"
                          disabled={!isSelected}
                          onClick={() => adjustQuantity(product.id, 1)}
                          className="w-10 font-semibold text-forest-900 transition hover:bg-forest-50 disabled:cursor-not-allowed disabled:text-forest-900/30"
                          aria-label={`Increase ${product.name} quantity`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="rounded-md border border-forest-900/10 bg-white p-5 shadow-sm xl:sticky xl:top-6">
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
              <span className="font-semibold text-forest-900">
                Selected items
              </span>
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

      <ProductImageModal product={openImage} onClose={() => setOpenImage(null)} />
    </>
  );
}
