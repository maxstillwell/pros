import "server-only";

import { formatMelbourneDate } from "@/lib/time";

type InvoicePdfInput = {
  amount: number;
  bill_to_address?: string | null;
  bill_to_email?: string | null;
  bill_to_name: string;
  currency?: string | null;
  description: string;
  due_at?: string | null;
  invoice_number: string;
  issued_at?: string | null;
  notes?: string | null;
};

const pageWidth = 612;
const pageHeight = 792;
const margin = 48;
const colors = {
  black: "0 0 0",
  border: "0.78 0.73 0.66",
  clay: "0.72 0.32 0.08",
  forest: "0.04 0.15 0.10",
  muted: "0.34 0.37 0.32",
  soft: "0.96 0.95 0.91",
  white: "1 1 1",
};

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

function formatInvoiceDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return formatMelbourneDate(new Date(Date.UTC(year, month - 1, day, 12)));
  }

  return formatMelbourneDate(value);
}

function formatMoney(amount: number, currency: string | null | undefined) {
  const code = (currency || "aud").toUpperCase();
  return `${code} ${(amount / 100).toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function wrapText(value: string, maxChars: number) {
  return value
    .split(/\r?\n/)
    .flatMap((line) => {
      const words = line.trim().split(/\s+/).filter(Boolean);
      const rows: string[] = [];
      let current = "";

      for (const word of words) {
        if (word.length > maxChars) {
          if (current) {
            rows.push(current);
            current = "";
          }

          for (let index = 0; index < word.length; index += maxChars) {
            rows.push(word.slice(index, index + maxChars));
          }

          continue;
        }

        const next = current ? `${current} ${word}` : word;

        if (next.length > maxChars) {
          rows.push(current);
          current = word;
        } else {
          current = next;
        }
      }

      if (current) {
        rows.push(current);
      }

      return rows.length ? rows : [""];
    });
}

function approxTextWidth(value: string, size: number) {
  return value.length * size * 0.52;
}

function text(
  commands: string[],
  x: number,
  y: number,
  value: string,
  {
    color = colors.black,
    font = "F1",
    size = 10,
  }: {
    color?: string;
    font?: "F1" | "F2";
    size?: number;
  } = {},
) {
  commands.push(
    `q ${color} rg BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${pdfEscape(value)}) Tj ET Q`,
  );
}

function rightText(
  commands: string[],
  rightX: number,
  y: number,
  value: string,
  options: Parameters<typeof text>[4] = {},
) {
  const size = options?.size ?? 10;
  text(commands, rightX - approxTextWidth(value, size), y, value, options);
}

function rect(
  commands: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  {
    fill,
    stroke = colors.border,
  }: {
    fill?: string;
    stroke?: string;
  } = {},
) {
  if (fill) {
    commands.push(`q ${fill} rg ${x} ${y} ${width} ${height} re f Q`);
  }

  commands.push(`q 1 w ${stroke} RG ${x} ${y} ${width} ${height} re S Q`);
}

function line(commands: string[], x1: number, y1: number, x2: number, y2: number) {
  commands.push(`q 1 w ${colors.border} RG ${x1} ${y1} m ${x2} ${y2} l S Q`);
}

function buildPdf(objects: string[]) {
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

export function getInvoicePdfFilename(input: InvoicePdfInput) {
  const invoiceNumber = cleanFilePart(input.invoice_number || "invoice");
  const billTo = cleanFilePart(input.bill_to_name || "sponsor");

  return `PROS-Invoice-${invoiceNumber}-${billTo}.pdf`;
}

export function generateInvoicePdf(input: InvoicePdfInput) {
  const commands: string[] = [];
  const tableLeft = margin;
  const tableWidth = pageWidth - margin * 2;
  const amountRight = pageWidth - margin;
  const amountColumnLeft = 448;
  const total = formatMoney(input.amount, input.currency);
  const descriptionLines = wrapText(input.description, 68).slice(0, 8);
  const billToLines = [
    input.bill_to_name,
    ...(input.bill_to_address ? wrapText(input.bill_to_address, 38) : []),
    ...(input.bill_to_email ? [`Email: ${input.bill_to_email}`] : []),
  ].slice(0, 7);
  const noteLines = wrapText(
    input.notes ||
      "Please include the invoice number as your payment reference.",
    54,
  ).slice(0, 8);

  rect(commands, 0, 742, pageWidth, 50, { fill: colors.forest, stroke: colors.forest });
  text(commands, margin, 762, "Prime Range Outdoor Society Inc.", {
    color: colors.white,
    font: "F2",
    size: 16,
  });
  text(commands, margin, 747, "ABN 43 632 785 626 | Not registered for GST", {
    color: colors.white,
    size: 9,
  });
  rightText(commands, pageWidth - margin, 756, "INVOICE", {
    color: colors.white,
    font: "F2",
    size: 26,
  });

  text(commands, margin, 710, "pros.org.au", {
    color: colors.muted,
    size: 10,
  });
  text(commands, margin, 694, "This invoice does not include GST.", {
    color: colors.muted,
    size: 10,
  });

  const metaLeft = 382;
  text(commands, metaLeft, 710, "Invoice #", {
    color: colors.clay,
    font: "F2",
    size: 9,
  });
  text(commands, metaLeft + 86, 710, input.invoice_number, {
    font: "F2",
    size: 10,
  });
  text(commands, metaLeft, 692, "Date", {
    color: colors.clay,
    font: "F2",
    size: 9,
  });
  text(commands, metaLeft + 86, 692, formatInvoiceDate(input.issued_at), {
    size: 10,
  });
  text(commands, metaLeft, 674, "Due", {
    color: colors.clay,
    font: "F2",
    size: 9,
  });
  text(commands, metaLeft + 86, 674, formatInvoiceDate(input.due_at), {
    size: 10,
  });

  rect(commands, margin, 556, 250, 92, { fill: colors.soft });
  text(commands, margin + 16, 625, "BILL TO", {
    color: colors.clay,
    font: "F2",
    size: 9,
  });
  billToLines.forEach((row, index) => {
    text(commands, margin + 16, 607 - index * 14, row, {
      font: index === 0 ? "F2" : "F1",
      size: index === 0 ? 11 : 9,
    });
  });

  rect(commands, tableLeft, 512, tableWidth, 28, {
    fill: colors.forest,
    stroke: colors.forest,
  });
  text(commands, tableLeft + 16, 523, "DESCRIPTION", {
    color: colors.white,
    font: "F2",
    size: 10,
  });
  rightText(commands, amountRight - 16, 523, "AMOUNT", {
    color: colors.white,
    font: "F2",
    size: 10,
  });

  const rowHeight = Math.max(82, descriptionLines.length * 14 + 30);
  rect(commands, tableLeft, 512 - rowHeight, tableWidth, rowHeight);
  line(commands, amountColumnLeft, 512, amountColumnLeft, 512 - rowHeight);
  descriptionLines.forEach((row, index) => {
    text(commands, tableLeft + 16, 488 - index * 14, row, { size: 10 });
  });
  rightText(commands, amountRight - 16, 488, total, { font: "F2", size: 10 });

  const summaryTop = 382;
  const summaryLeft = 350;
  const summaryWidth = pageWidth - margin - summaryLeft;
  rect(commands, summaryLeft, summaryTop - 86, summaryWidth, 86, { fill: colors.soft });
  text(commands, summaryLeft + 16, summaryTop - 24, "Subtotal", { size: 10 });
  rightText(commands, amountRight - 16, summaryTop - 24, total, { size: 10 });
  text(commands, summaryLeft + 16, summaryTop - 46, "GST", { size: 10 });
  rightText(commands, amountRight - 16, summaryTop - 46, "Not applicable", {
    size: 10,
  });
  line(commands, summaryLeft + 16, summaryTop - 58, amountRight - 16, summaryTop - 58);
  text(commands, summaryLeft + 16, summaryTop - 74, "TOTAL", {
    color: colors.forest,
    font: "F2",
    size: 12,
  });
  rightText(commands, amountRight - 16, summaryTop - 74, total, {
    color: colors.forest,
    font: "F2",
    size: 12,
  });

  text(commands, margin, 316, "Payment / notes", {
    color: colors.clay,
    font: "F2",
    size: 11,
  });
  noteLines.forEach((row, index) => {
    text(commands, margin, 296 - index * 14, row, {
      color: colors.muted,
      size: 9,
    });
  });

  line(commands, margin, 94, pageWidth - margin, 94);
  text(
    commands,
    margin,
    72,
    "Thank you for supporting Prime Range Outdoor Society Inc.",
    {
      color: colors.forest,
      font: "F2",
      size: 11,
    },
  );
  text(commands, margin, 56, "Private member-only outdoor society.", {
    color: colors.muted,
    size: 9,
  });

  const stream = commands.join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj`,
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj",
    `6 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`,
  ];

  return buildPdf(objects);
}
