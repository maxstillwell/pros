import { getAdminAccess } from "@/lib/auth/profile";
import {
  generateApplicationPdf,
  getApplicationPdfFilename,
} from "@/lib/pdf/application-pdf";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type ApplicationPdfRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: ApplicationPdfRouteProps) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return new Response("Not authorised.", { status: 401 });
  }

  const { id } = await params;
  const { data: application } = await createSupabaseServiceClient()
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (!application) {
    return new Response("Application not found.", { status: 404 });
  }

  const pdf = Buffer.from(generateApplicationPdf(application), "base64");
  const filename = getApplicationPdfFilename(application);

  return new Response(pdf, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/pdf",
    },
  });
}
