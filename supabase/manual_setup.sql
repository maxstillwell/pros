-- PROS manual Supabase setup
-- Paste this whole file into Supabase SQL Editor for a new PROS project.
-- It is safe to run again: tables, columns, indexes, functions, triggers, and
-- policies use if-not-exists or are recreated deliberately.

create extension if not exists pgcrypto;

create sequence if not exists public.pros_member_number_seq start 1;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  email text unique not null,
  full_name text,
  phone text,
  member_number text unique,
  role text not null default 'member' check (role in ('admin', 'member')),
  membership_status text not null default 'pending' check (
    membership_status in (
      'pending',
      'approved',
      'active',
      'expired',
      'cancelled',
      'rejected'
    )
  ),
  payment_status text not null default 'not_required' check (
    payment_status in (
      'not_required',
      'pending_payment',
      'paid',
      'failed',
      'refunded',
      'cancelled'
    )
  ),
  stripe_customer_id text,
  stripe_subscription_id text,
  membership_started_at timestamptz,
  membership_expires_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  phone_number text,
  date_of_birth date,
  address text,
  residential_address text,
  occupation text,
  firearms_licence_number text,
  licence_category text,
  licence_expiry_date date,
  emergency_contact_name text,
  emergency_contact_relationship text,
  emergency_contact_phone text,
  outdoor_interests text,
  outdoor_interests_other text,
  firearms_licence_info text,
  referral text,
  reason_for_joining text,
  agreement_accepted boolean not null default false,
  privacy_accepted boolean not null default false,
  waiver_accepted boolean not null default false,
  agree_safe_conduct boolean not null default false,
  agree_lawful_directions boolean not null default false,
  agree_regulations boolean not null default false,
  agree_respect_environment boolean not null default false,
  agree_no_reckless_behaviour boolean not null default false,
  agree_no_intoxication boolean not null default false,
  agree_personal_responsibility boolean not null default false,
  agree_rules_consequence boolean not null default false,
  accept_liability_waiver boolean not null default false,
  accept_privacy_consent boolean not null default false,
  typed_signature text,
  applicant_signature text,
  application_date date,
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'active', 'expired', 'cancelled', 'rejected')
  ),
  member_number text,
  payment_status text not null default 'not_required' check (
    payment_status in (
      'not_required',
      'pending_payment',
      'paid',
      'failed',
      'refunded',
      'cancelled'
    )
  ),
  stripe_checkout_session_id text,
  stripe_payment_link text,
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists linked_application_id uuid references public.applications(id) on delete set null;

create or replace function public.generate_member_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_value bigint;
  next_member_number text;
begin
  loop
    next_value := nextval('public.pros_member_number_seq');
    next_member_number := 'PROS-' || lpad(next_value::text, 3, '0');

    exit when not exists (
      select 1 from public.profiles where member_number = next_member_number
    );
  end loop;

  return next_member_number;
end;
$$;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  application_id uuid references public.applications(id) on delete set null,
  member_number text,
  stripe_customer_id text,
  stripe_checkout_session_id text unique,
  stripe_subscription_id text,
  amount integer,
  currency text not null default 'aud',
  payment_type text,
  status text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  body text,
  visibility text not null default 'public' check (visibility in ('public', 'members_only')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer,
  currency text not null default 'aud',
  stripe_price_id text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_tickets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  topic text not null default 'general',
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'archived')),
  admin_notes text,
  source_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  subject text,
  audience text,
  post_id uuid references public.posts(id) on delete set null,
  recipient_email text,
  email_type text,
  related_application_id uuid references public.applications(id) on delete set null,
  related_profile_id uuid references public.profiles(id) on delete set null,
  recipient_count integer,
  status text,
  provider_message_id text,
  error_message text,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.applications
  add column if not exists residential_address text,
  add column if not exists phone_number text,
  add column if not exists occupation text,
  add column if not exists firearms_licence_number text,
  add column if not exists licence_category text,
  add column if not exists licence_expiry_date date,
  add column if not exists emergency_contact_relationship text,
  add column if not exists outdoor_interests_other text,
  add column if not exists agree_safe_conduct boolean not null default false,
  add column if not exists agree_lawful_directions boolean not null default false,
  add column if not exists agree_regulations boolean not null default false,
  add column if not exists agree_respect_environment boolean not null default false,
  add column if not exists agree_no_reckless_behaviour boolean not null default false,
  add column if not exists agree_no_intoxication boolean not null default false,
  add column if not exists agree_personal_responsibility boolean not null default false,
  add column if not exists agree_rules_consequence boolean not null default false,
  add column if not exists accept_liability_waiver boolean not null default false,
  add column if not exists accept_privacy_consent boolean not null default false,
  add column if not exists applicant_signature text,
  add column if not exists application_date date,
  add column if not exists member_number text,
  add column if not exists payment_status text not null default 'not_required' check (
    payment_status in (
      'not_required',
      'pending_payment',
      'paid',
      'failed',
      'refunded',
      'cancelled'
    )
  ),
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_link text,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;

alter table public.profiles
  add column if not exists member_number text,
  add column if not exists payment_status text not null default 'not_required' check (
    payment_status in (
      'not_required',
      'pending_payment',
      'paid',
      'failed',
      'refunded',
      'cancelled'
    )
  ),
  add column if not exists stripe_subscription_id text;

alter table public.payments
  add column if not exists member_number text;

alter table public.email_logs
  add column if not exists recipient_email text,
  add column if not exists email_type text,
  add column if not exists related_application_id uuid references public.applications(id) on delete set null,
  add column if not exists related_profile_id uuid references public.profiles(id) on delete set null,
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_linked_application_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_linked_application_id_fkey
      foreign key (linked_application_id)
      references public.applications(id)
      on delete set null;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'applications_reviewed_by_fkey'
  ) then
    alter table public.applications
      add constraint applications_reviewed_by_fkey
      foreign key (reviewed_by)
      references public.profiles(id)
      on delete set null;
  end if;
end;
$$;

create index if not exists profiles_auth_user_id_idx on public.profiles(auth_user_id);
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_linked_application_id_idx on public.profiles(linked_application_id);
create unique index if not exists profiles_member_number_idx
  on public.profiles(member_number)
  where member_number is not null;
create index if not exists profiles_payment_status_idx on public.profiles(payment_status);
create index if not exists applications_status_created_at_idx on public.applications(status, created_at desc);
create index if not exists applications_member_number_idx on public.applications(member_number);
create index if not exists applications_payment_status_idx on public.applications(payment_status);
create index if not exists applications_stripe_checkout_session_id_idx
  on public.applications(stripe_checkout_session_id);
create index if not exists applications_reviewed_by_idx on public.applications(reviewed_by);
create index if not exists payments_profile_id_idx on public.payments(profile_id);
create index if not exists payments_application_id_idx on public.payments(application_id);
create index if not exists payments_member_number_idx on public.payments(member_number);
create index if not exists posts_status_visibility_published_at_idx on public.posts(status, visibility, published_at desc);
create index if not exists contact_tickets_status_created_at_idx
  on public.contact_tickets(status, created_at desc);
create index if not exists sponsorship_tiers_active_sort_order_idx
  on public.sponsorship_tiers(active, sort_order);
create index if not exists sponsors_active_featured_sort_order_idx
  on public.sponsors(active, featured, sort_order);
create index if not exists sponsors_tier_id_idx on public.sponsors(tier_id);
create index if not exists email_logs_related_application_id_idx on public.email_logs(related_application_id);
create index if not exists email_logs_related_profile_id_idx on public.email_logs(related_profile_id);
create index if not exists email_logs_email_type_created_at_idx on public.email_logs(email_type, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists contact_tickets_set_updated_at on public.contact_tickets;
create trigger contact_tickets_set_updated_at
before update on public.contact_tickets
for each row execute function public.set_updated_at();

drop trigger if exists sponsorship_tiers_set_updated_at on public.sponsorship_tiers;
create trigger sponsorship_tiers_set_updated_at
before update on public.sponsorship_tiers
for each row execute function public.set_updated_at();

drop trigger if exists sponsors_set_updated_at on public.sponsors;
create trigger sponsors_set_updated_at
before update on public.sponsors
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where auth_user_id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where auth_user_id = auth.uid()
      and membership_status = 'active'
  );
$$;

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.payments enable row level security;
alter table public.posts enable row level security;
alter table public.products enable row level security;
alter table public.contact_tickets enable row level security;
alter table public.sponsorship_tiers enable row level security;
alter table public.sponsors enable row level security;
alter table public.email_logs enable row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
on public.profiles for select
using (auth_user_id = auth.uid());

drop policy if exists "Profiles are manageable by admins" on public.profiles;
create policy "Profiles are manageable by admins"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Applications can be submitted publicly" on public.applications;
create policy "Applications can be submitted publicly"
on public.applications for insert
with check (
  status = 'pending'
  and agreement_accepted is true
  and privacy_accepted is true
  and waiver_accepted is true
  and agree_safe_conduct is true
  and agree_lawful_directions is true
  and agree_regulations is true
  and agree_respect_environment is true
  and agree_no_reckless_behaviour is true
  and agree_no_intoxication is true
  and agree_personal_responsibility is true
  and agree_rules_consequence is true
  and accept_liability_waiver is true
  and accept_privacy_consent is true
);

drop policy if exists "Applications are manageable by admins" on public.applications;
create policy "Applications are manageable by admins"
on public.applications for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Payments are readable by related member" on public.payments;
create policy "Payments are readable by related member"
on public.payments for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = payments.profile_id
      and profiles.auth_user_id = auth.uid()
  )
);

drop policy if exists "Payments are manageable by admins" on public.payments;
create policy "Payments are manageable by admins"
on public.payments for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Published public posts are readable" on public.posts;
create policy "Published public posts are readable"
on public.posts for select
using (status = 'published' and visibility = 'public');

drop policy if exists "Published member posts are readable by active members" on public.posts;
create policy "Published member posts are readable by active members"
on public.posts for select
using (
  status = 'published'
  and visibility = 'members_only'
  and public.is_active_member()
);

drop policy if exists "Posts are manageable by admins" on public.posts;
create policy "Posts are manageable by admins"
on public.posts for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Active products are readable publicly" on public.products;
create policy "Active products are readable publicly"
on public.products for select
using (active is true);

drop policy if exists "Products are manageable by admins" on public.products;
create policy "Products are manageable by admins"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Contact tickets can be submitted publicly" on public.contact_tickets;
create policy "Contact tickets can be submitted publicly"
on public.contact_tickets for insert
with check (
  length(trim(name)) > 0
  and position('@' in email) > 1
  and length(trim(subject)) > 0
  and length(trim(message)) > 0
);

drop policy if exists "Contact tickets are manageable by admins" on public.contact_tickets;
create policy "Contact tickets are manageable by admins"
on public.contact_tickets for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Active sponsorship tiers are readable publicly" on public.sponsorship_tiers;
create policy "Active sponsorship tiers are readable publicly"
on public.sponsorship_tiers for select
using (active is true);

drop policy if exists "Sponsorship tiers are manageable by admins" on public.sponsorship_tiers;
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

drop policy if exists "Email logs are readable by admins" on public.email_logs;
create policy "Email logs are readable by admins"
on public.email_logs for select
using (public.is_admin());

drop policy if exists "Email logs are insertable by admins" on public.email_logs;
create policy "Email logs are insertable by admins"
on public.email_logs for insert
with check (public.is_admin());
