import "server-only";

import type { AccountingLedgerRow, AccountingSummary } from "@/lib/accounting";
import { formatMelbourneDate } from "@/lib/time";

type AccountingLedgerPdfInput = {
  generatedAt: Date;
  rows: AccountingLedgerRow[];
  summary: AccountingSummary;
};

const pageWidth = 612;
const pageHeight = 792;
const margin = 36;
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
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, "?");
}

function formatMoney(amount: number, currency = "aud") {
  return `${currency.toUpperCase()} ${(amount / 100).toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function wrapText(value: string, maxChars: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const rows: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxChars) {
      if (current) {
        rows.push(current);
      }

      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    rows.push(current);
  }

  return rows.length ? rows : [""];
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

function buildPdf(pageStreams: string[]) {
  const pageCount = pageStreams.length;
  const pageObjectStart = 3;
  const fontObjectStart = pageObjectStart + pageCount;
  const contentObjectStart = fontObjectStart + 2;
  const pageIds = Array.from(
    { length: pageCount },
    (_, index) => pageObjectStart + index,
  );
  const objects: string[] = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    `2 0 obj << /Type /Pages /Kids [${pageIds
      .map((id) => `${id} 0 R`)
      .join(" ")}] /Count ${pageCount} >> endobj`,
  ];

  pageStreams.forEach((stream, index) => {
    const pageId = pageObjectStart + index;
    const contentId = contentObjectStart + index;

    objects.push(
      `${pageId} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectStart} 0 R /F2 ${
        fontObjectStart + 1
      } 0 R >> >> /Contents ${contentId} 0 R >> endobj`,
    );
  });

  objects.push(
    `${fontObjectStart} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`,
  );
  objects.push(
    `${
      fontObjectStart + 1
    } 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj`,
  );

  pageStreams.forEach((stream, index) => {
    objects.push(
      `${contentObjectStart + index} 0 obj << /Length ${Buffer.byteLength(
        stream,
      )} >> stream\n${stream}\nendstream endobj`,
    );
  });

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

function drawHeader(commands: string[], generatedAt: Date) {
  rect(commands, 0, 736, pageWidth, 56, {
    fill: colors.forest,
    stroke: colors.forest,
  });
  text(commands, margin, 762, "Prime Range Outdoor Society Inc.", {
    color: colors.white,
    font: "F2",
    size: 15,
  });
  text(commands, margin, 746, "Accounting ledger statement", {
    color: colors.white,
    size: 10,
  });
  rightText(commands, pageWidth - margin, 756, "ACCOUNTING", {
    color: colors.white,
    font: "F2",
    size: 22,
  });
  rightText(
    commands,
    pageWidth - margin,
    742,
    `Generated ${formatMelbourneDate(generatedAt)}`,
    {
      color: colors.white,
      size: 8.5,
    },
  );
}

function drawFooter(commands: string[], page: number, pageCount: number) {
  line(commands, margin, 42, pageWidth - margin, 42);
  text(commands, margin, 25, "pros.org.au | ABN 43 632 785 626", {
    color: colors.muted,
    size: 8.5,
  });
  rightText(commands, pageWidth - margin, 25, `Page ${page} of ${pageCount}`, {
    color: colors.muted,
    size: 8.5,
  });
}

function drawSummary(commands: string[], summary: AccountingSummary) {
  const labels = [
    ["Current balance", formatMoney(summary.balance)],
    ["Total credit", formatMoney(summary.totalCredit)],
    ["Total debit", formatMoney(summary.totalDebit)],
    ["Transactions", summary.count.toLocaleString("en-AU")],
  ];
  const boxWidth = (pageWidth - margin * 2 - 24) / 4;

  labels.forEach(([label, value], index) => {
    const x = margin + index * (boxWidth + 8);
    rect(commands, x, 666, boxWidth, 44, { fill: colors.soft });
    text(commands, x + 10, 692, label, {
      color: colors.clay,
      font: "F2",
      size: 7.5,
    });
    text(commands, x + 10, 676, value, {
      color: colors.forest,
      font: "F2",
      size: 10,
    });
  });
}

function drawTableHeader(commands: string[], y: number) {
  rect(commands, margin, y, pageWidth - margin * 2, 24, {
    fill: colors.forest,
    stroke: colors.forest,
  });
  text(commands, margin + 8, y + 9, "DATE", {
    color: colors.white,
    font: "F2",
    size: 8,
  });
  text(commands, margin + 84, y + 9, "ITEM", {
    color: colors.white,
    font: "F2",
    size: 8,
  });
  rightText(commands, 390, y + 9, "CREDIT", {
    color: colors.white,
    font: "F2",
    size: 8,
  });
  rightText(commands, 468, y + 9, "DEBIT", {
    color: colors.white,
    font: "F2",
    size: 8,
  });
  rightText(commands, pageWidth - margin - 18, y + 9, "BALANCE", {
    color: colors.white,
    font: "F2",
    size: 8,
  });
}

function drawRow(commands: string[], row: AccountingLedgerRow, y: number) {
  rect(commands, margin, y - 28, pageWidth - margin * 2, 28);
  text(commands, margin + 8, y - 11, formatMelbourneDate(row.transaction_date), {
    color: colors.muted,
    size: 8,
  });

  const [itemLine] = wrapText(row.item, 36);
  text(commands, margin + 84, y - 10, itemLine, {
    font: "F2",
    size: 8.5,
  });

  if (row.notes) {
    const [noteLine] = wrapText(row.notes, 52);
    text(commands, margin + 84, y - 22, noteLine, {
      color: colors.muted,
      size: 7,
    });
  }

  rightText(commands, 390, y - 11, row.credit ? formatMoney(row.credit) : "-", {
    size: 8,
  });
  rightText(commands, 468, y - 11, row.debit ? formatMoney(row.debit) : "-", {
    size: 8,
  });
  rightText(commands, pageWidth - margin - 18, y - 11, formatMoney(row.balance), {
    font: "F2",
    size: 8,
  });
}

export function getAccountingLedgerPdfFilename() {
  return `PROS-Accounting-Ledger-${formatMelbourneDate(new Date())
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")}.pdf`;
}

export function generateAccountingLedgerPdf(input: AccountingLedgerPdfInput) {
  const rowsPerFirstPage = 16;
  const rowsPerPage = 20;
  const pages: AccountingLedgerRow[][] = [];

  if (input.rows.length) {
    pages.push(input.rows.slice(0, rowsPerFirstPage));

    for (
      let index = rowsPerFirstPage;
      index < input.rows.length;
      index += rowsPerPage
    ) {
      pages.push(input.rows.slice(index, index + rowsPerPage));
    }
  } else {
    pages.push([]);
  }

  const pageStreams = pages.map((pageRows, pageIndex) => {
    const commands: string[] = [];
    const isFirstPage = pageIndex === 0;
    const tableHeaderY = isFirstPage ? 604 : 682;
    let y = tableHeaderY;

    drawHeader(commands, input.generatedAt);

    if (isFirstPage) {
      drawSummary(commands, input.summary);
      text(commands, margin, 630, "Transactions", {
        color: colors.clay,
        font: "F2",
        size: 11,
      });
    }

    drawTableHeader(commands, tableHeaderY);
    y -= 4;

    if (pageRows.length) {
      pageRows.forEach((row) => {
        y -= 28;
        drawRow(commands, row, y + 28);
      });
    } else {
      text(commands, margin + 8, y - 24, "No transactions recorded.", {
        color: colors.muted,
        size: 9,
      });
    }

    drawFooter(commands, pageIndex + 1, pages.length);

    return commands.join("\n");
  });

  return buildPdf(pageStreams);
}
