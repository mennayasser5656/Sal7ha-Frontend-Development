/**
 * Shared date utilities for the entire project.
 * All date parsing, formatting, and calendar generation lives here.
 */

// ── Constants ──

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_LABELS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// ── Parsing ──

/** Parse "M/D/YYYY" string into a Date object. */
export function parseDate(dateStr: string): Date {
  const parts = dateStr.split("/");
  return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
}

/** Parse "M/D/YYYY" string into a timestamp (ms). */
export function parseDateMs(dateStr: string): number {
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`).getTime();
  }
  return new Date(dateStr).getTime();
}

/** Parse strict "MM/DD/YYYY" string with validation. Returns null if invalid. */
export function parseDateStrict(str: string): Date | null {
  const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, mm, dd, yyyy] = match;
  const m = parseInt(mm, 10);
  const d = parseInt(dd, 10);
  const y = parseInt(yyyy, 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d);
  if (date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

// ── Formatting ──

/** Format Date as "M/D/YYYY" (no zero-padding). */
export function formatDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

/** Format Date as "MM/DD/YYYY" (zero-padded). */
export function formatDatePadded(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

/** Format Date as "15 Mar" short display. */
export function formatDateShort(date: Date): string {
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
}

/** Format a booking date range, e.g. "15-20 Mar" or "28 Mar - 2 Apr". */
export function formatBookingDateRange(startDate: string, endDate: string): string {
  const s = parseDate(startDate);
  const e = parseDate(endDate);
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()}-${e.getDate()} ${SHORT_MONTHS[s.getMonth()]}`;
  }
  return `${s.getDate()} ${SHORT_MONTHS[s.getMonth()]} - ${e.getDate()} ${SHORT_MONTHS[e.getMonth()]}`;
}

// ── Comparison ──

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ── Calendar grid generation ──

export interface CalendarCell {
  day: number;
  month: number;
  year: number;
  date: Date;
  outside: boolean;
}

/** Generate a 7-column calendar grid for the given month. */
export function getCalendarDays(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    const d = daysInPrevMonth - i;
    cells.push({ day: d, month: prevM, year: prevY, date: new Date(prevY, prevM, d), outside: true });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, date: new Date(year, month, d), outside: false });
  }

  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, month: nextM, year: nextY, date: new Date(nextY, nextM, d), outside: true });
    }
  }

  return cells;
}

/** Generate a year range centered on the current year. */
export function getYearRange(center?: number, span = 5): number[] {
  const current = center ?? new Date().getFullYear();
  const years: number[] = [];
  for (let y = current - span; y <= current + span; y++) years.push(y);
  return years;
}
