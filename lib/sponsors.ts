import "server-only";

import {
  createSupabaseServiceClient,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type SponsorshipTier =
  Database["public"]["Tables"]["sponsorship_tiers"]["Row"];
export type Sponsor = Database["public"]["Tables"]["sponsors"]["Row"];
export type SponsorWithTier = Sponsor & {
  tier: SponsorshipTier | null;
};

export const defaultSponsorshipTiers: SponsorshipTier[] = [
  {
    active: true,
    amount: 50000,
    benefits:
      "Sponsor listing on the PROS website\nLogo and link on the sponsors page\nRecognition in selected member communications",
    contact_required: false,
    created_at: "",
    description:
      "A practical entry tier for local businesses and community supporters who want to help PROS activities and member experiences.",
    id: "community-sponsor",
    name: "Community Sponsor",
    price_label: "$500",
    slug: "community-sponsor",
    sort_order: 10,
    updated_at: "",
  },
  {
    active: true,
    amount: 100000,
    benefits:
      "Prominent sponsor listing on the PROS website\nLogo and link on the home page sponsor section\nRecognition in selected member communications\nOpportunity to discuss tasteful activity or event recognition",
    contact_required: false,
    created_at: "",
    description:
      "A stronger annual partnership for outfitters, equipment specialists and select regional businesses aligned with responsible outdoor recreation.",
    id: "supporting-sponsor",
    name: "Supporting Sponsor",
    price_label: "$1,000",
    slug: "supporting-sponsor",
    sort_order: 20,
    updated_at: "",
  },
  {
    active: true,
    amount: null,
    benefits:
      "Priority placement on the PROS sponsors page\nFeatured recognition on the home page\nTailored acknowledgement around suitable society activities\nDirect committee discussion before confirmation",
    contact_required: true,
    created_at: "",
    description:
      "The highest-level sponsor relationship for principal partners whose values align closely with the society's direction and long-term standards.",
    id: "foundation-sponsor",
    name: "Foundation Sponsor",
    price_label: "Contact us",
    slug: "foundation-sponsor",
    sort_order: 30,
    updated_at: "",
  },
];

export function benefitsList(value: string | null) {
  return (value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function getSponsorshipTiers({
  includeInactive = false,
}: {
  includeInactive?: boolean;
} = {}) {
  if (!hasSupabaseServiceConfig()) {
    return defaultSponsorshipTiers;
  }

  let query = createSupabaseServiceClient()
    .from("sponsorship_tiers")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!includeInactive) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return defaultSponsorshipTiers;
  }

  return data;
}

function attachTier(
  sponsor: Sponsor,
  tiersById: Map<string, SponsorshipTier>,
): SponsorWithTier {
  return {
    ...sponsor,
    tier: sponsor.tier_id ? tiersById.get(sponsor.tier_id) ?? null : null,
  };
}

export async function getSponsors({
  featuredOnly = false,
  includeInactive = false,
}: {
  featuredOnly?: boolean;
  includeInactive?: boolean;
} = {}) {
  if (!hasSupabaseServiceConfig()) {
    return [] as SponsorWithTier[];
  }

  let query = createSupabaseServiceClient()
    .from("sponsors")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!includeInactive) {
    query = query.eq("active", true);
  }

  if (featuredOnly) {
    query = query.eq("featured", true);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [] as SponsorWithTier[];
  }

  const tiers = await getSponsorshipTiers({ includeInactive: true });
  const tiersById = new Map(tiers.map((tier) => [tier.id, tier]));

  return data.map((sponsor) => attachTier(sponsor, tiersById));
}

export async function getSponsorBySlug(slug: string) {
  if (!hasSupabaseServiceConfig()) {
    return null;
  }

  const { data, error } = await createSupabaseServiceClient()
    .from("sponsors")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const tiers = await getSponsorshipTiers({ includeInactive: true });
  const tiersById = new Map(tiers.map((tier) => [tier.id, tier]));

  return attachTier(data, tiersById);
}
