import Booking from "@/domain/entities/Booking";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thr", "Fri", "Sat"];

function parseDate(dateStr: string): Date {
  const parts = dateStr.split("/");
  return new Date(
    parseInt(parts[2]),
    parseInt(parts[0]) - 1,
    parseInt(parts[1]),
  );
}

export function getMonthName(month: number): string {
  return MONTH_NAMES[month];
}

export function getShortMonthName(month: number): string {
  return SHORT_MONTHS[month];
}

export function getDayLabels(): string[] {
  return DAY_LABELS;
}

export function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; outside: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, outside: true });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, outside: false });
  }

  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, outside: true });
    }
  }

  return cells;
}

export function getBookingsForMonth(
  bookings: Booking[],
  year: number,
  month: number,
): Booking[] {
  return bookings.filter((b) => {
    const start = parseDate(b.startDate);
    const end = parseDate(b.endDate);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    return end >= monthStart && start <= monthEnd;
  });
}

export function formatBookingDateRange(startDate: string, endDate: string): string {
  const s = parseDate(startDate);
  const e = parseDate(endDate);

  const sDay = s.getDate();
  const eDay = e.getDate();
  const sMonth = getShortMonthName(s.getMonth());
  const eMonth = getShortMonthName(e.getMonth());

  if (s.getMonth() === e.getMonth()) {
    return `${sDay}-${eDay} ${sMonth}`;
  }
  return `${sDay} ${sMonth} - ${eDay} ${eMonth}`;
}

const CLIENT_IMAGES = [
  "/assets/man1.avif",
  "/assets/man2.avif",
  "/assets/woman1.jpg",
  "/assets/woman2.avif",
];

export function getClientImage(index: number): string {
  return CLIENT_IMAGES[index % CLIENT_IMAGES.length];
}

export interface WidgetDefinition {
  id: string;
  title: string;
  type: "profile" | "calendar" | "status";
  statusKey?: "inProgress" | "completed" | "pending" | "cancelled";
  color?: string;
  span?: number;
}

export const ALL_WIDGETS: WidgetDefinition[] = [
  { id: "profile", title: "Profile", type: "profile", span: 1 },
  { id: "calendar", title: "Calendar & Services", type: "calendar", span: 2 },
  { id: "in-progress", title: "In-Progress", type: "status", statusKey: "inProgress", color: "#a0a0a0", span: 1 },
  { id: "completed", title: "Completed", type: "status", statusKey: "completed", color: "#10b981", span: 1 },
  { id: "pending", title: "Pending", type: "status", statusKey: "pending", color: "#ffbf51", span: 1 },
  { id: "cancelled", title: "Cancelled", type: "status", statusKey: "cancelled", color: "#ef4444", span: 1 },
];

const DEFAULT_WIDGET_IDS = ["profile", "calendar", "in-progress", "completed", "pending", "cancelled"];

export function getDefaultWidgetIds(): string[] {
  return [...DEFAULT_WIDGET_IDS];
}

export function getWidgetById(id: string): WidgetDefinition | undefined {
  return ALL_WIDGETS.find((w) => w.id === id);
}

export interface StatusCounts {
  inProgress: number;
  completed: number;
  pending: number;
  cancelled: number;
  total: number;
}

export function getStatusCounts(bookings: Booking[]): StatusCounts {
  const counts: StatusCounts = {
    inProgress: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    total: bookings.length,
  };
  for (const b of bookings) {
    const s = b.status.toLowerCase();
    if (s.includes("progress")) counts.inProgress++;
    else if (s.includes("completed") || s.includes("accepted")) counts.completed++;
    else if (s.includes("pending")) counts.pending++;
    else if (s.includes("cancelled") || s.includes("cancel")) counts.cancelled++;
  }
  return counts;
}
