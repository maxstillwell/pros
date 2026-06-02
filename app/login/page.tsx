import { SiteShell } from "@/components/layout/site-shell";

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

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = getSafeRedirect(params.redirectTo);
  const errorDetail = getSafeErrorDetail(params.detail);
  const errorMessages: Record<string, string> = {
    "missing-email": "Enter your admin email address.",
    "missing-password": "Enter your password.",
    "missing-config": "Supabase is not configured yet.",
    "login-failed":
      "The email or password did not work. Check ADMIN_EMAIL and ADMIN_PASSWORD in Vercel.",
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
            Use the admin email and password set in Vercel. Admin access is
            controlled by the matching profile row having role set to admin.
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

          <form action="/api/auth/login" method="post" className="mt-6">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <label className="block">
              <span className="text-sm font-semibold text-forest-900">
                Email address
              </span>
              <input
                name="email"
                type="email"
                autoComplete="email"
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
                autoComplete="current-password"
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
