import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/auth/admin-session";
import {
  createSupabaseServerClient,
  hasSupabasePublicConfig,
} from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (hasSupabasePublicConfig()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  clearAdminSessionCookie(response);

  return response;
}
