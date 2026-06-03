const melbourneTimeZone = "Australia/Melbourne";

function toDate(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  const date = typeof value === "string" ? new Date(value) : value;

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatMelbourneDate(value: string | Date | null | undefined) {
  const date = toDate(value);

  if (!date) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    timeZone: melbourneTimeZone,
    year: "numeric",
  }).format(date);
}

export function formatMelbourneDateTime(
  value: string | Date | null | undefined,
) {
  const date = toDate(value);

  if (!date) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZone: melbourneTimeZone,
    year: "numeric",
  }).format(date);
}

export function addOneYearMelbourne(value: string | Date | null | undefined) {
  const date = toDate(value) ?? new Date();
  const nextYear = new Date(date);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  return nextYear.toISOString();
}
