import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
  hasSupabasePublicConfig,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/server";
import { getAdminSessionUser } from "@/lib/auth/admin-session";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type ProfileAccess =
  | { status: "missing_config"; profile: null }
  | { status: "unauthenticated"; profile: null }
  | { status: "missing_profile"; profile: null }
  | { status: "ok"; profile: Profile };

export type AdminAccess =
  | { status: "ok"; profile: Profile }
  | { status: Exclude<ProfileAccess["status"], "ok"> | "forbidden"; profile: null };

export async function getCurrentProfile(): Promise<ProfileAccess> {
  if (!hasSupabasePublicConfig()) {
    return { status: "missing_config", profile: null };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const sessionUser = user ?? (await getAdminSessionUser());

  if (!sessionUser) {
    return { status: "unauthenticated", profile: null };
  }

  const profileClient = hasSupabaseServiceConfig()
    ? createSupabaseServiceClient()
    : supabase;

  const byAuthUser = await profileClient
    .from("profiles")
    .select("*")
    .eq("auth_user_id", sessionUser.id)
    .maybeSingle();

  if (byAuthUser.data) {
    return { status: "ok", profile: byAuthUser.data };
  }

  if (sessionUser.email) {
    const byEmail = await profileClient
      .from("profiles")
      .select("*")
      .eq("email", sessionUser.email)
      .maybeSingle();

    if (byEmail.data) {
      return { status: "ok", profile: byEmail.data };
    }
  }

  return { status: "missing_profile", profile: null };
}

export async function getAdminAccess(): Promise<AdminAccess> {
  const access = await getCurrentProfile();

  if (access.status !== "ok") {
    return access;
  }

  if (access.profile.role !== "admin") {
    return { status: "forbidden", profile: null };
  }

  return access;
}
