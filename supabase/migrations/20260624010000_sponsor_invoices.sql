create table if not exists public.sponsor_invoices (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid references public.sponsors(id) on delete set null,
  invoice_number text unique not null,
  issued_at date not null default ((now() at time zone 'Australia/Melbourne')::date),
  due_at date,
  bill_to_name text not null,
  bill_to_email text,
  bill_to_address text,
  description text not null,
  amount integer not null check (amount > 0),
  currency text not null default 'aud',
  notes text,
  status text not null default 'issued' check (status in ('draft', 'issued', 'paid', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sponsor_invoices_sponsor_id_idx
  on public.sponsor_invoices(sponsor_id);

create index if not exists sponsor_invoices_created_at_idx
  on public.sponsor_invoices(created_at desc);

drop trigger if exists sponsor_invoices_set_updated_at on public.sponsor_invoices;
create trigger sponsor_invoices_set_updated_at
before update on public.sponsor_invoices
for each row execute function public.set_updated_at();

alter table public.sponsor_invoices enable row level security;

drop policy if exists "Sponsor invoices are manageable by admins"
  on public.sponsor_invoices;
create policy "Sponsor invoices are manageable by admins"
on public.sponsor_invoices for all
using (public.is_admin())
with check (public.is_admin());
