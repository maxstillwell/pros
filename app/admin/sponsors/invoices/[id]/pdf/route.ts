import { getAdminAccess } from "@/lib/auth/profile";
import {
  generateSponsorInvoicePdf,
  getSponsorInvoicePdfFilename,
} from "@/lib/pdf/sponsor-invoice-pdf";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type SponsorInvoicePdfRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: SponsorInvoicePdfRouteProps,
) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return new Response("Not authorised.", { status: 401 });
  }

  const { id } = await params;
  const { data: invoice } = await createSupabaseServiceClient()
    .from("sponsor_invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (!invoice) {
    return new Response("Invoice not found.", { status: 404 });
  }

  const pdf = Buffer.from(generateSponsorInvoicePdf(invoice), "base64");
  const filename = getSponsorInvoicePdfFilename(invoice);

  return new Response(pdf, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/pdf",
    },
  });
}
