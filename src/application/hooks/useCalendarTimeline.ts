import { useState, useMemo, useCallback, useEffect } from "react";
import { listBookings } from "@/infrastructure/services/bookings.service";
import Booking from "@/domain/entities/Booking";
import {
  parseDate,
  isSameDay,
  getCalendarDays,
  MONTH_NAMES,
  SHORT_MONTHS,
  DAY_LABELS,
  CalendarCell,
} from "@/infrastructure/services/date.service";

export type ViewMode = "week" | "month";

export interface BookingWithParsedDates extends Booking {
  start: Date;
  end: Date;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }
  return days;
}

export function useCalendarTimeline() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date(today));
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadBookings() {
      const response = await listBookings({ page: 1, limit: 100 });
      if (!ignore) {
        setBookings(response.data);
      }
    }

    void loadBookings();

    return () => {
      ignore = true;
    };
  }, []);

  const parsedBookings: BookingWithParsedDates[] = useMemo(
    () => bookings.map((b) => ({ ...b, start: parseDate(b.startDate), end: parseDate(b.endDate) })),
    [bookings],
  );

  const filteredBookings = useMemo(() => {
    if (!selectedStatus) return parsedBookings;
    return parsedBookings.filter((b) => b.status === selectedStatus);
  }, [parsedBookings, selectedStatus]);

  // Week view data
  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const weekBookings = useMemo(() => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return filteredBookings.filter((b) => b.end >= weekStart && b.start <= weekEnd);
  }, [filteredBookings, weekStart]);

  // Month view data
  const viewMonth = currentDate.getMonth();
  const viewYear = currentDate.getFullYear();

  const monthDays = useMemo(
    () => getCalendarDays(viewYear, viewMonth).map((c: CalendarCell) => ({ date: c.date, outside: c.outside })),
    [viewYear, viewMonth],
  );

  const monthBookings = useMemo(() => {
    const monthStart = new Date(viewYear, viewMonth, 1);
    const monthEnd = new Date(viewYear, viewMonth + 1, 0);
    return filteredBookings.filter((b) => b.end >= monthStart && b.start <= monthEnd);
  }, [filteredBookings, viewYear, viewMonth]);

  const getBookingsForDay = useCallback(
    (date: Date): BookingWithParsedDates[] => {
      return filteredBookings.filter((b) => {
        const d = new Date(date); d.setHours(0, 0, 0, 0);
        const start = new Date(b.start); start.setHours(0, 0, 0, 0);
        const end = new Date(b.end); end.setHours(0, 0, 0, 0);
        return d >= start && d <= end;
      });
    },
    [filteredBookings],
  );

  // Navigation
  const goToToday = useCallback(() => setCurrentDate(new Date(today)), []);

  const goToPrev = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "week") d.setDate(d.getDate() - 7);
      else d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, [viewMode]);

  const goToNext = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "week") d.setDate(d.getDate() + 7);
      else d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, [viewMode]);

  const goToDate = useCallback((date: Date) => setCurrentDate(new Date(date)), []);

  // Header label
  const headerLabel = useMemo(() => {
    if (viewMode === "week") {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getDate()} - ${weekEnd.getDate()} ${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
      }
      return `${weekStart.getDate()} ${SHORT_MONTHS[weekStart.getMonth()]} - ${weekEnd.getDate()} ${SHORT_MONTHS[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
    }
    return `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  }, [viewMode, weekStart, viewMonth, viewYear]);

  return {
    today,
    viewMode,
    setViewMode,
    currentDate,
    headerLabel,
    selectedStatus,
    setSelectedStatus,
    weekStart,
    weekDays,
    weekBookings,
    viewMonth,
    viewYear,
    monthDays,
    monthBookings,
    getBookingsForDay,
    isSameDay,
    goToToday,
    goToPrev,
    goToNext,
    goToDate,
    dayLabelsShort: DAY_LABELS,
    monthNames: MONTH_NAMES,
  };
}
