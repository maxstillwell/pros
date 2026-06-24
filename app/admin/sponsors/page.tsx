import Link from "next/link";
import { AdminAccessNotice } from "@/components/admin/admin-access-notice";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  createSponsor,
  deleteSponsor,
  updateSponsor,
  updateSponsorshipTier,
} from "@/app/admin/sponsors/actions";
import { getAdminAccess } from "@/lib/auth/profile";
import { formatDateTime } from "@/lib/format";
import {
  getSponsors,
  getSponsorshipTiers,
  type SponsorWithTier,
  type SponsorshipTier,
} from "@/lib/sponsors";

type AdminSponsorsPageProps = {
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

function dollarsValue(amount: number | null) {
  return amount === null ? "" : String(amount / 100);
}

function isStoredImage(value: string | null | undefined) {
  return Boolean(value?.startsWith("data:image/"));
}

function TierSelect({
  selectedId,
  tiers,
}: {
  selectedId?: string | null;
  tiers: SponsorshipTier[];
}) {
  return (
    <select name="tier_id" defaultValue={selectedId ?? ""} className={inputClass}>
      <option value="">No tier</option>
      {tiers.map((tier) => (
        <option key={tier.id} value={tier.id}>
          {tier.name}
        </option>
      ))}
    </select>
  );
}

function SponsorFields({
  sponsor,
  tiers,
}: {
  sponsor?: SponsorWithTier;
  tiers: SponsorshipTier[];
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <label className={labelClass}>
        Sponsor name
        <input
          name="name"
          defaultValue={sponsor?.name ?? ""}
          required
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        URL slug
        <input
          name="slug"
          defaultValue={sponsor?.slug ?? ""}
          placeholder="auto-created from name if blank"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Sponsor tier
        <TierSelect selectedId={sponsor?.tier_id} tiers={tiers} />
      </label>
      <label className={labelClass}>
        Sort order
        <input
          name="sort_order"
          type="number"
          defaultValue={sponsor?.sort_order ?? 0}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Website URL
        <input
          name="website_url"
          type="url"
          defaultValue={sponsor?.website_url ?? ""}
          placeholder="https://example.com"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Logo URL
        <input
          name="logo_url"
          type="url"
          defaultValue={isStoredImage(sponsor?.logo_url) ? "" : (sponsor?.logo_url ?? "")}
          placeholder="https://example.com/logo.png"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Upload logo image
        <input
          name="logo_file"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="mt-2 block w-full rounded-md border border-forest-900/20 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-forest-700 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        <span className="mt-2 block text-xs font-normal leading-5 text-forest-900/58">
          PNG, JPG, WebP or GIF. Keep it under 750 KB.
        </span>
      </label>
      {sponsor?.logo_url ? (
        <div className="md:col-span-2">
          <input
            type="hidden"
            name="existing_logo_url"
            value={sponsor.logo_url}
          />
          <div className="flex flex-wrap items-center gap-4 rounded-md border border-forest-900/10 bg-forest-50 p-4">
            <div
              className="h-20 w-32 rounded-md border border-forest-900/10 bg-white bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${sponsor.logo_url})` }}
              aria-label={`${sponsor.name} logo preview`}
            />
            <label className="flex items-center gap-3 text-sm font-semibold text-forest-900">
              <input name="remove_logo" type="checkbox" />
              Remove current logo
            </label>
          </div>
        </div>
      ) : null}
      <label className={labelClass}>
        Contact name
        <input
          name="contact_name"
          defaultValue={sponsor?.contact_name ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Contact email
        <input
          name="contact_email"
          type="email"
          defaultValue={sponsor?.contact_email ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Contact phone
        <input
          name="contact_phone"
          defaultValue={sponsor?.contact_phone ?? ""}
          className={inputClass}
        />
      </label>
      <div className="grid content-end gap-3 sm:grid-cols-2">
        <label className="flex min-h-11 items-center gap-3 rounded-md border border-forest-900/10 px-3 py-2 text-sm font-semibold text-forest-900">
          <input
            name="active"
            type="checkbox"
            defaultChecked={sponsor?.active ?? true}
          />
          Active
        </label>
        <label className="flex min-h-11 items-center gap-3 rounded-md border border-forest-900/10 px-3 py-2 text-sm font-semibold text-forest-900">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={sponsor?.featured ?? false}
          />
          Featured on home
        </label>
      </div>
      <label className={`${labelClass} md:col-span-2`}>
        Short summary
        <textarea
          name="summary"
          rows={3}
          defaultValue={sponsor?.summary ?? ""}
          className={textareaClass}
        />
      </label>
      <label className={`${labelClass} md:col-span-2`}>
        Sponsor profile description
        <textarea
          name="description"
          rows={8}
          defaultValue={sponsor?.description ?? ""}
          className={textareaClass}
        />
      </label>
    </div>
  );
}

function TierFields({ tier }: { tier: SponsorshipTier }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <label className={labelClass}>
        Tier name
        <input
          name="name"
          required
          defaultValue={tier.name}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Slug
        <input
          name="slug"
          required
          defaultValue={tier.slug}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Price label
        <input
          name="price_label"
          required
          defaultValue={tier.price_label}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Amount in dollars
        <input
          name="amount_dollars"
          type="number"
          min="0"
          step="0.01"
          defaultValue={dollarsValue(tier.amount)}
          placeholder="blank for contact-only"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Sort order
        <input
          name="sort_order"
          type="number"
          defaultValue={tier.sort_order}
          className={inputClass}
        />
      </label>
      <div className="grid content-end gap-3 sm:grid-cols-2">
        <label className="flex min-h-11 items-center gap-3 rounded-md border border-forest-900/10 px-3 py-2 text-sm font-semibold text-forest-900">
          <input name="active" type="checkbox" defaultChecked={tier.active} />
          Active
        </label>
        <label className="flex min-h-11 items-center gap-3 rounded-md border border-forest-900/10 px-3 py-2 text-sm font-semibold text-forest-900">
          <input
            name="contact_required"
            type="checkbox"
            defaultChecked={tier.contact_required}
          />
          Contact required
        </label>
      </div>
      <label className={`${labelClass} md:col-span-2`}>
        Description
        <textarea
          name="description"
          rows={3}
          defaultValue={tier.description ?? ""}
          className={textareaClass}
        />
      </label>
      <label className={`${labelClass} md:col-span-2`}>
        Benefits, one per line
        <textarea
          name="benefits"
          rows={6}
          defaultValue={tier.benefits ?? ""}
          className={textareaClass}
        />
      </label>
    </div>
  );
}

export default async function AdminSponsorsPage({
  searchParams,
}: AdminSponsorsPageProps) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return <AdminAccessNotice access={access} />;
  }

  const params = await searchParams;
  const [sponsors, tiers] = await Promise.all([
    getSponsors({ includeInactive: true }),
    getSponsorshipTiers({ includeInactive: true }),
  ]);

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase text-clay">Sponsors</p>
        <h1 className="mt-2 text-3xl font-semibold text-forest-900">
          Sponsor management
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-forest-900/70">
          Add sponsors for the public sponsor pages, choose which ones appear on
          the home page, and edit the three sponsorship levels.
        </p>
      </div>

      {params.saved ? (
        <div className="mt-6 rounded-md border border-forest-700/20 bg-white p-4 text-sm font-medium text-forest-900">
          Sponsor update saved.
        </div>
      ) : null}

      {params.error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          Sponsor update failed.
        </div>
      ) : null}

      <section className="mt-8 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-xl font-semibold text-forest-900">
              Create sponsor
            </h2>
            <p className="mt-2 text-sm leading-6 text-forest-900/70">
              Add the sponsor first, then mark it featured if it should appear
              on the home page.
            </p>
          </div>
          <Link
            href="/sponsorship"
            className="text-sm font-semibold text-clay hover:text-forest-900"
          >
            View public page
          </Link>
        </div>
        <form className="mt-6">
          <SponsorFields tiers={tiers} />
          <button formAction={createSponsor} className={`${primaryButtonClass} mt-6`}>
            Create Sponsor
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-forest-900">
          Current sponsors
        </h2>
        <div className="mt-4 grid gap-5">
          {sponsors.length ? (
            sponsors.map((sponsor) => (
              <article
                key={sponsor.id}
                className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-semibold uppercase text-clay">
                      {sponsor.tier?.name ?? "No tier"}{" "}
                      {sponsor.featured ? "- Featured" : ""}
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold text-forest-900">
                      {sponsor.name}
                    </h3>
                    <p className="mt-2 text-xs text-forest-900/58">
                      Created {formatDateTime(sponsor.created_at)} | Updated{" "}
                      {formatDateTime(sponsor.updated_at)}
                    </p>
                  </div>
                  <Link
                    href={`/sponsorship/${sponsor.slug}`}
                    className="text-sm font-semibold text-clay hover:text-forest-900"
                  >
                    View profile
                  </Link>
                </div>

                <form className="mt-6">
                  <input type="hidden" name="id" value={sponsor.id} />
                  <SponsorFields sponsor={sponsor} tiers={tiers} />
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button formAction={updateSponsor} className={primaryButtonClass}>
                      Save Sponsor
                    </button>
                  </div>
                </form>

                <form className="mt-4">
                  <input type="hidden" name="id" value={sponsor.id} />
                  <ConfirmSubmitButton
                    formAction={deleteSponsor}
                    message="Delete this sponsor permanently?"
                    className={dangerButtonClass}
                  >
                    Delete Sponsor
                  </ConfirmSubmitButton>
                </form>
              </article>
            ))
          ) : (
            <div className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
              <p className="text-sm leading-6 text-forest-900/70">
                No sponsors have been added yet.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-clay">
              Sponsor tiers
            </p>
            <h2 className="mt-2 text-xl font-semibold text-forest-900">
              Edit sponsorship levels
            </h2>
          </div>
          <Link
            href="/sponsorship/become"
            className="text-sm font-semibold text-clay hover:text-forest-900"
          >
            View sponsor conditions
          </Link>
        </div>

        <div className="mt-4 grid gap-5">
          {tiers.map((tier) => (
            <form
              key={tier.id}
              className="rounded-md border border-forest-900/10 bg-white p-6 shadow-sm"
            >
              <input type="hidden" name="id" value={tier.id} />
              <TierFields tier={tier} />
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  formAction={updateSponsorshipTier}
                  className={primaryButtonClass}
                >
                  Save Tier
                </button>
                <Link href="/sponsorship/become" className={secondaryButtonClass}>
                  Preview Conditions
                </Link>
              </div>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
