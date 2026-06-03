/** Normalize a stored/API date to `YYYY-MM` for month pickers. */
export function toMonthInputValue(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01`;
  const match = trimmed.match(/^(\d{4}-\d{2})/);
  if (match) return match[1];
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }
  return "";
}

/** Convert month input (`YYYY-MM`) to a PostgreSQL-compatible date (`YYYY-MM-01`). */
export function monthInputToApiDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}$/.test(trimmed)) return `${trimmed}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  return null;
}

/** Parse a month value into a Date for calendar display. */
export function monthValueToDate(value: string | null | undefined): Date | undefined {
  const monthValue = toMonthInputValue(value);
  if (!monthValue) return undefined;
  const [year, month] = monthValue.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

/** Convert a calendar Date to `YYYY-MM`. */
export function dateToMonthValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/** Display a stored date as "Feb 2025". */
export function formatMonthYear(value: string | null | undefined): string {
  if (!value) return "";
  const monthValue = toMonthInputValue(value);
  if (!monthValue) return value;
  const [year, month] = monthValue.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}
