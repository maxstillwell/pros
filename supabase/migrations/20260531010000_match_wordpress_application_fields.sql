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
  add column if not exists application_date date;

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
