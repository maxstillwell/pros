import {
  formatMelbourneDate,
  formatMelbourneDateTime,
} from "@/lib/time";

export function formatDate(value: string | null) {
  return formatMelbourneDate(value);
}

export function formatDateTime(value: string | null) {
  return formatMelbourneDateTime(value);
}
