// Formatting helpers. A fixed locale keeps server and browser output identical
// (avoiding hydration mismatches) and makes tests deterministic.
const LOCALE = "en-US";

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  year: "numeric",
  month: "short",
  day: "numeric",
  // Date-only values are stored as "YYYY-MM-DD". Formatting them as UTC stops
  // "2026-10-12" turning into Oct 11 for anyone west of Greenwich.
  timeZone: "UTC",
});

/** "2026-10-12" -> "Oct 12, 2026" */
export function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
});

/** ISO timestamp -> "Oct 12, 2026, 3:04 PM" in the viewer's timezone. */
export function formatDateTime(timestamp: string) {
  return dateTimeFormatter.format(new Date(timestamp));
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Unknown currency code: fall back to "85,000 XYZ".
    return `${new Intl.NumberFormat(LOCALE).format(amount)} ${currency}`;
  }
}

/** Formats a salary range, or returns null when neither end is set. */
export function formatSalaryRange(min: number | null, max: number | null, currency: string) {
  if (min !== null && max !== null) {
    return min === max
      ? formatMoney(min, currency)
      : `${formatMoney(min, currency)} – ${formatMoney(max, currency)}`;
  }
  if (min !== null) return `From ${formatMoney(min, currency)}`;
  if (max !== null) return `Up to ${formatMoney(max, currency)}`;
  return null;
}
