# Supabase Manual Setup

Use this if you do not want to use the Supabase CLI.

## Step 1: Run the database setup

1. Open Supabase.
2. Open the `PROS` project.
3. Go to `SQL Editor`.
4. Open `supabase/manual_setup.sql` from this project.
5. Paste the whole file into the SQL editor.
6. Click `Run`.

## Step 2: Create the first admin login user

1. In Supabase, go to `Authentication -> Users`.
2. Click `Add user`.
3. Enter the admin email address.
4. Set a password for the user.
5. Create the user.
6. Open that user and copy the user UUID.

## Step 3: Create the admin profile

1. Open `supabase/create_first_admin.sql`.
2. Replace:
   - `YOUR_AUTH_USER_ID` with the copied user UUID.
   - `YOUR_ADMIN_EMAIL` with the same admin email.
   - `YOUR_ADMIN_NAME` with the admin name.
3. Paste the edited SQL into `SQL Editor`.
4. Click `Run`.

## Step 4: Copy Supabase values for Vercel

In Supabase, go to `Project Settings -> API`.

Copy these values:

```txt
Project URL
anon public key
service_role key
```

Add them in Vercel under `PROS -> Settings -> Environment Variables`.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Keep `SUPABASE_SERVICE_ROLE_KEY` secret. Do not put it in GitHub.

## Step 5: Password login

The admin login uses email and password. You do not need to configure Supabase
magic-link redirect URLs for the admin area.

## Step 6: Redeploy and test

1. In Vercel, redeploy the `PROS` project.
2. Open `https://YOUR_VERCEL_DOMAIN/login`.
3. Sign in with the admin email and password.
4. After login, open `https://YOUR_VERCEL_DOMAIN/admin`.
