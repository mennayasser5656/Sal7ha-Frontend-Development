import Booking from "@/domain/entities/Booking";
import { apiClient, type PaginatedResponse } from "@/infrastructure/api/client";
import { parseDateMs } from "./date.service";

export type SortKey = "serviceName" | "name" | "carMake" | "startDate" | "endDate" | "status" | null;
export type SortDirection = "asc" | "desc";

export interface BookingListQuery {
  status?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  search?: string;
  sortBy?: SortKey;
  sortOrder?: SortDirection;
  page?: number;
  limit?: number;
}

function toApiDate(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

export function listBookings(query: BookingListQuery) {
  return apiClient<PaginatedResponse<Booking>>("/bookings", {
    query: {
      status: query.status,
      startDate: toApiDate(query.startDate),
      endDate: toApiDate(query.endDate),
      search: query.search,
      sortBy: query.sortBy ?? undefined,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit,
    },
  });
}

export function updateBookingsStatus(ids: Iterable<string>, status: string) {
  return apiClient<{
    requested: number;
    succeeded: number;
    failed: number;
    failedIds?: string[];
  }>("/bookings/batch/status", {
    method: "PATCH",
    body: { ids: Array.from(ids), status },
  });
}

export function filterByStatus(bookings: Booking[], status: string | null): Booking[] {
  if (!status) return bookings;
  return bookings.filter((b) => b.status === status);
}

export function updateBookingStatuses(
  bookings: Booking[],
  ids: Set<string>,
  newStatus: string,
): Booking[] {
  return bookings.map((b) =>
    ids.has(b.id) ? { ...b, status: newStatus } : b,
  );
}

export function filterByDateRange(
  bookings: Booking[],
  rangeStart: Date | null,
  rangeEnd: Date | null,
): Booking[] {
  if (!rangeStart) return bookings;
  const start = rangeStart.getTime();
  const end = rangeEnd ? rangeEnd.getTime() : start;
  return bookings.filter((b) => {
    const bStart = parseDateMs(b.startDate);
    const bEnd = parseDateMs(b.endDate);
    return bEnd >= start && bStart <= end;
  });
}

export function searchBookings(bookings: Booking[], query: string): Booking[] {
  if (!query) return bookings;
  const q = query.toLowerCase();
  return bookings.filter(
    (b) =>
      b.serviceName.toLowerCase().includes(q) ||
      b.carMake.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q),
  );
}

export function sortBookings(
  bookings: Booking[],
  sortKey: SortKey,
  sortDirection: SortDirection,
): Booking[] {
  if (!sortKey) return bookings;
  return [...bookings].sort((a, b) => {
    let comparison = 0;
    if (sortKey === "serviceName") {
      comparison = a.serviceName.localeCompare(b.serviceName);
    } else if (sortKey === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortKey === "carMake") {
      comparison = a.carMake.localeCompare(b.carMake);
    } else if (sortKey === "status") {
      comparison = a.status.localeCompare(b.status);
    } else if (sortKey === "startDate") {
      comparison = parseDateMs(a.startDate) - parseDateMs(b.startDate);
    } else if (sortKey === "endDate") {
      comparison = parseDateMs(a.endDate) - parseDateMs(b.endDate);
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });
}

export function paginateBookings(
  bookings: Booking[],
  currentPage: number,
  itemsPerPage: number,
): Booking[] {
  const start = (currentPage - 1) * itemsPerPage;
  return bookings.slice(start, start + itemsPerPage);
}

