create table if not exists public.sponsorship_tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  price_label text not null,
  amount integer,
  description text,
  benefits text,
  contact_required boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  tier_id uuid references public.sponsorship_tiers(id) on delete set null,
  summary text,
  description text,
  website_url text,
  logo_url text,
  contact_name text,
  contact_email text,
  contact_phone text,
  active boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.sponsorship_tiers (
  name,
  slug,
  price_label,
  amount,
  description,
  benefits,
  contact_required,
  active,
  sort_order
)
values
  (
    'Community Sponsor',
    'community-sponsor',
    '$500',
    50000,
    'A practical entry tier for local businesses and community supporters who want to help PROS activities and member experiences.',
    'Sponsor listing on the PROS website
Logo and link on the sponsors page
Recognition in selected member communications',
    false,
    true,
    10
  ),
  (
    'Supporting Sponsor',
    'supporting-sponsor',
    '$1,000',
    100000,
    'A stronger annual partnership for outfitters, equipment specialists and select regional businesses aligned with responsible outdoor recreation.',
    'Prominent sponsor listing on the PROS website
Logo and link on the home page sponsor section
Recognition in selected member communications
Opportunity to discuss tasteful activity or event recognition',
    false,
    true,
    20
  ),
  (
    'Foundation Sponsor',
    'foundation-sponsor',
    'Contact us',
    null,
    'The highest-level sponsor relationship for principal partners whose values align closely with the society''s direction and long-term standards.',
    'Priority placement on the PROS sponsors page
Featured recognition on the home page
Tailored acknowledgement around suitable society activities
Direct committee discussion before confirmation',
    true,
    true,
    30
  )
on conflict (slug) do nothing;

create index if not exists sponsorship_tiers_active_sort_order_idx
  on public.sponsorship_tiers(active, sort_order);

create index if not exists sponsors_active_featured_sort_order_idx
  on public.sponsors(active, featured, sort_order);

create index if not exists sponsors_tier_id_idx on public.sponsors(tier_id);

drop trigger if exists sponsorship_tiers_set_updated_at on public.sponsorship_tiers;
create trigger sponsorship_tiers_set_updated_at
before update on public.sponsorship_tiers
for each row execute function public.set_updated_at();

drop trigger if exists sponsors_set_updated_at on public.sponsors;
create trigger sponsors_set_updated_at
before update on public.sponsors
for each row execute function public.set_updated_at();

alter table public.sponsorship_tiers enable row level security;
alter table public.sponsors enable row level security;

drop policy if exists "Active sponsorship tiers are readable publicly"
  on public.sponsorship_tiers;
create policy "Active sponsorship tiers are readable publicly"
on public.sponsorship_tiers for select
using (active is true);

drop policy if exists "Sponsorship tiers are manageable by admins"
  on public.sponsorship_tiers;
create policy "Sponsorship tiers are manageable by admins"
on public.sponsorship_tiers for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Active sponsors are readable publicly" on public.sponsors;
create policy "Active sponsors are readable publicly"
on public.sponsors for select
using (active is true);

drop policy if exists "Sponsors are manageable by admins" on public.sponsors;
create policy "Sponsors are manageable by admins"
on public.sponsors for all
using (public.is_admin())
with check (public.is_admin());
