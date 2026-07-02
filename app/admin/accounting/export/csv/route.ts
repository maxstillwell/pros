import { getAdminAccess } from "@/lib/auth/profile";
import { getAccountingLedger } from "@/lib/accounting";

function csvEscape(value: string | number | null | undefined) {
  const text = String(value ?? "");

  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function moneyForCsv(amount: number) {
  return (amount / 100).toFixed(2);
}

function csvFilename() {
  return `PROS-Accounting-Ledger-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
}

export async function GET() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    return new Response("Not authorised.", { status: 401 });
  }

  const rows = await getAccountingLedger({ limit: 5000 });
  const header = [
    "Date",
    "Item",
    "Notes",
    "Credit",
    "Debit",
    "Balance",
    "Currency",
    "Attachments",
  ];
  const body = rows.map((row) =>
    [
      row.transaction_date,
      row.item,
      row.notes,
      moneyForCsv(row.credit),
      moneyForCsv(row.debit),
      moneyForCsv(row.balance),
      row.currency.toUpperCase(),
      row.attachments.map((attachment) => attachment.file_name).join("; "),
    ]
      .map(csvEscape)
      .join(","),
  );
  const csv = [`\ufeff${header.map(csvEscape).join(",")}`, ...body].join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="${csvFilename()}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
