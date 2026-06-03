import "server-only";

import { acknowledgementAgreements } from "@/lib/validators/application";
import { formatMelbourneDateTime } from "@/lib/time";

type ApplicationPdfInput = {
  applicant_signature?: string | null;
  application_date?: string | null;
  date_of_birth?: string | null;
  email: string;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relationship?: string | null;
  firearms_licence_number?: string | null;
  full_name: string;
  licence_category?: string | null;
  licence_expiry_date?: string | null;
  occupation?: string | null;
  outdoor_interests?: string | null;
  outdoor_interests_other?: string | null;
  phone_number?: string | null;
  residential_address?: string | null;
  created_at?: string | null;
} & Record<string, unknown>;

function pdfEscape(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function cleanFilePart(value: string) {
  return value
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function line(label: string, value: unknown) {
  if (typeof value === "boolean") {
    return `${label}: ${value ? "Yes" : "No"}`;
  }

  return `${label}: ${value || "Not set"}`;
}

export function getApplicationPdfFilename(input: ApplicationPdfInput) {
  const name = cleanFilePart(input.full_name || "Applicant") || "Applicant";
  const date = new Date(input.created_at ?? Date.now()).toISOString().slice(0, 10);

  return `PROS-Application-${name}-${date}.pdf`;
}

export function generateApplicationPdf(input: ApplicationPdfInput) {
  const rows = [
    "PROS Membership Application",
    "",
    line("Applicant", input.full_name),
    line("Email", input.email),
    line("Phone", input.phone_number),
    line("Submitted", formatMelbourneDateTime(input.created_at ?? new Date())),
    "",
    line("Date of Birth", input.date_of_birth),
    line("Residential Address", input.residential_address),
    line("Occupation", input.occupation),
    line("Firearms Licence Number", input.firearms_licence_number),
    line("Licence Category", input.licence_category),
    line("Licence Expiry Date", input.licence_expiry_date),
    "",
    line("Emergency Contact", input.emergency_contact_name),
    line("Emergency Relationship", input.emergency_contact_relationship),
    line("Emergency Phone", input.emergency_contact_phone),
    "",
    line("Outdoor Interests", input.outdoor_interests),
    line("Other Interests", input.outdoor_interests_other),
    "",
    ...acknowledgementAgreements.map((agreement) =>
      line(agreement.label, input[agreement.name]),
    ),
    line("Liability Waiver Accepted", input.accept_liability_waiver),
    line("Privacy Consent Accepted", input.accept_privacy_consent),
    "",
    line("Applicant Signature", input.applicant_signature),
    line("Application Date", input.application_date),
  ];

  const contentLines = rows.flatMap((row, index) => {
    const y = 770 - index * 16;
    return y > 40 ? [`1 0 0 1 50 ${y} Tm (${pdfEscape(row)}) Tj`] : [];
  });
  const stream = `BT /F1 10 Tf 14 TL ${contentLines.join("\n")} ET`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${object}\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .slice(1)
    .map((offset) => `${offset.toString().padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf).toString("base64");
}
