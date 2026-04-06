  /**
 * Shared booking status utilities.
 * Centralizes all status matching, color, and icon logic.
 */

export type BookingStatus = "In-Progress" | "Completed" | "Pending" | "Cancelled" | "Accepted";

export const ALL_STATUSES: BookingStatus[] = ["In-Progress", "Completed", "Pending", "Cancelled", "Accepted"];

/** Normalize status string to a canonical key. */
export function normalizeStatus(status: string): "inProgress" | "completed" | "pending" | "cancelled" | "accepted" | null {
  const s = status.toLowerCase();
  if (s.includes("progress")) return "inProgress";
  if (s.includes("completed") || s.includes("done")) return "completed";
  if (s.includes("accepted")) return "accepted";
  if (s.includes("pending")) return "pending";
  if (s.includes("cancel")) return "cancelled";
  return null;
}

/** Status colors used across the app. */
export const STATUS_COLORS = {
  inProgress: "#a0a0a0",
  completed: "#10b981",
  accepted: "#10b981",
  pending: "#ffb700",
  cancelled: "#ef4444",
} as const;

/** Get the hex color for a status string. */
export function getStatusColor(status: string): string {
  const key = normalizeStatus(status);
  return key ? STATUS_COLORS[key] : "#ccc";
}

/** Status icon colors used in TableView/OverlayBookingDetails. */
export const STATUS_ICON_COLORS = {
  inProgress: "lightgray",
  completed: "#10b981",
  accepted: "#10b981",
  pending: "#ffbf51",
  cancelled: "#ef4444",
} as const;

/** ListView / StatusComponent badge colors. */
export const STATUS_BADGE_COLORS = {
  inProgress: "#038efd",
  completed: "#3ac167",
  pending: "#e68f3d",
  cancelled: "#ef685d",
} as const;
