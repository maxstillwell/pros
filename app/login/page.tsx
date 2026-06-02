import { redirect } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import {
  createSupabaseServerClient,
  hasSupabasePublicConfig,
} from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    detail?: string;
    redirectTo?: string;
  }>;
};

function getSafeRedirect(value: FormDataEntryValue | string | undefined) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/admin";
  }

  if (value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

function getSafeErrorDetail(value: string | undefined) {
  if (!value) {
    return "";
  }

  return value.replace(/[^\w\s.,:;!?()[\]/-]/g, "").slice(0, 220);
}

async function signInWithPassword(formData: FormData) {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = getSafeRedirect(formData.get("redirectTo") ?? "/admin");

  if (typeof email !== "string" || !email.trim()) {
    redirect(
      `/login?error=missing-email&redirectTo=${encodeURIComponent(redirectTo)}`,
    );
  }

  if (typeof password !== "string" || !password) {
    redirect(
      `/login?error=missing-password&redirectTo=${encodeURIComponent(
        redirectTo,
      )}`,
    );
  }

  if (!hasSupabasePublicConfig()) {
    redirect(
      `/login?error=missing-config&redirectTo=${encodeURIComponent(
        redirectTo,
      )}`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    const detail = encodeURIComponent(
      `${error.status ?? "unknown"} ${error.code ?? ""} ${error.message}`.trim(),
    );

    console.error("Supabase password login failed", {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
    });
    redirect(
      `/login?error=login-failed&detail=${detail}&redirectTo=${encodeURIComponent(
        redirectTo,
      )}`,
    );
  }

  redirect(redirectTo);
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = getSafeRedirect(params.redirectTo);
  const errorDetail = getSafeErrorDetail(params.detail);
  const errorMessages: Record<string, string> = {
    "missing-email": "Enter your admin email address.",
    "missing-password": "Enter your password.",
    "missing-config": "Supabase is not configured yet.",
    "login-failed":
      "The email or password did not work. Check the admin user in Supabase Authentication.",
    "send-failed":
      "The old magic-link login could not be sent. Use email and password instead.",
    "callback-failed":
      "The old sign-in link opened, but Supabase could not finish the login. Use email and password instead.",
    "missing-code":
      "The old sign-in link opened without a login code. Use email and password instead.",
  };

  return (
    <SiteShell>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-md rounded-md border border-forest-900/10 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-clay">
            Admin login
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-forest-900">
            Sign in.
          </h1>
          <p className="mt-3 text-sm leading-6 text-forest-900/70">
            Use the admin email and password created in Supabase. Admin access
            is controlled by the matching profile row having role set to admin.
          </p>

          {params.error ? (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
              <p>{errorMessages[params.error] ?? "Something went wrong."}</p>
              {errorDetail ? (
                <p className="mt-2 text-xs font-normal text-red-900/80">
                  Supabase said: {errorDetail}
                </p>
              ) : null}
            </div>
          ) : null}

          <form action={signInWithPassword} className="mt-6">
            <input type="hidden" name="redirectTo" value={redirectTo} />
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
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-forest-900">
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                className="mt-2 min-h-11 w-full rounded-md border border-forest-900/20 px-3 py-2 outline-none focus:border-forest-700 focus:ring-2 focus:ring-forest-700/20"
              />
            </label>
            <button
              type="submit"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-forest-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
            >
              Sign in
            </button>
          </form>
        </div>
      </main>
    </SiteShell>
  );
}
