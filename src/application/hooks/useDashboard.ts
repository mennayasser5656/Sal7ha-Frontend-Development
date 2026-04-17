import { useState, useMemo, useCallback } from "react";
import { generateMockBookings } from "@/infrastructure/services/bookings.service";
import {
  getBookingsForMonth,
  getCalendarDays,
  getMonthName,
  getDayLabels,
  formatBookingDateRange,
  getClientImage,
  getStatusCounts,
  getDefaultWidgetIds,
  getWidgetById,
  ALL_WIDGETS,
} from "@/infrastructure/services/dashboard.service";

export function useDashboard() {
  const [bookings] = useState(generateMockBookings);
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const monthName = getMonthName(viewMonth);
  const dayLabels = getDayLabels();

  const calendarDays = useMemo(
    () => getCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const monthBookings = useMemo(
    () => getBookingsForMonth(bookings, viewYear, viewMonth),
    [bookings, viewYear, viewMonth],
  );

  const statusCounts = useMemo(
    () => getStatusCounts(bookings),
    [bookings],
  );

  const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>(getDefaultWidgetIds);

  const activeWidgets = useMemo(
    () => activeWidgetIds.map(getWidgetById).filter(Boolean),
    [activeWidgetIds],
  );

  const inactiveWidgets = useMemo(
    () => ALL_WIDGETS.filter((w) => !activeWidgetIds.includes(w.id)),
    [activeWidgetIds],
  );

  const addWidget = useCallback((id: string) => {
    setActiveWidgetIds((prev) => [...prev, id]);
  }, []);

  const removeWidget = useCallback((id: string) => {
    setActiveWidgetIds((prev) => prev.filter((wid) => wid !== id));
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  return {
    today,
    viewMonth,
    viewYear,
    monthName,
    dayLabels,
    calendarDays,
    monthBookings,
    prevMonth,
    nextMonth,
    formatBookingDateRange,
    getClientImage,
    statusCounts,
    activeWidgets,
    inactiveWidgets,
    addWidget,
    removeWidget,
  };
}
