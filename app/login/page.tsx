import { redirect } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { getSiteUrl } from "@/lib/supabase/env";
import {
  createSupabaseServerClient,
  hasSupabasePublicConfig,
} from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{
    sent?: string;
    error?: string;
  }>;
};

async function sendMagicLink(formData: FormData) {
  "use server";

  const email = formData.get("email");

  if (typeof email !== "string" || !email.trim()) {
    redirect("/login?error=missing-email");
  }

  if (!hasSupabasePublicConfig()) {
    redirect("/login?error=missing-config");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: `${getSiteUrl()}/members`,
    },
  });

  if (error) {
    redirect("/login?error=send-failed");
  }

  redirect("/login?sent=1");
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessages: Record<string, string> = {
    "missing-email": "Enter an email address to receive a sign-in link.",
    "missing-config": "Supabase is not configured yet.",
    "send-failed": "The sign-in link could not be sent.",
  };

  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-md rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-clay">
            Member login
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-forest-900">
            Sign in with email.
          </h1>
          <p className="mt-3 text-sm leading-6 text-forest-900/70">
            PROS uses Supabase magic links for the first framework.
          </p>

          {params.sent ? (
            <div className="mt-5 rounded-md border border-forest-700/20 bg-forest-50 p-4 text-sm font-medium text-forest-900">
              Check your inbox for a secure sign-in link.
            </div>
          ) : null}

          {params.error ? (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
              {errorMessages[params.error] ?? "Something went wrong."}
            </div>
          ) : null}

          <form action={sendMagicLink} className="mt-6">
            <label className="block">
              <span className="text-sm font-semibold text-forest-900">
                Email address
              </span>
              <input
                name="email"
                type="email"
                required
                className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
              />
            </label>
            <button
              type="submit"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
            >
              Send sign-in link
            </button>
          </form>
        </div>
      </main>
    </SiteShell>
  );
}
