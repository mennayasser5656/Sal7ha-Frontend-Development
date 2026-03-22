import { useState, useMemo, useCallback } from "react";
import Booking from "@/domain/entities/Booking";
import {
  searchBookings,
  generateMockBookings,
  filterByStatus,
  filterByDateRange,
  updateBookingStatuses,
  sortBookings,
  paginateBookings,
  SortKey,
  SortDirection,
} from "@/infrastructure/services/bookings.service";

export interface Notification {
  id: string;
  message: string;
  type: "accepted" | "declined";
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>(generateMockBookings);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [dateRangeStart, setDateRangeStart] = useState<Date | null>(null);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filtered = useMemo(
    () =>
      searchBookings(
        filterByDateRange(filterByStatus(bookings, selectedStatus), dateRangeStart, dateRangeEnd),
        searchQuery,
      ),
    [bookings, selectedStatus, dateRangeStart, dateRangeEnd, searchQuery],
  );

  const sorted = useMemo(
    () => sortBookings(filtered, sortKey, sortDirection),
    [filtered, sortKey, sortDirection],
  );

  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  const currentBookings = useMemo(
    () => paginateBookings(sorted, currentPage, itemsPerPage),
    [sorted, currentPage, itemsPerPage],
  );

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  function setPerPage(value: number) {
    if (value > 0) {
      setItemsPerPage(value);
      setCurrentPage(1);
    }
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  }

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const acceptBookings = useCallback((ids: Set<string>) => {
    setBookings((prev) => updateBookingStatuses(prev, ids, "Accepted"));
    ids.forEach((id) => {
      const notifId = `${id}-${Date.now()}`;
      setNotifications((prev) => [
        ...prev,
        { id: notifId, message: `Service "${id}" Has Been Accepted`, type: "accepted" },
      ]);
      setTimeout(() => dismissNotification(notifId), 3000);
    });
  }, [dismissNotification]);

  const declineBookings = useCallback((ids: Set<string>) => {
    setBookings((prev) => updateBookingStatuses(prev, ids, "Cancelled"));
    ids.forEach((id) => {
      const notifId = `${id}-${Date.now()}`;
      setNotifications((prev) => [
        ...prev,
        { id: notifId, message: `Service "${id}" Has Been Declined`, type: "declined" },
      ]);
      setTimeout(() => dismissNotification(notifId), 3000);
    });
  }, [dismissNotification]);

  return {
    bookings: currentBookings,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    dateRangeStart,
    dateRangeEnd,
    setDateRangeStart,
    setDateRangeEnd,
    sortKey,
    sortDirection,
    handleSort,
    currentPage,
    totalPages,
    itemsPerPage,
    setPerPage,
    goToPage,
    goToPreviousPage: () => setCurrentPage(p => Math.max(p - 1, 1)),
    goToNextPage: () => setCurrentPage(p => Math.min(p + 1, totalPages)),
    acceptBookings,
    declineBookings,
    notifications,
    dismissNotification,
  };
}
