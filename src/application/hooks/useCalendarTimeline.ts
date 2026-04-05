import { useState, useMemo, useCallback } from "react";
import { generateMockBookings } from "@/infrastructure/services/bookings.service";
import Booking from "@/domain/entities/Booking";

export type ViewMode = "week" | "month";

function parseDate(dateStr: string): Date {
  const parts = dateStr.split("/");
  return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
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

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { date: Date; outside: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), outside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), outside: false });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ date: new Date(year, month + 1, d), outside: true });
    }
  }
  return cells;
}

export interface BookingWithParsedDates extends Booking {
  start: Date;
  end: Date;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABELS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function useCalendarTimeline() {
  const [bookings] = useState(generateMockBookings);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date(today));
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

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

  const monthDays = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const monthBookings = useMemo(() => {
    const monthStart = new Date(viewYear, viewMonth, 1);
    const monthEnd = new Date(viewYear, viewMonth + 1, 0);
    return filteredBookings.filter((b) => b.end >= monthStart && b.start <= monthEnd);
  }, [filteredBookings, viewYear, viewMonth]);

  // Get bookings for a specific day
  const getBookingsForDay = useCallback(
    (date: Date): BookingWithParsedDates[] => {
      return filteredBookings.filter((b) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const start = new Date(b.start);
        start.setHours(0, 0, 0, 0);
        const end = new Date(b.end);
        end.setHours(0, 0, 0, 0);
        return d >= start && d <= end;
      });
    },
    [filteredBookings],
  );

  // Navigation
  const goToToday = useCallback(() => {
    setCurrentDate(new Date(today));
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "week") {
        d.setDate(d.getDate() - 7);
      } else {
        d.setMonth(d.getMonth() - 1);
      }
      return d;
    });
  }, [viewMode]);

  const goToNext = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "week") {
        d.setDate(d.getDate() + 7);
      } else {
        d.setMonth(d.getMonth() + 1);
      }
      return d;
    });
  }, [viewMode]);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(new Date(date));
  }, []);

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
    // Week
    weekStart,
    weekDays,
    weekBookings,
    // Month
    viewMonth,
    viewYear,
    monthDays,
    monthBookings,
    // Utils
    getBookingsForDay,
    isSameDay,
    goToToday,
    goToPrev,
    goToNext,
    goToDate,
    dayLabelsShort: DAY_LABELS_SHORT,
    dayLabelsFull: DAY_LABELS_FULL,
    monthNames: MONTH_NAMES,
  };
}
