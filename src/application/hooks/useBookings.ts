import { useState, useMemo } from "react";
import Booking from "@/domain/entities/Booking";
import {
  filterBookings,
  sortBookings,
  searchBookings,
  generateMockBookings,
} from "@/infrastructure/services/bookings.service";

export function useBookings(filterLabel: string, sortLabel: string) {
  const [bookings] = useState<Booking[]>(generateMockBookings);
  const [searchQuery, setSearchQuery] = useState("");

  const processedBookings = useMemo(
    () =>
      searchBookings(
        sortBookings(filterBookings(bookings, filterLabel), sortLabel),
        searchQuery,
      ),
    [bookings, filterLabel, sortLabel, searchQuery],
  );

  return {
    bookings: processedBookings,
    searchQuery,
    setSearchQuery,
  };
}
