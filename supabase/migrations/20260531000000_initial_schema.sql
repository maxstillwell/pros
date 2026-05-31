create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  email text unique not null,
  full_name text,
  phone text,
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
  stripe_customer_id text,
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
  date_of_birth date,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  outdoor_interests text,
  firearms_licence_info text,
  referral text,
  reason_for_joining text,
  agreement_accepted boolean not null default false,
  privacy_accepted boolean not null default false,
  waiver_accepted boolean not null default false,
  typed_signature text,
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'active', 'expired', 'cancelled', 'rejected')
  ),
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  application_id uuid references public.applications(id) on delete set null,
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

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  subject text,
  audience text,
  post_id uuid references public.posts(id) on delete set null,
  recipient_count integer,
  status text,
  provider_message_id text,
  error_message text,
  sent_at timestamptz not null default now()
);

create index if not exists profiles_auth_user_id_idx on public.profiles(auth_user_id);
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists applications_status_created_at_idx on public.applications(status, created_at desc);
create index if not exists posts_status_visibility_published_at_idx on public.posts(status, visibility, published_at desc);
create index if not exists payments_profile_id_idx on public.payments(profile_id);
create index if not exists payments_application_id_idx on public.payments(application_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
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
alter table public.email_logs enable row level security;

create policy "Profiles are readable by owner"
on public.profiles for select
using (auth_user_id = auth.uid());

create policy "Profiles are manageable by admins"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

create policy "Applications can be submitted publicly"
on public.applications for insert
with check (
  status = 'pending'
  and agreement_accepted is true
  and privacy_accepted is true
  and waiver_accepted is true
);

create policy "Applications are manageable by admins"
on public.applications for all
using (public.is_admin())
with check (public.is_admin());

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

create policy "Payments are manageable by admins"
on public.payments for all
using (public.is_admin())
with check (public.is_admin());

create policy "Published public posts are readable"
on public.posts for select
using (status = 'published' and visibility = 'public');

create policy "Published member posts are readable by active members"
on public.posts for select
using (
  status = 'published'
  and visibility = 'members_only'
  and public.is_active_member()
);

create policy "Posts are manageable by admins"
on public.posts for all
using (public.is_admin())
with check (public.is_admin());

create policy "Active products are readable publicly"
on public.products for select
using (active is true);

create policy "Products are manageable by admins"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

create policy "Email logs are readable by admins"
on public.email_logs for select
using (public.is_admin());

create policy "Email logs are insertable by admins"
on public.email_logs for insert
with check (public.is_admin());
