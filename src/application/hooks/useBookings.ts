import { useState, useCallback, useEffect } from "react";
import Booking from "@/domain/entities/Booking";
import { useToastNotifications } from "@/application/hooks/useToastNotifications";
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

  const acceptBookings = useCallback(async (ids: Set<string>) => {
    try {
      await updateBookingsStatus(ids, "Accepted");
      ids.forEach((id) => {
        showNotification(
          `Service "${id}" Has Been Accepted`,
          "accepted",
          "bookingAccepted",
        );
      });
      void loadBookings();
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Could not accept bookings.",
        "error",
      );
    }
  }, [loadBookings, showNotification]);

  const declineBookings = useCallback(async (ids: Set<string>) => {
    try {
      await updateBookingsStatus(ids, "Cancelled");
      ids.forEach((id) => {
        showNotification(
          `Service "${id}" Has Been Declined`,
          "declined",
          "bookingDeclined",
        );
      });
      void loadBookings();
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Could not decline bookings.",
        "error",
      );
    }
  }, [loadBookings, showNotification]);

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
    declineBookings,
    notifications,
    dismissNotification,
  };
}
