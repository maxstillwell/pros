"use server";

import { randomInt, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const accountingAttachmentBucket = "accounting-attachments";
const maxAttachmentSize = 3 * 1024 * 1024;
const allowedAttachmentTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value ? value : null;
}

function readAmountCents(formData: FormData) {
  return readMoneyCents(formData, "amount_dollars");
}

function readMoneyCents(formData: FormData, key: string) {
  const value = readString(formData, key);

  if (!value) {
    return null;
  }

  const amount = Number(value.replaceAll(",", ""));
  return Number.isFinite(amount) ? Math.round(amount * 100) : null;
}

function readNullableDate(formData: FormData, key: string) {
  const value = readString(formData, key);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function readFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "size" in value &&
    "name" in value &&
    "type" in value
  ) {
    return value as File;
  }

  return null;
}

function melbourneDatePart() {
  const parts = new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Australia/Melbourne",
    year: "numeric",
  }).formatToParts(new Date());
  const byType = new Map(parts.map((part) => [part.type, part.value]));

  return `${byType.get("year")}${byType.get("month")}${byType.get("day")}`;
}

function generateInvoiceNumber() {
  return `INV-${melbourneDatePart()}-${randomInt(1000, 10000)}`;
}

async function getAccountingActionContext(
  formData: FormData,
  idRequired = true,
  missingAnchor = "invoices",
) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    redirect("/login?redirectTo=/admin/accounting");
  }

  const id = readString(formData, "id");

  if (idRequired && !id) {
    redirect(`/admin/accounting?error=missing-id#${missingAnchor}`);
  }

  return {
    id,
    supabase: createSupabaseServiceClient(),
  };
}

function transactionPayload(formData: FormData) {
  const transactionDate = readNullableDate(formData, "transaction_date");
  const item = readString(formData, "item");
  const notes = readNullableString(formData, "notes");
  const credit = readMoneyCents(formData, "credit_dollars") ?? 0;
  const debit = readMoneyCents(formData, "debit_dollars") ?? 0;

  if (!item || (credit <= 0 && debit <= 0) || (credit > 0 && debit > 0)) {
    redirect("/admin/accounting?error=transaction-required#transactions");
  }

  return {
    credit,
    currency: "aud",
    debit,
    item,
    notes,
    transaction_date: transactionDate ?? undefined,
  };
}

function cleanFilePart(value: string) {
  return value
    .trim()
    .replace(/[^a-z0-9.]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function validateAttachmentFile(formData: FormData) {
  const file = readFile(formData, "attachment");

  if (!file?.size) {
    return;
  }

  if (!allowedAttachmentTypes.includes(file.type)) {
    redirect("/admin/accounting?error=attachment-type#transactions");
  }

  if (file.size > maxAttachmentSize) {
    redirect("/admin/accounting?error=attachment-size#transactions");
  }
}

async function uploadTransactionAttachment(
  formData: FormData,
  transactionId: string,
  supabase: ReturnType<typeof createSupabaseServiceClient>,
) {
  const file = readFile(formData, "attachment");

  if (!file?.size) {
    return null;
  }

  const fileName = cleanFilePart(file.name) || `attachment-${randomUUID()}`;
  const filePath = `${transactionId}/${Date.now()}-${randomUUID()}-${fileName}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(accountingAttachmentBucket)
    .upload(filePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return {
      error: true,
      filePath,
    };
  }

  const { error: insertError } = await supabase
    .from("accounting_attachments")
    .insert({
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      transaction_id: transactionId,
    });

  if (insertError) {
    await supabase.storage.from(accountingAttachmentBucket).remove([filePath]);

    return {
      error: true,
      filePath,
    };
  }

  return {
    error: false,
    filePath,
  };
}

function invoicePayload(formData: FormData, invoiceNumber: string) {
  const amount = readAmountCents(formData);
  const billToName = readString(formData, "bill_to_name");
  const description = readString(formData, "description");

  if (!billToName || !description || amount === null || amount <= 0) {
    redirect("/admin/accounting?error=invoice-required#invoices");
  }

  return {
    amount,
    bill_to_address: readNullableString(formData, "bill_to_address"),
    bill_to_email: readNullableString(formData, "bill_to_email"),
    bill_to_name: billToName,
    currency: "aud",
    description,
    due_at: readNullableDate(formData, "due_at"),
    invoice_number: invoiceNumber,
    issued_at: readNullableDate(formData, "issued_at") ?? undefined,
    notes: readNullableString(formData, "notes"),
    sponsor_id: readNullableString(formData, "sponsor_id"),
    status: "issued" as const,
  };
}

export async function createInvoice(formData: FormData) {
  const { supabase } = await getAccountingActionContext(formData, false);
  const providedInvoiceNumber = readString(formData, "invoice_number");
  let lastError = false;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const invoiceNumber =
      attempt === 0 && providedInvoiceNumber
        ? providedInvoiceNumber
        : generateInvoiceNumber();
    const payload = invoicePayload(formData, invoiceNumber);
    const { data, error } = await supabase
      .from("sponsor_invoices")
      .insert(payload)
      .select("id")
      .single();

    if (!error && data?.id) {
      revalidatePath("/admin/accounting");
      redirect(
        `/admin/accounting?saved=invoice-created&invoice=${data.id}#invoices`,
      );
    }

    lastError = true;

    if (providedInvoiceNumber || error?.code !== "23505") {
      break;
    }
  }

  if (lastError) {
    redirect("/admin/accounting?error=invoice-create#invoices");
  }
}

export async function createTransaction(formData: FormData) {
  const { supabase } = await getAccountingActionContext(formData, false);
  const payload = transactionPayload(formData);
  validateAttachmentFile(formData);
  const { data, error } = await supabase
    .from("accounting_transactions")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data?.id) {
    redirect("/admin/accounting?error=transaction-create#transactions");
  }

  const uploadResult = await uploadTransactionAttachment(
    formData,
    data.id,
    supabase,
  );

  if (uploadResult?.error) {
    await supabase.from("accounting_transactions").delete().eq("id", data.id);
    redirect("/admin/accounting?error=attachment-upload#transactions");
  }

  revalidatePath("/admin/accounting");
  redirect("/admin/accounting?saved=transaction-created#transactions");
}

export async function deleteTransaction(formData: FormData) {
  const { id, supabase } = await getAccountingActionContext(
    formData,
    true,
    "transactions",
  );
  const { data: attachments } = await supabase
    .from("accounting_attachments")
    .select("file_path")
    .eq("transaction_id", id);

  const paths = attachments?.map((attachment) => attachment.file_path) ?? [];

  if (paths.length) {
    await supabase.storage.from(accountingAttachmentBucket).remove(paths);
  }

  const { error } = await supabase
    .from("accounting_transactions")
    .delete()
    .eq("id", id);

  revalidatePath("/admin/accounting");

  if (error) {
    redirect("/admin/accounting?error=transaction-delete#transactions");
  }

  redirect("/admin/accounting?saved=transaction-deleted#transactions");
}

export async function deleteInvoice(formData: FormData) {
  const { id, supabase } = await getAccountingActionContext(formData);
  const { error } = await supabase.from("sponsor_invoices").delete().eq("id", id);

  revalidatePath("/admin/accounting");

  if (error) {
    redirect("/admin/accounting?error=invoice-delete#invoices");
  }

  redirect("/admin/accounting?saved=invoice-deleted#invoices");
}
