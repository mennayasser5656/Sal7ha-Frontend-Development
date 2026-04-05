"use client";

import styles from "./CalendarWidget.module.css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Booking from "@/domain/entities/Booking";

function getStatusClass(status: string, s: Record<string, string>): string {
  const lower = status.toLowerCase();
  if (lower.includes("completed") || lower.includes("done") || lower.includes("accepted"))
    return s.statusCompleted;
  if (lower.includes("pending")) return s.statusPending;
  if (lower.includes("progress")) return s.statusInProgress;
  if (lower.includes("cancelled") || lower.includes("cancel"))
    return s.statusCancelled;
  return "";
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
  return (
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
            const isToday =
              !cell.outside &&
              cell.day === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear();
            return (
              <div
                key={i}
                className={`${styles.day} ${cell.outside ? styles.dayOutside : ""} ${isToday ? styles.dayToday : ""}`}
              >
                {cell.day}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.servicesSide}>
        <span className={styles.servicesTitle}>Upcoming</span>
        {monthBookings.length === 0 ? (
          <span className={styles.emptyServices}>No services this month</span>
        ) : (
          <div className={styles.servicesList}>
            {monthBookings.map((booking, i) => (
              <div key={booking.id} className={styles.serviceItem}>
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
                  <span className={`${styles.serviceStatusText} ${getStatusClass(booking.status, styles)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
