"use client";

import { useMemo, useState } from "react";
import styles from "./CalendarView.module.css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useCalendarTimeline, BookingWithParsedDates } from "@/application/hooks/useCalendarTimeline";
import { normalizeStatus } from "@/infrastructure/services/status.service";
import OverlayBookingDetails from "@/presentation/components/bookings/OverlayBookingDetails/OverlayBookingDetails";
import Booking from "@/domain/entities/Booking";
import {
  DEFAULT_OWNER_ICON,
  resolveBookingServiceIcon,
} from "../bookingVisuals";

const MAX_VISIBLE_BOOKINGS = 2;

const STATUS_DOT_COLORS: Record<string, string> = {
  inProgress: "#3b82f6",
  completed: "#10b981",
  accepted: "#10b981",
  pending: "#f59e0b",
  cancelled: "#ef4444",
};

function getStatusDotColor(status: string): string {
  const key = normalizeStatus(status);
  return key ? STATUS_DOT_COLORS[key] : "#ccc";
}

const BORDER_COLORS: Record<string, string> = {
  inProgress: "#3b82f6",
  completed: "#10b981",
  accepted: "#10b981",
  pending: "#f59e0b",
  cancelled: "#ef4444",
};

function getBorderColor(status: string): string {
  const key = normalizeStatus(status);
  return key ? BORDER_COLORS[key] : "#ddd";
}

interface BookingCardProps {
  booking: BookingWithParsedDates;
  onClick: () => void;
}

function BookingCard({ booking, onClick }: BookingCardProps) {
  const borderColor = getBorderColor(booking.status);
  const dotColor = getStatusDotColor(booking.status);

  return (
    <div className={styles.bookingCard} style={{ borderLeftColor: borderColor }} onClick={onClick}>
      <span className={styles.bookingName}>{booking.serviceName}</span>
      <div className={styles.bookingMeta}>
        <img
          className={styles.bookingAvatar}
          src={booking.ownerIcon || DEFAULT_OWNER_ICON}
          alt={booking.name}
        />
        <img
          className={styles.bookingServiceIcon}
          src={resolveBookingServiceIcon(booking)}
          alt={booking.serviceName}
        />
        <span className={styles.metaDot}>·</span>
        <span
          className={styles.statusDot}
          style={{ backgroundColor: dotColor }}
        />
      </div>
    </div>
  );
}

export default function CalendarView() {
  const {
    today,
    viewMode,
    setViewMode,
    headerLabel,
    monthDays,
    getBookingsForDay,
    isSameDay,
    goToPrev,
    goToNext,
    goToToday,
    dayLabelsShort,
  } = useCalendarTimeline();

  // Force month view
  useMemo(() => {
    if (viewMode !== "month") setViewMode("month");
  }, []);

  const [openBooking, setOpenBooking] = useState<Booking | null>(null);
  const [expandedCells, setExpandedCells] = useState<Set<number>>(new Set());

  const toggleCell = (idx: number) => {
    setExpandedCells((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className={styles.calendar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.monthLabel}>{headerLabel}</h2>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.todayBtn} onClick={goToToday}>
            Today
          </button>
          <button className={styles.navBtn} onClick={goToPrev}>
            <IoIosArrowBack />
          </button>
          <button className={styles.navBtn} onClick={goToNext}>
            <IoIosArrowForward />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className={styles.dayLabelsRow}>
        {dayLabelsShort.map((label) => (
          <div key={label} className={styles.dayLabel}>
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={styles.grid}>
        {monthDays.map((cell, idx) => {
          const cellDate = cell.date;
          const isToday = isSameDay(cellDate, today);
          const dayBookings = getBookingsForDay(cellDate);
          const isExpanded = expandedCells.has(idx);
          const visibleBookings = isExpanded
            ? dayBookings
            : dayBookings.slice(0, MAX_VISIBLE_BOOKINGS);
          const overflowCount = dayBookings.length - MAX_VISIBLE_BOOKINGS;

          return (
            <div
              key={idx}
              className={`${styles.cell} ${cell.outside ? styles.cellOutside : ""}`}
            >
              <div className={styles.cellHeader}>
                <span
                  className={`${styles.dayNumber} ${isToday ? styles.dayToday : ""}`}
                >
                  {cell.date.getDate()}
                </span>
              </div>
              <div className={styles.cellBookings}>
                {visibleBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} onClick={() => setOpenBooking(booking)} />
                ))}
                {overflowCount > 0 && (
                  <span
                    className={styles.showMore}
                    onClick={() => toggleCell(idx)}
                  >
                    {isExpanded
                      ? "Show Less"
                      : `Show More (${overflowCount})`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {openBooking && (
        <OverlayBookingDetails
          booking={openBooking}
          onClose={() => setOpenBooking(null)}
        />
      )}
    </div>
  );
}
