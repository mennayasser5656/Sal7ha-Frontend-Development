"use client";

import styles from "./CalendarWidget.module.css";
import { useMemo, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Booking from "@/domain/entities/Booking";
import { parseDate } from "@/infrastructure/services/date.service";
import { normalizeStatus } from "@/infrastructure/services/status.service";
import OverlayBookingDetails from "@/presentation/components/bookings/OverlayBookingDetails/OverlayBookingDetails";

const STATUS_CLASS_MAP: Record<string, string> = {
  inProgress: styles.statusInProgress,
  completed: styles.statusCompleted,
  accepted: styles.statusCompleted,
  pending: styles.statusPending,
  cancelled: styles.statusCancelled,
};

function getStatusClass(status: string): string {
  return STATUS_CLASS_MAP[normalizeStatus(status) ?? ""] ?? "";
}

interface DateRange {
  start: Date;
  end: Date | null;
}

function isSameDay(a: Date | null | undefined, b: Date): boolean {
  return Boolean(
    a &&
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear(),
  );
}

interface CalendarWidgetProps {
  today: Date;
  viewMonth: number;
  viewYear: number;
  monthName: string;
  dayLabels: string[];
  calendarDays: { day: number; outside: boolean }[];
  monthBookings: Booking[];
  prevMonth: () => void;
  nextMonth: () => void;
  formatBookingDateRange: (start: string, end: string) => string;
  getClientImage: (index: number) => string;
}

export default function CalendarWidget({
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
}: CalendarWidgetProps) {
  const [openBooking, setOpenBooking] = useState<Booking | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);

  const visibleBookings = useMemo(() => {
    if (!selectedRange) return monthBookings;

    const selectedEnd = selectedRange.end ?? selectedRange.start;
    return monthBookings.filter((booking) => {
      const bookingStart = parseDate(booking.startDate);
      const bookingEnd = parseDate(booking.endDate);
      return bookingStart <= selectedEnd && bookingEnd >= selectedRange.start;
    });
  }, [monthBookings, selectedRange]);

  function handleDayClick(day: number) {
    const clicked = new Date(viewYear, viewMonth, day);

    setSelectedRange((current) => {
      if (!current || current.end) {
        return { start: clicked, end: null };
      }

      if (isSameDay(current.start, clicked)) return null;
      if (clicked < current.start) {
        return { start: clicked, end: current.start };
      }

      return { start: current.start, end: clicked };
    });
  }

  const emptyMessage = selectedRange
    ? selectedRange.end
      ? "No services in this date range"
      : "No services on this day"
    : "No services this month";

  return (
    <>
      {openBooking && (
        <OverlayBookingDetails
          booking={openBooking}
          onClose={() => setOpenBooking(null)}
        />
      )}

      <div className={styles.mainCard}>
        <div className={styles.calendarSide}>
          <div className={styles.calendarTop}>
            <span className={styles.calendarLabel}>Calendar</span>
            <div className={styles.calendarHeader}>
              <span className={styles.calendarMonthYear}>
                {monthName} {viewYear}
              </span>
              <div className={styles.calendarNav}>
                <button className={styles.calendarNavBtn} onClick={prevMonth}>
                  <IoIosArrowBack />
                </button>
                <button className={styles.calendarNavBtn} onClick={nextMonth}>
                  <IoIosArrowForward />
                </button>
              </div>
            </div>
          </div>
          <div className={styles.dayLabels}>
            {dayLabels.map((d) => (
              <span key={d} className={styles.dayLabel}>{d}</span>
            ))}
          </div>
          <div className={styles.days}>
            {calendarDays.map((cell, i) => {
              const cellDate = new Date(viewYear, viewMonth, cell.day);
              const rangeStart =
                !cell.outside && isSameDay(selectedRange?.start, cellDate);
              const rangeEnd =
                !cell.outside && isSameDay(selectedRange?.end, cellDate);
              const inRange = Boolean(
                !cell.outside &&
                  selectedRange?.end &&
                  cellDate > selectedRange.start &&
                  cellDate < selectedRange.end,
              );
              const isToday =
                !cell.outside &&
                cell.day === today.getDate() &&
                viewMonth === today.getMonth() &&
                viewYear === today.getFullYear();

              return (
                <button
                  type="button"
                  key={i}
                  className={[
                    styles.day,
                    cell.outside ? styles.dayOutside : "",
                    rangeStart && selectedRange?.end
                      ? styles.dayRangeStart
                      : "",
                    rangeEnd ? styles.dayRangeEnd : "",
                    rangeStart && !selectedRange?.end
                      ? styles.daySelected
                      : "",
                    inRange ? styles.dayInRange : "",
                    isToday && !rangeStart && !rangeEnd
                      ? styles.dayToday
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={cell.outside}
                  aria-pressed={rangeStart || rangeEnd}
                  aria-label={`${monthName} ${cell.day}, ${viewYear}`}
                  onClick={() => handleDayClick(cell.day)}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
        <div className={styles.servicesSide}>
          <span className={styles.servicesTitle}>Upcoming</span>
          {visibleBookings.length === 0 ? (
            <span className={styles.emptyServices}>{emptyMessage}</span>
          ) : (
            <div className={styles.servicesList}>
              {visibleBookings.map((booking, i) => (
                <button
                  key={booking.id}
                  type="button"
                  className={styles.serviceItem}
                  onClick={() => setOpenBooking(booking)}
                >
                  <img
                    className={styles.serviceClientImg}
                    src={getClientImage(i)}
                    alt={booking.name}
                  />
                  <div className={styles.serviceInfo}>
                    <span className={styles.serviceNameText}>{booking.serviceName}</span>
                    <span className={styles.dot} />
                    <span className={styles.serviceDateText}>
                      {formatBookingDateRange(booking.startDate, booking.endDate)}
                    </span>
                    <span className={styles.dot} />
                    <span className={`${styles.serviceStatusText} ${getStatusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
