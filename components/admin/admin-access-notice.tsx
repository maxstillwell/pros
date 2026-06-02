import Link from "next/link";
import type { AdminAccess } from "@/lib/auth/profile";

const messages: Record<AdminAccess["status"], string> = {
  ok: "",
  missing_config:
    "Supabase is not configured yet. Add the environment variables before using the admin dashboard.",
  unauthenticated: "Sign in with your admin email and password to access this area.",
  missing_profile:
    "You are signed in, but this Auth user does not have a matching profile row. Run supabase/create_first_admin.sql with this user's Auth UUID and email.",
  forbidden:
    "You are signed in, but the matching profile row is not role = admin. Run supabase/create_first_admin.sql or update the profile role in Supabase.",
};

export function AdminAccessNotice({ access }: { access: AdminAccess }) {
  if (access.status === "ok") {
    return null;
  }

  return (
    <div className="rounded-md border border-clay/30 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase text-clay">Admin access</p>
      <h1 className="mt-3 text-2xl font-semibold text-forest-900">
        Dashboard unavailable
      </h1>
      <p className="mt-3 text-sm leading-6 text-forest-900/72">
        {messages[access.status]}
      </p>
      {access.status === "unauthenticated" ? (
        <Link
          href="/login"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
        >
          Sign in
        </Link>
      ) : null}
    </div>
  );
}
