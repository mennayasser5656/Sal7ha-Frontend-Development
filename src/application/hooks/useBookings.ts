import { useState, useCallback, useEffect } from "react";
import Booking from "@/domain/entities/Booking";
import { useToastNotifications } from "@/application/hooks/useToastNotifications";
import type {
  NotificationPreferenceKey,
  NotificationType,
} from "@/domain/entities/Notification";
import {
  listBookings,
  updateBookingsStatus,
  SortKey,
  SortDirection,
} from "@/infrastructure/services/bookings.service";

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { notifications, dismissNotification, showNotification } =
    useToastNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [dateRangeStart, setDateRangeStart] = useState<Date | null>(null);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listBookings({
        status: selectedStatus,
        startDate: dateRangeStart,
        endDate: dateRangeEnd,
        search: searchQuery,
        sortBy: sortKey,
        sortOrder: sortDirection,
        page: currentPage,
        limit: itemsPerPage,
      });
      setBookings(response.data);
      setTotalPages(Math.max(1, response.pagination.pages));
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Could not load bookings.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    dateRangeEnd,
    dateRangeStart,
    itemsPerPage,
    searchQuery,
    selectedStatus,
    showNotification,
    sortDirection,
    sortKey,
  ]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

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

  const runStatusUpdate = useCallback(
    async (
      ids: Set<string>,
      status: string,
      verb: string,
      type: NotificationType,
      preferenceKey: NotificationPreferenceKey,
    ) => {
      try {
        await updateBookingsStatus(ids, status);
        ids.forEach((id) => {
          showNotification(`Service "${id}" Has Been ${verb}`, type, preferenceKey);
        });
        void loadBookings();
      } catch (error) {
        showNotification(
          error instanceof Error ? error.message : "Could not update bookings.",
          "error",
        );
      }
    },
    [loadBookings, showNotification],
  );

  // Accepting a pending request moves it into the active "In-Progress" state.
  const acceptBookings = useCallback(
    (ids: Set<string>) =>
      runStatusUpdate(ids, "In-Progress", "Accepted", "accepted", "bookingAccepted"),
    [runStatusUpdate],
  );

  // In-Progress bookings can be marked as Completed.
  const completeBookings = useCallback(
    (ids: Set<string>) =>
      runStatusUpdate(ids, "Completed", "Completed", "accepted", "bookingAccepted"),
    [runStatusUpdate],
  );

  // Declining a pending request cancels it.
  const declineBookings = useCallback(
    (ids: Set<string>) =>
      runStatusUpdate(ids, "Cancelled", "Declined", "declined", "bookingDeclined"),
    [runStatusUpdate],
  );

  // In-Progress bookings can be cancelled.
  const cancelBookings = useCallback(
    (ids: Set<string>) =>
      runStatusUpdate(ids, "Cancelled", "Cancelled", "declined", "bookingDeclined"),
    [runStatusUpdate],
  );

  return {
    bookings,
    isLoading,
    searchQuery,
    setSearchQuery: (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
    },
    selectedStatus,
    setSelectedStatus: (status: string | null) => {
      setSelectedStatus(status);
      setCurrentPage(1);
    },
    dateRangeStart,
    dateRangeEnd,
    setDateRangeStart: (date: Date | null) => {
      setDateRangeStart(date);
      setCurrentPage(1);
    },
    setDateRangeEnd: (date: Date | null) => {
      setDateRangeEnd(date);
      setCurrentPage(1);
    },
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
    completeBookings,
    declineBookings,
    cancelBookings,
    notifications,
    dismissNotification,
  };
}
