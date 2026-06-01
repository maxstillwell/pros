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
NEXT_PUBLIC_SITE_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=
RESEND_FROM_EMAIL=
ADMIN_EMAIL=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_MEMBERSHIP_PRICE_ID=
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` to client
components.

## Supabase setup

For deployment, use the manual setup files:

- `supabase/manual_setup.sql`
- `supabase/create_first_admin.sql`
- `supabase/README.md`

Open the `PROS` Supabase project, go to `SQL Editor`, and run
`supabase/manual_setup.sql`. This creates the tables, indexes, triggers, RLS
policies, and helper functions needed by the current app.

## Creating the First Admin User

1. In Supabase, go to `Authentication -> Users -> Add user`.
2. Create the admin email user.
3. Copy the user's UUID.
4. Open `supabase/create_first_admin.sql`.
5. Replace `YOUR_AUTH_USER_ID`, `YOUR_ADMIN_EMAIL`, and `YOUR_ADMIN_NAME`.
6. Run the edited SQL in Supabase `SQL Editor`.

After that, `/admin` will show the admin dashboard.

## Deployment Guide for GitHub, Vercel and Supabase

Use this when moving the current PROS website from local development to the
existing GitHub repository `PROS`, Vercel project `PROS`, and Supabase project
`PROS`.

### GitHub

Only `.env.example` should be committed. Real secrets belong in Vercel or local
`.env.local`, not GitHub.

Check what will be committed:

```powershell
cd C:\Users\MaxQ\OneDrive\Documents\PROS
git status
git ls-files | findstr /i ".env"
```

The expected tracked env file is:

```txt
.env.example
```

Initial push to the existing GitHub repository:

```powershell
cd C:\Users\MaxQ\OneDrive\Documents\PROS
git status
git add .
git commit -m "Prepare PROS website for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/PROS.git
git push -u origin main
```

If `origin` already exists:

```powershell
cd C:\Users\MaxQ\OneDrive\Documents\PROS
git remote -v
git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/PROS.git
git push -u origin main
```

### Vercel

1. Open Vercel project `PROS`.
2. Connect the GitHub repository `PROS`.
3. Keep the framework preset as `Next.js`.
4. Keep the build command as the default:

```txt
npm run build
```

5. Keep output settings as the default for Next.js.
6. Add the environment variables below.
7. Deploy.
8. After the first deployment, copy the production domain.
9. Update `NEXT_PUBLIC_SITE_URL` to that production domain.
10. Redeploy.

The temporary Vercel domain may be `https://pros.vercel.app` or another
generated Vercel URL.

### Vercel Environment Variables

Add these in `Vercel -> PROS project -> Settings -> Environment Variables`:

```env
NEXT_PUBLIC_SITE_URL=https://YOUR_VERCEL_DOMAIN

NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

ADMIN_EMAIL=YOUR_ADMIN_EMAIL

RESEND_API_KEY=
RESEND_FROM_EMAIL=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_MEMBERSHIP_PRICE_ID=
```

Supabase keys go into Vercel, not GitHub. `SUPABASE_SERVICE_ROLE_KEY` must stay
secret. Variables that start with `NEXT_PUBLIC_` are safe for browser use.
Variables without `NEXT_PUBLIC_` are server-side only.

Resend and Stripe values can stay empty until those services are ready. Resend
is used for application emails when configured. Stripe is still a later phase.

### Supabase

Copy API values from:

```txt
Supabase -> PROS project -> Project Settings -> API
```

Copy:

```txt
Project URL
anon public key
service_role key
```

Create the admin auth user at:

```txt
Supabase -> Authentication -> Users -> Add user
```

Then run `supabase/create_first_admin.sql` after replacing the placeholders.

For magic link login, also open:

```txt
Supabase -> Authentication -> URL Configuration
```

Set the site URL to your production domain and add this redirect URL:

```txt
https://YOUR_VERCEL_DOMAIN/auth/callback
```

### Manual Supabase Steps

1. Copy Supabase API values from `Project Settings -> API`.
2. Add them to Vercel as `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. In Supabase `SQL Editor`, run `supabase/manual_setup.sql`.
4. In `Authentication -> Users -> Add user`, create the first admin email user.
5. Copy the Auth User ID.
6. Run `supabase/create_first_admin.sql` after replacing the placeholders.
7. Open `https://YOUR_VERCEL_DOMAIN/login`.
8. After login, open `https://YOUR_VERCEL_DOMAIN/admin`.

### Online Testing Checklist

Public pages:

```txt
/
/about
/membership
/apply
/news
/shop
/contact
```

Membership application:

1. Open `/apply`.
2. Submit a test application.
3. Confirm the success message appears.
4. Confirm the application appears in Supabase `applications`.
5. Confirm the application appears in `/admin/applications`.

Admin:

1. Open `/login`.
2. Log in with the admin email.
3. Open `/admin`.
4. Open `/admin/applications`.
5. Review a test application.
6. Approve or reject it.
7. Open `/admin/members`.
8. Confirm the approved member appears.

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
