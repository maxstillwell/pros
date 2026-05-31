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
- Resend application emails
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
4. Run the SQL migrations in `supabase/migrations/`.

With the Supabase CLI, the migration path is:

```bash
supabase db push
```

Without the CLI, paste the migration SQL into the Supabase SQL editor and run
it once.

## Creating the First Admin User

1. Create a user in Supabase Auth with the email address that should become admin.
2. Add or update the matching row in `profiles`.
3. Set `role = 'admin'` and `membership_status = 'active'`.

If the profile row already exists:

```sql
update public.profiles
set role = 'admin',
    membership_status = 'active'
where email = 'YOUR_ADMIN_EMAIL@example.com';
```

If the profile row may not exist yet, use an upsert:

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

## Membership Admin Workflow

### Local URLs

```txt
Public site:
http://localhost:3000

Login:
http://localhost:3000/login

Admin dashboard:
http://localhost:3000/admin

Applications:
http://localhost:3000/admin/applications

Members:
http://localhost:3000/admin/members
```

### How to review applications

1. Log in as admin.
2. Open `/admin/applications`.
3. Search or filter applications by status.
4. Click an application.
5. Review applicant details, emergency contact, interests, acknowledgements, waiver, consent, and signature.
6. Approve or reject the application.
7. Approved applications create or update a member profile with status `approved`.

### How to manage members

1. Open `/admin/members`.
2. Search or filter by membership status.
3. Open the member profile.
4. Update contact details, notes, status, membership dates, or Stripe customer ID.
5. Use Mark Active, Mark Expired, or Mark Cancelled for common status changes.
6. Save changes.

### Email setup

Application emails use Resend when these variables are configured:

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=
ADMIN_EMAIL=
NEXT_PUBLIC_SITE_URL=
```

Email attempts are logged in `email_logs`. If Resend is not configured or email
sending fails, the application or review action still completes and the email
log records `skipped` or `failed`.

### Current limitations

- Stripe payment link automation is not implemented yet.
- Full renewal reminders are not implemented yet.
- Advanced member roles are not implemented yet.
- Shop checkout remains a later phase.
- Advanced news/member-only publishing remains a later phase.

## Current scope

Implemented in this first framework:

- Public pages: home, about, membership, apply, news, shop, contact, privacy, terms
- Responsive public layout
- Supabase schema migration with RLS policies
- Supabase browser/server/service helpers
- Zod-validated membership application form
- Admin dashboard shell
- Applications list, filters, search, detail view, notes, approve, and reject actions
- Member list, filters, search, detail view, status updates, notes, and linked application view
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

Resend is implemented for membership application workflow emails:

- Applicant confirmation email after application submission
- Admin notification email after application submission
- Applicant approval email
- Applicant rejection email

The news-update email route remains a placeholder:

- `POST /api/email/send-post-update`

Next phase work should add explicit admin-triggered post/member update emails.

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

On Windows PowerShell in this workspace:

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
npm.cmd run typecheck
```

## Known TODOs

- Replace placeholder news content with Supabase post queries and editing.
- Build the full admin post editor.
- Add Stripe membership checkout and webhook handling.
- Add post and custom member update email sending.
- Add member-only post access in the public news detail page.
- Add product management and shop checkout in a later phase.
- Replace placeholder privacy, terms, waiver, and disclaimer copy before launch.
