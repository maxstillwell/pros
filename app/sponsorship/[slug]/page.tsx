import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { getSponsorBySlug } from "@/lib/sponsors";

type SponsorDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function contactHref(email: string | null) {
  return email ? `mailto:${email}` : null;
}

export default async function SponsorDetailPage({
  params,
}: SponsorDetailPageProps) {
  const { slug } = await params;
  const sponsor = await getSponsorBySlug(slug);

  if (!sponsor) {
    notFound();
  }

  return (
    <SiteShell>
      <main className="px-5 py-16">
        <article className="mx-auto max-w-5xl">
          <Link
            href="/sponsorship"
            className="text-sm font-semibold text-clay hover:text-forest-900"
          >
            Back to sponsorship
          </Link>

          <div className="mt-8 grid gap-8 rounded-md border border-forest-900/10 bg-white p-6 shadow-sm lg:grid-cols-[17rem_1fr]">
            <div>
              <div
                className="flex aspect-square w-full items-center justify-center rounded-md border border-forest-900/10 bg-forest-50 bg-contain bg-center bg-no-repeat"
                style={
                  sponsor.logo_url
                    ? { backgroundImage: `url(${sponsor.logo_url})` }
                    : undefined
                }
                aria-label={
                  sponsor.logo_url ? `${sponsor.name} logo` : undefined
                }
              >
                {sponsor.logo_url ? (
                  <span className="sr-only">{sponsor.name} logo</span>
                ) : (
                  <span className="text-5xl font-semibold text-clay">
                    {sponsor.name.slice(0, 1)}
                  </span>
                )}
              </div>
              {sponsor.tier ? (
                <div className="mt-4 rounded-md border border-forest-900/10 bg-forest-50 p-4">
                  <p className="text-xs font-semibold uppercase text-clay">
                    Sponsor level
                  </p>
                  <p className="mt-1 text-base font-semibold text-forest-900">
                    {sponsor.tier.name}
                  </p>
                  <p className="mt-1 text-sm text-forest-900/68">
                    {sponsor.tier.price_label}
                  </p>
                </div>
              ) : null}
            </div>

            <div>
              <p className="text-sm font-semibold uppercase text-clay">
                PROS Sponsor
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-forest-900">
                {sponsor.name}
              </h1>
              {sponsor.summary ? (
                <p className="mt-5 text-lg leading-8 text-forest-900/74">
                  {sponsor.summary}
                </p>
              ) : null}
              {sponsor.description ? (
                <div className="mt-6 whitespace-pre-line border-t border-forest-900/10 pt-6 text-base leading-8 text-forest-900/76">
                  {sponsor.description}
                </div>
              ) : (
                <p className="mt-6 border-t border-forest-900/10 pt-6 text-base leading-8 text-forest-900/76">
                  This sponsor supports Prime Range Outdoor Society Inc. and
                  its responsible, member-focused outdoor activities.
                </p>
              )}

              <div className="mt-8 grid gap-3 text-sm text-forest-900/72">
                {sponsor.contact_name ? (
                  <p>
                    <span className="font-semibold text-forest-900">
                      Contact:
                    </span>{" "}
                    {sponsor.contact_name}
                  </p>
                ) : null}
                {sponsor.contact_email ? (
                  <p>
                    <span className="font-semibold text-forest-900">
                      Email:
                    </span>{" "}
                    <a
                      href={contactHref(sponsor.contact_email) ?? undefined}
                      className="font-semibold text-clay hover:text-forest-900"
                    >
                      {sponsor.contact_email}
                    </a>
                  </p>
                ) : null}
                {sponsor.contact_phone ? (
                  <p>
                    <span className="font-semibold text-forest-900">
                      Phone:
                    </span>{" "}
                    {sponsor.contact_phone}
                  </p>
                ) : null}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {sponsor.website_url ? (
                  <a
                    href={sponsor.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
                  >
                    Visit Website
                  </a>
                ) : null}
                <Link
                  href="/sponsorship/become"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest-900/20 px-5 py-3 text-sm font-semibold text-forest-900 transition hover:bg-forest-50"
                >
                  Become a Sponsor
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>
    </SiteShell>
  );
}
