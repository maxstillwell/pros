import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

function getSafeRedirect(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/admin";
  }

  if (value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

function loginRedirect(
  request: NextRequest,
  error: string,
  redirectTo: string,
  detail?: string,
) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", error);

  if (detail) {
    url.searchParams.set("detail", detail.slice(0, 220));
  }

  if (redirectTo) {
    url.searchParams.set("redirectTo", redirectTo);
  }

  return NextResponse.redirect(url, 303);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = getSafeRedirect(formData.get("redirectTo"));

  if (typeof email !== "string" || !email.trim()) {
    return loginRedirect(request, "missing-email", redirectTo);
  }

  if (typeof password !== "string" || !password) {
    return loginRedirect(request, "missing-password", redirectTo);
  }

  const config = getSupabasePublicConfig();
  if (!config) {
    return loginRedirect(request, "missing-config", redirectTo);
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url), 303);
  const supabase = createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    const detail =
      `${error.status ?? "unknown"} ${error.code ?? ""} ${error.message}`.trim();

    console.error("Supabase password login failed", {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
    });

    const url = new URL("/login", request.url);
    url.searchParams.set("error", "login-failed");
    url.searchParams.set("detail", detail.slice(0, 220));
    url.searchParams.set("redirectTo", redirectTo);
    return NextResponse.redirect(url, 303);
  }

  return response;
}
