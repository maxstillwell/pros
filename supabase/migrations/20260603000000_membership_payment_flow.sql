create sequence if not exists public.pros_member_number_seq start 1;

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

alter table public.applications
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
  add column if not exists stripe_payment_link text;

alter table public.profiles
  add column if not exists member_number text unique,
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

create unique index if not exists profiles_member_number_idx
  on public.profiles(member_number)
  where member_number is not null;

create index if not exists applications_member_number_idx
  on public.applications(member_number);

create index if not exists applications_payment_status_idx
  on public.applications(payment_status);

create index if not exists applications_stripe_checkout_session_id_idx
  on public.applications(stripe_checkout_session_id);

create index if not exists profiles_payment_status_idx
  on public.profiles(payment_status);

create index if not exists payments_member_number_idx
  on public.payments(member_number);
