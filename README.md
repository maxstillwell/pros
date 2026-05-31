# Prime Range Outdoor Society Inc. website

First framework for the PROS club website rebuild. This is a lightweight
Next.js app for public pages, membership applications, a simple admin dashboard,
and Supabase-backed club records.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth and Postgres
- Stripe Checkout placeholders
- Resend email placeholders
- Vercel deployment target

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

On this Windows machine, use `npm.cmd` if PowerShell blocks `npm.ps1`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_MEMBERSHIP_PRICE_ID=

RESEND_API_KEY=
RESEND_FROM_EMAIL=
ADMIN_EMAIL=
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` to client
components.

## Supabase setup

1. Create a Supabase project.
2. Copy the project URL and anon key into `.env.local`.
3. Copy the service role key into `.env.local`.
4. Run the SQL migration in `supabase/migrations/20260531000000_initial_schema.sql`.

With the Supabase CLI, the migration path is:

```bash
supabase db push
```

Without the CLI, paste the migration SQL into the Supabase SQL editor and run
it once.

## First admin user

1. Sign in at `/login` with the email address that should become admin.
2. In Supabase, open Auth and copy that user's ID.
3. Insert or update a row in `profiles`:

```sql
insert into public.profiles (auth_user_id, email, full_name, role, membership_status)
values (
  'AUTH_USER_ID_HERE',
  'admin@example.com',
  'Admin Name',
  'admin',
  'active'
)
on conflict (email) do update
set auth_user_id = excluded.auth_user_id,
    full_name = excluded.full_name,
    role = 'admin',
    membership_status = 'active';
```

After that, `/admin` will show the admin dashboard.

## Current scope

Implemented in this first framework:

- Public pages: home, about, membership, apply, news, shop, contact, privacy, terms
- Responsive public layout
- Supabase schema migration with RLS policies
- Supabase browser/server/service helpers
- Zod-validated membership application form
- Admin dashboard shell
- Applications list, detail view, notes, approve, and reject actions
- Placeholder members page
- Placeholder posts, products, emails, settings admin pages
- Placeholder API routes for Stripe and Resend

## Stripe notes

Stripe is intentionally not implemented in this first build. Placeholder routes
exist at:

- `POST /api/stripe/create-membership-checkout-session`
- `POST /api/stripe/create-shop-checkout-session`
- `POST /api/stripe/webhook`

Next phase work should add Stripe SDK usage server-side only, verify webhook
signatures, store payment records idempotently, and activate memberships only
after confirmed membership payment.

## Resend notes

Resend is intentionally not implemented in this first build. The placeholder
route is:

- `POST /api/email/send-post-update`

Next phase work should send only explicit admin-triggered updates and write to
`email_logs`.

## Vercel deployment

1. Create a Vercel project from this repository.
2. Add all environment variables in Vercel project settings.
3. Run the Supabase migration before using the deployed site.
4. Set `NEXT_PUBLIC_SITE_URL` to the deployed URL.
5. Configure Supabase Auth redirect URLs for local and production URLs.

## Useful commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Known TODOs

- Replace placeholder news content with Supabase post queries and editing.
- Build the full admin post editor.
- Add Stripe membership checkout and webhook handling.
- Add Resend email sending and email log updates.
- Add member-only post access in the public news detail page.
- Add product management and shop checkout in a later phase.
- Replace placeholder privacy, terms, waiver, and disclaimer copy before launch.
