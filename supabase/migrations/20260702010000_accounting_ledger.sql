create table if not exists public.accounting_transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_date date not null default ((now() at time zone 'Australia/Melbourne')::date),
  item text not null,
  notes text,
  credit integer not null default 0 check (credit >= 0),
  debit integer not null default 0 check (debit >= 0),
  currency text not null default 'aud',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounting_transactions_amount_check
    check (
      (credit > 0 and debit = 0)
      or (debit > 0 and credit = 0)
    )
);

create index if not exists accounting_transactions_transaction_date_idx
  on public.accounting_transactions(transaction_date asc, created_at asc);

drop trigger if exists accounting_transactions_set_updated_at
  on public.accounting_transactions;
create trigger accounting_transactions_set_updated_at
before update on public.accounting_transactions
for each row execute function public.set_updated_at();

alter table public.accounting_transactions enable row level security;

drop policy if exists "Accounting transactions are manageable by admins"
  on public.accounting_transactions;
create policy "Accounting transactions are manageable by admins"
on public.accounting_transactions for all
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.accounting_attachments (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.accounting_transactions(id) on delete cascade,
  file_name text not null,
  file_path text unique not null,
  mime_type text not null,
  file_size integer not null check (file_size > 0),
  created_at timestamptz not null default now()
);

create index if not exists accounting_attachments_transaction_id_idx
  on public.accounting_attachments(transaction_id);

alter table public.accounting_attachments enable row level security;

drop policy if exists "Accounting attachments are manageable by admins"
  on public.accounting_attachments;
create policy "Accounting attachments are manageable by admins"
on public.accounting_attachments for all
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'accounting-attachments',
  'accounting-attachments',
  false,
  3145728,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
