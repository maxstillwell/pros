import Link from "next/link";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  updateShopOrderPickupStatus,
} from "@/app/admin/products/actions";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { getAdminAccess } from "@/lib/auth/profile";
import { formatDateTime } from "@/lib/format";
import {
  defaultPickupNote,
  formatProductPrice,
  getProducts,
  getShopOrders,
  type Product,
  type ShopOrder,
} from "@/lib/shop";
import type { ShopPickupStatus } from "@/types/database";

type AdminProductsPageProps = {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

const inputClass =
  "mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20";
const textareaClass =
  "mt-2 w-full rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20";
const labelClass = "block text-sm font-semibold text-forest-900";
const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900";
const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-forest-50";
const dangerButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800";

const pickupStatuses: { label: string; value: ShopPickupStatus }[] = [
  { label: "Pending event pickup", value: "pending_event_pickup" },
  { label: "Ready for pickup", value: "ready_for_pickup" },
  { label: "Picked up", value: "picked_up" },
  { label: "Contact required", value: "contact_required" },
  { label: "Cancelled", value: "cancelled" },
];

function dollarsValue(amount: number | null) {
  return amount === null ? "" : String(amount / 100);
}

function moneyValue(amount: number, currency = "aud") {
  return new Intl.NumberFormat("en-AU", {
    currency: currency.toUpperCase(),
    style: "currency",
  }).format(amount / 100);
}

function savedMessage(value: string) {
  const messages: Record<string, string> = {
    "pickup-updated": "Pickup status updated.",
    "product-created": "Product created.",
    "product-deleted": "Product deleted.",
    "product-updated": "Product updated.",
  };

  return messages[value] ?? "Product update saved.";
}

function errorMessage(value: string) {
  const messages: Record<string, string> = {
    "image-size": "Image is too large. Keep it under 1.2 MB.",
    "image-type": "Image must be PNG, JPG, WebP or GIF.",
    "missing-id": "Missing product or order id.",
    "pickup-status": "Pickup status is not valid.",
    "pickup-update": "Pickup status could not be updated.",
    "product-create": "Product could not be created.",
    "product-delete": "Product could not be deleted.",
    "product-required": "Product name and price are required.",
    "product-update": "Product could not be updated.",
  };

  return messages[value] ?? "Product update failed.";
}

function ProductFields({ product }: { product?: Product }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <label className={labelClass}>
        Product name
        <input
          name="name"
          required
          defaultValue={product?.name ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Price in dollars
        <input
          name="price_dollars"
          type="number"
          min="0.01"
          step="0.01"
          required
          defaultValue={dollarsValue(product?.price ?? null)}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Sort order
        <input
          name="sort_order"
          type="number"
          defaultValue={product?.sort_order ?? 0}
          className={inputClass}
        />
      </label>
      <div className="grid content-end gap-3">
        <label className="flex min-h-11 items-center gap-3 rounded-md border border-forest-900/10 px-3 py-2 text-sm font-semibold text-forest-900">
          <input
            name="active"
            type="checkbox"
            defaultChecked={product?.active ?? true}
          />
          Active on shop
        </label>
      </div>
      <label className={labelClass}>
        Image URL
        <input
          name="image_url"
          type="url"
          defaultValue={
            product?.image_url?.startsWith("data:image/")
              ? ""
              : (product?.image_url ?? "")
          }
          placeholder="https://example.com/product.jpg"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Upload product image
        <input
          name="image_file"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="mt-2 block w-full rounded-md border border-forest-900/20 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-forest-700 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        <span className="mt-2 block text-xs font-normal leading-5 text-forest-900/58">
          PNG, JPG, WebP or GIF. Keep it under 1.2 MB.
        </span>
      </label>
      {product?.image_url ? (
        <div className="md:col-span-2">
          <input
            type="hidden"
            name="existing_image_url"
            value={product.image_url}
          />
          <div className="flex flex-wrap items-center gap-4 rounded-md border border-forest-900/10 bg-forest-50 p-4">
            <div
              className="h-24 w-40 rounded-md border border-forest-900/10 bg-white bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${product.image_url})` }}
              aria-label={`${product.name} preview`}
            />
            <label className="flex items-center gap-3 text-sm font-semibold text-forest-900">
              <input name="remove_image" type="checkbox" />
              Remove current image
            </label>
          </div>
        </div>
      ) : null}
      <label className={`${labelClass} md:col-span-2`}>
        Description
        <textarea
          name="description"
          rows={5}
          defaultValue={product?.description ?? ""}
          className={textareaClass}
        />
      </label>
      <label className={`${labelClass} md:col-span-2`}>
        Pickup note
        <textarea
          name="pickup_note"
          rows={3}
          defaultValue={product?.pickup_note ?? defaultPickupNote}
          className={textareaClass}
        />
      </label>
    </div>
  );
}

function OrderList({ orders }: { orders: ShopOrder[] }) {
  return (
    <section id="orders" className="mt-10">
      <div>
        <p className="text-sm font-semibold uppercase text-clay">Shop orders</p>
        <h2 className="mt-2 text-xl font-semibold text-forest-900">
          Pickup and payment records
        </h2>
      </div>
      <div className="mt-4 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
        {orders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[76rem] text-left text-sm">
              <thead className="border-b border-forest-900/10 text-forest-900/60">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Product</th>
                  <th className="py-3 pr-4 font-semibold">Customer</th>
                  <th className="py-3 pr-4 font-semibold">Member #</th>
                  <th className="py-3 pr-4 font-semibold">Amount</th>
                  <th className="py-3 pr-4 font-semibold">Payment</th>
                  <th className="py-3 pr-4 font-semibold">Pickup</th>
                  <th className="py-3 pr-4 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-forest-900/10 last:border-b-0"
                  >
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-forest-900">
                        {order.product_name}
                      </p>
                      <p className="mt-1 text-xs text-forest-900/58">
                        Qty {order.quantity}
                      </p>
                    </td>
                    <td className="py-4 pr-4 text-forest-900/70">
                      <p>{order.customer_name ?? "Not provided yet"}</p>
                      <p className="mt-1 text-xs">{order.customer_email}</p>
                      {order.customer_phone ? (
                        <p className="mt-1 text-xs">{order.customer_phone}</p>
                      ) : null}
                    </td>
                    <td className="py-4 pr-4 text-forest-900/70">
                      {order.member_number ?? "Check manually"}
                    </td>
                    <td className="py-4 pr-4 font-semibold text-forest-900">
                      {moneyValue(order.amount, order.currency)}
                    </td>
                    <td className="py-4 pr-4 text-forest-900/70">
                      {order.status}
                    </td>
                    <td className="py-4 pr-4">
                      <form className="flex items-center gap-2">
                        <input type="hidden" name="id" value={order.id} />
                        <select
                          name="pickup_status"
                          defaultValue={order.pickup_status}
                          className="min-h-10 rounded-md border border-forest-900/20 px-3 py-2 text-sm outline-none focus:border-forest-700"
                        >
                          {pickupStatuses.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        <button
                          formAction={updateShopOrderPickupStatus}
                          className={secondaryButtonClass}
                        >
                          Save
                        </button>
                      </form>
                    </td>
                    <td className="py-4 pr-4 text-forest-900/70">
                      {formatDateTime(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm leading-6 text-forest-900/70">
            No shop orders yet.
          </p>
        )}
      </div>
    </section>
  );
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  const params = await searchParams;
  const [products, orders] = await Promise.all([
    getProducts({ includeInactive: true }),
    getShopOrders(),
  ]);

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-clay">Products</p>
          <h1 className="mt-2 text-3xl font-semibold text-forest-900">
            Shop management
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-forest-900/70">
            Manage member-only products. Shop checkout is pickup-only at the
            next society event, with payment handled securely by Stripe.
          </p>
        </div>
        <Link href="/shop" className={secondaryButtonClass}>
          View Shop
        </Link>
      </div>

      {params.saved ? (
        <div className="mt-6 rounded-md border border-forest-700/20 bg-white p-4 text-sm font-medium text-forest-900">
          {savedMessage(params.saved)}
        </div>
      ) : null}

      {params.error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {errorMessage(params.error)}
        </div>
      ) : null}

      <section className="mt-8 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-forest-900">Create product</h2>
        <form className="mt-6">
          <ProductFields />
          <button formAction={createProduct} className={`${primaryButtonClass} mt-6`}>
            Create Product
          </button>
        </form>
      </section>

      <section className="mt-10">
        <div>
          <p className="text-sm font-semibold uppercase text-clay">
            Current products
          </p>
          <h2 className="mt-2 text-xl font-semibold text-forest-900">
            Edit shop products
          </h2>
        </div>
        <div className="mt-4 grid gap-5">
          {products.length ? (
            products.map((product) => (
              <article
                key={product.id}
                className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-semibold uppercase text-clay">
                      {product.active ? "Active" : "Hidden"} ·{" "}
                      {formatProductPrice(product)}
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold text-forest-900">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-xs text-forest-900/58">
                      Created {formatDateTime(product.created_at)} | Updated{" "}
                      {formatDateTime(product.updated_at)}
                    </p>
                  </div>
                  {product.image_url ? (
                    <div
                      className="h-24 w-40 rounded-md border border-forest-900/10 bg-forest-50 bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${product.image_url})` }}
                      aria-label={`${product.name} image`}
                    />
                  ) : null}
                </div>
                <form className="mt-6">
                  <input type="hidden" name="id" value={product.id} />
                  <ProductFields product={product} />
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button formAction={updateProduct} className={primaryButtonClass}>
                      Save Product
                    </button>
                  </div>
                </form>
                <form className="mt-4">
                  <input type="hidden" name="id" value={product.id} />
                  <ConfirmSubmitButton
                    formAction={deleteProduct}
                    message="Delete this product permanently?"
                    className={dangerButtonClass}
                  >
                    Delete Product
                  </ConfirmSubmitButton>
                </form>
              </article>
            ))
          ) : (
            <div className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
              <p className="text-sm leading-6 text-forest-900/70">
                No products have been added yet.
              </p>
            </div>
          )}
        </div>
      </section>

      <OrderList orders={orders} />
    </div>
  );
}
