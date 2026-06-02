import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
  hasSupabasePublicConfig,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/server";
import { getAdminSessionState } from "@/lib/auth/admin-session";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type AuthDebug = {
  build: string;
  fallbackCookie: string;
  hasServiceConfig: boolean;
  hasSupabaseConfig: boolean;
  profileLookup: string;
  sessionEmail: string | null;
  sessionSource: string;
  supabaseUser: string;
};

export type ProfileAccess =
  | { debug: AuthDebug; status: "missing_config"; profile: null }
  | { debug: AuthDebug; status: "unauthenticated"; profile: null }
  | { debug: AuthDebug; status: "missing_profile"; profile: null }
  | { debug: AuthDebug; status: "ok"; profile: Profile };

export type AdminAccess =
  | { debug: AuthDebug; status: "ok"; profile: Profile }
  | {
      debug: AuthDebug;
      status: Exclude<ProfileAccess["status"], "ok"> | "forbidden";
      profile: null;
    };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function maskEmail(email: string | null | undefined) {
  if (!email) {
    return null;
  }

  const [name, domain] = email.split("@");

  if (!name || !domain) {
    return "set";
  }

  return `${name.slice(0, 2)}***@${domain}`;
}

function createAuthDebug(
  values: Partial<AuthDebug> & Pick<AuthDebug, "hasSupabaseConfig">,
): AuthDebug {
  return {
    build: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    fallbackCookie: "not checked",
    hasServiceConfig: hasSupabaseServiceConfig(),
    profileLookup: "not checked",
    sessionEmail: null,
    sessionSource: "none",
    supabaseUser: "not checked",
    ...values,
  };
}

export async function getCurrentProfile(): Promise<ProfileAccess> {
  if (!hasSupabasePublicConfig()) {
    return {
      debug: createAuthDebug({ hasSupabaseConfig: false }),
      status: "missing_config",
      profile: null,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  const fallbackSession = await getAdminSessionState();
  const sessionUser = user ?? fallbackSession.user;
  const debug = createAuthDebug({
    fallbackCookie: fallbackSession.reason,
    hasSupabaseConfig: true,
    sessionEmail: maskEmail(sessionUser?.email),
    sessionSource: user ? "supabase" : fallbackSession.user ? "fallback" : "none",
    supabaseUser: user ? "found" : userError ? userError.message : "missing",
  });

  if (!sessionUser) {
    return { debug, status: "unauthenticated", profile: null };
  }

  const profileClient = hasSupabaseServiceConfig()
    ? createSupabaseServiceClient()
    : supabase;

  if (uuidPattern.test(sessionUser.id)) {
    const byAuthUser = await profileClient
      .from("profiles")
      .select("*")
      .eq("auth_user_id", sessionUser.id)
      .maybeSingle();

    if (byAuthUser.error) {
      debug.profileLookup = `auth_user_id error: ${byAuthUser.error.message}`;
    }

    if (byAuthUser.data) {
      debug.profileLookup = "found by auth_user_id";
      return { debug, status: "ok", profile: byAuthUser.data };
    }
  }

  if (sessionUser.email) {
    const byEmail = await profileClient
      .from("profiles")
      .select("*")
      .eq("email", sessionUser.email)
      .maybeSingle();

    if (byEmail.error) {
      debug.profileLookup = `email error: ${byEmail.error.message}`;
    }

    if (byEmail.data) {
      debug.profileLookup = "found by email";
      return { debug, status: "ok", profile: byEmail.data };
    }
  }

  if (debug.profileLookup === "not checked") {
    debug.profileLookup = "not found";
  }

  return { debug, status: "missing_profile", profile: null };
}

export async function getAdminAccess(): Promise<AdminAccess> {
  const access = await getCurrentProfile();

  if (access.status !== "ok") {
    return access;
  }

  if (access.profile.role !== "admin") {
    return { debug: access.debug, status: "forbidden", profile: null };
  }

  return access;
}
