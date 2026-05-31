import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  getSupabasePublicConfig,
  getSupabaseServiceConfig,
} from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export async function createSupabaseServerClient() {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components cannot always write cookies. Route handlers and
          // server actions can, and Supabase will refresh there when needed.
        }
      },
    },
  });
}

export function createSupabaseServiceClient() {
  const config = getSupabaseServiceConfig();

  if (!config) {
    throw new Error("Supabase service role environment variables are not configured.");
  }

  return createClient<Database>(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function hasSupabasePublicConfig() {
  return getSupabasePublicConfig() !== null;
}

export function hasSupabaseServiceConfig() {
  return getSupabaseServiceConfig() !== null;
}
