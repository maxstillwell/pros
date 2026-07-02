import { getAdminAccess } from "@/lib/auth/profile";
import { getAccountingLedger, getAccountingSummary } from "@/lib/accounting";
import {
  generateAccountingLedgerPdf,
  getAccountingLedgerPdfFilename,
} from "@/lib/pdf/accounting-ledger-pdf";

export async function GET() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return new Response("Not authorised.", { status: 401 });
  }

  const rows = await getAccountingLedger({ limit: 5000 });
  const pdf = Buffer.from(
    generateAccountingLedgerPdf({
      generatedAt: new Date(),
      rows,
      summary: getAccountingSummary(rows),
    }),
    "base64",
  );

  return new Response(pdf, {
    headers: {
      "Content-Disposition": `attachment; filename="${getAccountingLedgerPdfFilename()}"`,
      "Content-Type": "application/pdf",
    },
  });
}
