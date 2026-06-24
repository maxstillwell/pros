"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/profile";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value ? value : null;
}

function readAmountCents(formData: FormData) {
  const value = readString(formData, "amount_dollars");

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

async function getAccountingActionContext(formData: FormData, idRequired = true) {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    redirect("/login?redirectTo=/admin/accounting");
  }

  const id = readString(formData, "id");

  if (idRequired && !id) {
    redirect("/admin/accounting?error=missing-id#invoices");
  }

  return {
    id,
    supabase: createSupabaseServiceClient(),
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

export async function deleteInvoice(formData: FormData) {
  const { id, supabase } = await getAccountingActionContext(formData);
  const { error } = await supabase.from("sponsor_invoices").delete().eq("id", id);

  revalidatePath("/admin/accounting");

  if (error) {
    redirect("/admin/accounting?error=invoice-delete#invoices");
  }

  redirect("/admin/accounting?saved=invoice-deleted#invoices");
}
