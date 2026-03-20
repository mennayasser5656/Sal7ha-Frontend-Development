import { useState, useMemo } from "react";
import Booking from "@/domain/entities/Booking";
import {
  searchBookings,
  generateMockBookings,
  filterByStatus,
} from "@/infrastructure/services/bookings.service";

export function useBookings() {
  const [bookings] = useState<Booking[]>(generateMockBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const processedBookings = useMemo(
    () => searchBookings(filterByStatus(bookings, selectedStatus), searchQuery),
    [bookings, selectedStatus, searchQuery],
  );

  return {
    bookings: processedBookings,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
  };
}
