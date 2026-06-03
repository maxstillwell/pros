import Link from "next/link";
import type { SponsorWithTier } from "@/lib/sponsors";

type SponsorCardProps = {
  sponsor: SponsorWithTier;
};

export function SponsorCard({ sponsor }: SponsorCardProps) {
  return (
    <article className="flex h-full flex-col rounded-md border border-forest-900/10 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-forest-900/10 bg-forest-50 bg-contain bg-center bg-no-repeat"
          style={
            sponsor.logo_url
              ? { backgroundImage: `url(${sponsor.logo_url})` }
              : undefined
          }
          aria-label={sponsor.logo_url ? `${sponsor.name} logo` : undefined}
        >
          {sponsor.logo_url ? (
            <span className="sr-only">{sponsor.name} logo</span>
          ) : (
            <span className="text-lg font-semibold text-clay">
              {sponsor.name.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-clay">
            {sponsor.tier?.name ?? "PROS Sponsor"}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-forest-900">
            {sponsor.name}
          </h3>
        </div>
      </div>

      {sponsor.summary ? (
        <p className="mt-4 flex-1 text-sm leading-6 text-forest-900/72">
          {sponsor.summary}
        </p>
      ) : (
        <p className="mt-4 flex-1 text-sm leading-6 text-forest-900/72">
          A recognised PROS sponsor supporting responsible outdoor recreation
          and member experiences.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
        <Link href={`/sponsors/${sponsor.slug}`} className="text-clay hover:text-forest-900">
          View sponsor
        </Link>
        {sponsor.website_url ? (
          <a
            href={sponsor.website_url}
            target="_blank"
            rel="noreferrer"
            className="text-forest-900/68 hover:text-forest-900"
          >
            Website
          </a>
        ) : null}
      </div>
    </article>
  );
}
