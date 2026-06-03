import Link from "next/link";
import type { SponsorWithTier } from "@/lib/sponsors";

type SponsorLogoMarqueeProps = {
  sponsors: SponsorWithTier[];
};

const fallbackSponsors = [
  "Community Sponsor",
  "Supporting Sponsor",
  "Foundation Sponsor",
  "Your Logo Here",
];

function SponsorLogoTile({ sponsor }: { sponsor: SponsorWithTier }) {
  return (
    <Link
      href={`/sponsorship/${sponsor.slug}`}
      className="flex h-24 w-56 shrink-0 items-center justify-center rounded-md border border-forest-900/10 bg-white px-5 shadow-sm transition hover:border-clay/40"
      aria-label={`View ${sponsor.name}`}
    >
      <span
        className="flex h-16 w-full items-center justify-center bg-contain bg-center bg-no-repeat text-center text-sm font-semibold text-forest-900"
        style={
          sponsor.logo_url
            ? { backgroundImage: `url(${sponsor.logo_url})` }
            : undefined
        }
      >
        {sponsor.logo_url ? <span className="sr-only">{sponsor.name}</span> : sponsor.name}
      </span>
    </Link>
  );
}

function FallbackLogoTile({ label }: { label: string }) {
  return (
    <div className="flex h-24 w-56 shrink-0 items-center justify-center rounded-md border border-dashed border-forest-900/18 bg-white px-5 text-center text-sm font-semibold text-forest-900/58">
      {label}
    </div>
  );
}

export function SponsorLogoMarquee({ sponsors }: SponsorLogoMarqueeProps) {
  const marqueeSponsors = sponsors.length ? sponsors : [];
  const fallbackTiles = fallbackSponsors.concat(fallbackSponsors);

  return (
    <div className="overflow-hidden border-y border-forest-900/10 bg-forest-50 py-5">
      <div className="sponsor-marquee-track flex w-max gap-4 px-4">
        {marqueeSponsors.length
          ? marqueeSponsors
              .concat(marqueeSponsors)
              .map((sponsor, index) => (
                <SponsorLogoTile
                  key={`${sponsor.id}-${index}`}
                  sponsor={sponsor}
                />
              ))
          : fallbackTiles.map((label, index) => (
              <FallbackLogoTile key={`${label}-${index}`} label={label} />
            ))}
      </div>
    </div>
  );
}
