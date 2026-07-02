import "server-only";

import {
  createSupabaseServiceClient,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Invoice = Database["public"]["Tables"]["sponsor_invoices"]["Row"];
export type AccountingTransaction =
  Database["public"]["Tables"]["accounting_transactions"]["Row"];
export type AccountingAttachment =
  Database["public"]["Tables"]["accounting_attachments"]["Row"];
export type AccountingLedgerRow = AccountingTransaction & {
  attachments: AccountingAttachment[];
  balance: number;
};

export type AccountingSummary = {
  balance: number;
  count: number;
  totalCredit: number;
  totalDebit: number;
};

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

export function buildLedgerRows(
  transactions: AccountingTransaction[],
  attachments: AccountingAttachment[],
) {
  const attachmentsByTransaction = new Map<string, AccountingAttachment[]>();

  for (const attachment of attachments) {
    const group = attachmentsByTransaction.get(attachment.transaction_id) ?? [];
    group.push(attachment);
    attachmentsByTransaction.set(attachment.transaction_id, group);
  }

  let balance = 0;

  return transactions.map((transaction) => {
    balance += transaction.credit - transaction.debit;

    return {
      ...transaction,
      attachments: attachmentsByTransaction.get(transaction.id) ?? [],
      balance,
    };
  });
}

export function getAccountingSummary(rows: AccountingLedgerRow[]) {
  return rows.reduce<AccountingSummary>(
    (summary, row) => ({
      balance: row.balance,
      count: summary.count + 1,
      totalCredit: summary.totalCredit + row.credit,
      totalDebit: summary.totalDebit + row.debit,
    }),
    {
      balance: 0,
      count: 0,
      totalCredit: 0,
      totalDebit: 0,
    },
  );
}

export async function getAccountingLedger({
  limit = 500,
}: { limit?: number } = {}) {
  if (!hasSupabaseServiceConfig()) {
    return [] as AccountingLedgerRow[];
  }

  const supabase = createSupabaseServiceClient();
  const { data: transactions, error } = await supabase
    .from("accounting_transactions")
    .select("*")
    .order("transaction_date", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error || !transactions?.length) {
    return [] as AccountingLedgerRow[];
  }

  const ids = transactions.map((transaction) => transaction.id);
  const { data: attachments } = await supabase
    .from("accounting_attachments")
    .select("*")
    .in("transaction_id", ids)
    .order("created_at", { ascending: true });

  return buildLedgerRows(transactions, attachments ?? []);
}
