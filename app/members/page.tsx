import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { getCurrentProfile } from "@/lib/auth/profile";

const statusCopy: Record<string, string> = {
  pending: "Your application is pending committee review.",
  approved: "Your application has been approved. Payment access will be added in the Stripe phase.",
  expired: "Your membership is expired.",
  cancelled: "Your membership is cancelled.",
  rejected: "Your application was not approved.",
};

export default async function MembersPage() {
  const access = await getCurrentProfile();

  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-4xl">
          {access.status === "ok" && access.profile.membership_status === "active" ? (
            <div className="rounded-md border border-forest-900/10 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase text-clay">
                Members
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-forest-900">
                Welcome, {access.profile.full_name ?? access.profile.email}.
              </h1>
              <p className="mt-4 text-sm leading-6 text-forest-900/70">
                This members area will show active member updates, membership
                status, expiry, and future resources.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-forest-900/10 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase text-clay">
                Members
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-forest-900">
                Member access status
              </h1>
              <p className="mt-4 text-sm leading-6 text-forest-900/70">
                {access.status === "missing_config"
                  ? "Supabase is not configured yet."
                  : access.status === "unauthenticated"
                    ? "Sign in to view your membership status."
                    : access.status === "missing_profile"
                      ? "Your signed-in account does not have a matching profile yet."
                      : statusCopy[access.profile.membership_status] ??
                        "Your membership is not active yet."}
              </p>
              {access.status === "unauthenticated" ? (
                <Link
                  href="/login"
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
                >
                  Sign in
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </SiteShell>
  );
}
