import "server-only";

import {
  createSupabaseServiceClient,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Invoice = Database["public"]["Tables"]["sponsor_invoices"]["Row"];

export async function getInvoices({ limit = 50 }: { limit?: number } = {}) {
  if (!hasSupabaseServiceConfig()) {
    return [] as Invoice[];
  }

  const { data, error } = await createSupabaseServiceClient()
    .from("sponsor_invoices")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [] as Invoice[];
  }

  return data;
}
