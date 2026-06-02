import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

function getSafeDetail(value: string | null) {
  if (!value) {
    return "";
  }

  return value.replace(/[^\w\s.,:;!?()[\]/-]/g, "").slice(0, 220);
}

function redirectToLogin(requestUrl: URL, error: string, detail?: string | null) {
  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("error", error);

  const safeDetail = getSafeDetail(detail ?? "");
  if (safeDetail) {
    loginUrl.searchParams.set("detail", safeDetail);
  }

  return NextResponse.redirect(loginUrl);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNext(requestUrl.searchParams.get("next"));
  const callbackError =
    requestUrl.searchParams.get("error_description") ??
    requestUrl.searchParams.get("error");

  if (callbackError) {
    return redirectToLogin(requestUrl, "callback-failed", callbackError);
  }

  if (!code) {
    return redirectToLogin(requestUrl, "missing-code");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Supabase auth callback failed", {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
    });

    return redirectToLogin(
      requestUrl,
      "callback-failed",
      `${error.status ?? "unknown"} ${error.code ?? ""} ${error.message}`.trim(),
    );
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
