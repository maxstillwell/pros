import { redirect } from "next/navigation";
import {
  createSupabaseServerClient,
  hasSupabasePublicConfig,
} from "@/lib/supabase/server";

export async function GET() {
  if (hasSupabasePublicConfig()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
