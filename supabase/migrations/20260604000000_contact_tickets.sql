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

create index if not exists contact_tickets_status_created_at_idx
  on public.contact_tickets(status, created_at desc);

drop trigger if exists contact_tickets_set_updated_at on public.contact_tickets;
create trigger contact_tickets_set_updated_at
before update on public.contact_tickets
for each row execute function public.set_updated_at();

alter table public.contact_tickets enable row level security;

drop policy if exists "Contact tickets can be submitted publicly"
  on public.contact_tickets;
create policy "Contact tickets can be submitted publicly"
on public.contact_tickets for insert
with check (
  length(trim(name)) > 0
  and position('@' in email) > 1
  and length(trim(subject)) > 0
  and length(trim(message)) > 0
);

drop policy if exists "Contact tickets are manageable by admins"
  on public.contact_tickets;
create policy "Contact tickets are manageable by admins"
on public.contact_tickets for all
using (public.is_admin())
with check (public.is_admin());
