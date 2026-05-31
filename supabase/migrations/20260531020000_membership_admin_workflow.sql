alter table public.applications
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;

alter table public.profiles
  add column if not exists linked_application_id uuid references public.applications(id) on delete set null;

alter table public.email_logs
  add column if not exists recipient_email text,
  add column if not exists email_type text,
  add column if not exists related_application_id uuid references public.applications(id) on delete set null,
  add column if not exists related_profile_id uuid references public.profiles(id) on delete set null,
  add column if not exists created_at timestamptz not null default now();

create index if not exists applications_reviewed_by_idx
  on public.applications(reviewed_by);

create index if not exists profiles_linked_application_id_idx
  on public.profiles(linked_application_id);

create index if not exists email_logs_related_application_id_idx
  on public.email_logs(related_application_id);

create index if not exists email_logs_related_profile_id_idx
  on public.email_logs(related_profile_id);

create index if not exists email_logs_email_type_created_at_idx
  on public.email_logs(email_type, created_at desc);
