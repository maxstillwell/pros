-- Create the first PROS admin profile.
-- Replace all three placeholders before running this in Supabase SQL Editor:
--   YOUR_AUTH_USER_ID  - the UUID from Authentication -> Users
--   YOUR_ADMIN_EMAIL   - the admin email address
--   YOUR_ADMIN_NAME    - the admin's display name

insert into public.profiles (
  auth_user_id,
  email,
  full_name,
  role,
  membership_status
)
values (
  'YOUR_AUTH_USER_ID',
  'YOUR_ADMIN_EMAIL',
  'YOUR_ADMIN_NAME',
  'admin',
  'active'
)
on conflict (email) do update
set
  auth_user_id = excluded.auth_user_id,
  full_name = excluded.full_name,
  role = 'admin',
  membership_status = 'active',
  updated_at = now();
