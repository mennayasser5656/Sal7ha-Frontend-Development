import Booking from "@/domain/entities/Booking";
import { apiClient } from "@/infrastructure/api/client";
import {
  parseDate,
  getCalendarDays as getCalendarDaysRaw,
  formatBookingDateRange,
  MONTH_NAMES,
  SHORT_MONTHS,
  DAY_LABELS,
} from "./date.service";

// Re-export for consumers still importing from here
export { formatBookingDateRange };

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
  const cells = [...getCalendarDaysRaw(year, month)];

  while (cells.length < 42) {
    const lastCell = cells[cells.length - 1];
    const nextDate = lastCell
      ? new Date(lastCell.date.getTime())
      : new Date(year, month, 0);
    nextDate.setDate(nextDate.getDate() + 1);

    cells.push({
      day: nextDate.getDate(),
      month: nextDate.getMonth(),
      year: nextDate.getFullYear(),
      date: nextDate,
      outside: true,
    });
  }

  return cells
    .slice(0, 42)
    .map((c) => ({ day: c.day, outside: c.outside }));
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
  type:
    | "profile"
    | "calendar"
    | "growth"
    | "status"
    | "statusSummary"
    | "setupWarnings";
  statusKey?: "inProgress" | "completed" | "pending" | "cancelled";
  color?: string;
  span?: number;
}

export type SetupWarningSeverity = "warning" | "critical";

export interface SetupWarning {
  id: string;
  title: string;
  description: string;
  segment: string;
  severity: SetupWarningSeverity;
}

export const SETUP_WARNINGS: SetupWarning[] = [
  {
    id: "billing",
    title: "Billing",
    description: "Billing setup is required.",
    segment: "billing",
    severity: "critical",
  },
  {
    id: "personal",
    title: "Personal info",
    description: "Birth date is not set.",
    segment: "personal",
    severity: "warning",
  },
  {
    id: "security",
    title: "Security",
    description: "MFA is not set.",
    segment: "security",
    severity: "warning",
  },
];

const LEGACY_STATUS_WIDGET_IDS = [
  "in-progress",
  "completed",
  "pending",
  "cancelled",
] as const;

const STATUS_SUMMARY_STORAGE_KEY = "dashboard-booking-status-widget-active";
const GROWTH_STORAGE_KEY = "dashboard-growth-widget-active";

export const STATUS_SUMMARY_WIDGET: WidgetDefinition = {
  id: "booking-status",
  title: "Booking Status",
  type: "statusSummary",
  span: 1,
};

export const GROWTH_WIDGET: WidgetDefinition = {
  id: "growth",
  title: "Growth",
  type: "growth",
  span: 3,
};

const LOCAL_WIDGETS = [
  {
    widget: STATUS_SUMMARY_WIDGET,
    storageKey: STATUS_SUMMARY_STORAGE_KEY,
  },
  { widget: GROWTH_WIDGET, storageKey: GROWTH_STORAGE_KEY },
];

export const ALL_WIDGETS: WidgetDefinition[] = [
  { id: "profile", title: "Profile", type: "profile", span: 1 },
  { id: "calendar", title: "Calendar & Services", type: "calendar", span: 2 },
  { id: "setup-warnings", title: "Action Items", type: "setupWarnings", span: 2 },
  { id: "in-progress", title: "In-Progress", type: "status", statusKey: "inProgress", color: "#a0a0a0", span: 1 },
  { id: "completed", title: "Completed", type: "status", statusKey: "completed", color: "#10b981", span: 1 },
  { id: "pending", title: "Pending", type: "status", statusKey: "pending", color: "#ffbf51", span: 1 },
  { id: "cancelled", title: "Cancelled", type: "status", statusKey: "cancelled", color: "#ef4444", span: 1 },
  STATUS_SUMMARY_WIDGET,
  GROWTH_WIDGET,
];

const DEFAULT_WIDGET_IDS = [
  "profile",
  "calendar",
  "setup-warnings",
  ...LEGACY_STATUS_WIDGET_IDS,
  STATUS_SUMMARY_WIDGET.id,
  GROWTH_WIDGET.id,
];

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
  accepted: number;
  total: number;
}

export interface DashboardSummaryResponse {
  totalBookings: number;
  inProgress: number;
  completed: number;
  pending: number;
  cancelled: number;
  accepted: number;
}

export interface DashboardWidgetsResponse {
  activeWidgets: WidgetDefinition[];
  inactiveWidgets: WidgetDefinition[];
}

function getStoredLocalWidgetPreferences(): Record<string, boolean> {
  return Object.fromEntries(
    LOCAL_WIDGETS.map(({ widget, storageKey }) => [
      widget.id,
      typeof window === "undefined"
        ? true
        : window.localStorage.getItem(storageKey) !== "false",
    ]),
  );
}

function normalizeDashboardWidgets(
  widgets: DashboardWidgetsResponse,
  localPreferences = getStoredLocalWidgetPreferences(),
): DashboardWidgetsResponse {
  const localWidgetIds = new Set(
    LOCAL_WIDGETS.map(({ widget }) => widget.id),
  );
  const activeWidgets = widgets.activeWidgets.filter(
    (widget) => !localWidgetIds.has(widget.id),
  );
  const inactiveWidgets = widgets.inactiveWidgets.filter(
    (widget) => !localWidgetIds.has(widget.id),
  );

  LOCAL_WIDGETS.forEach(({ widget }) => {
    if (localPreferences[widget.id]) {
      activeWidgets.push(widget);
    } else {
      inactiveWidgets.push(widget);
    }
  });

  return { activeWidgets, inactiveWidgets };
}

function prepareDashboardWidgetIds(widgetIds: string[]) {
  const localPreferences = Object.fromEntries(
    LOCAL_WIDGETS.map(({ widget }) => [
      widget.id,
      widgetIds.includes(widget.id),
    ]),
  );

  if (typeof window !== "undefined") {
    LOCAL_WIDGETS.forEach(({ widget, storageKey }) => {
      window.localStorage.setItem(
        storageKey,
        String(localPreferences[widget.id]),
      );
    });
  }

  return {
    localPreferences,
    persistedIds: widgetIds.filter((id) => !LOCAL_WIDGETS.some(
      ({ widget }) => widget.id === id,
    )),
  };
}

export interface BusinessProfileResponse {
  id: string;
  name: string;
  logoUrl?: string | null;
  logoFileName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  onboardingCompleted?: boolean;
}

export function getDashboardSummary() {
  return apiClient<DashboardSummaryResponse>("/dashboard/summary");
}

export function getDashboardMonthBookings(year: number, month: number) {
  return apiClient<{ year: number; month: number; bookings: Booking[] }>(
    "/dashboard/bookings/month",
    { query: { year, month } },
  );
}

export function getDashboardWidgets() {
  return apiClient<DashboardWidgetsResponse>("/dashboard/widgets").then(
    normalizeDashboardWidgets,
  );
}

export function updateDashboardWidgets(activeWidgetIds: string[]) {
  const { persistedIds, localPreferences } =
    prepareDashboardWidgetIds(activeWidgetIds);

  return apiClient<DashboardWidgetsResponse>("/dashboard/widgets", {
    method: "PUT",
    body: { activeWidgetIds: persistedIds },
  }).then((widgets) =>
    normalizeDashboardWidgets(widgets, localPreferences),
  );
}

export function getBusinessProfile() {
  return apiClient<BusinessProfileResponse>("/business/profile");
}

export function getBusinessSetupWarnings() {
  return apiClient<SetupWarning[]>("/business/setup-warnings");
}

export function getStatusCounts(bookings: Booking[]): StatusCounts {
  const counts: StatusCounts = {
    inProgress: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    accepted: 0,
    total: bookings.length,
  };
  for (const b of bookings) {
    const s = b.status.toLowerCase();
    if (s.includes("progress")) counts.inProgress++;
    else if (s.includes("completed")) counts.completed++;
    else if (s.includes("accepted")) counts.accepted++;
    else if (s.includes("pending")) counts.pending++;
    else if (s.includes("cancelled") || s.includes("cancel")) counts.cancelled++;
  }
  return counts;
}
