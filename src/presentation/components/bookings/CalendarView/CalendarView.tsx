"use client";

import { useState, useMemo } from "react";
import styles from "./CalendarView.module.css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import {
  useCalendarTimeline,
  BookingWithParsedDates,
} from "@/application/hooks/useCalendarTimeline";

const STATUSES = ["In-Progress", "Completed", "Pending", "Cancelled", "Accepted"];

function getBarClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("completed") || s.includes("done")) return styles.barCompleted;
  if (s.includes("accepted")) return styles.barAccepted;
  if (s.includes("pending")) return styles.barPending;
  if (s.includes("progress")) return styles.barInProgress;
  if (s.includes("cancel")) return styles.barCancelled;
  return "";
}

function getStatusColor(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("completed") || s.includes("done") || s.includes("accepted")) return "#10b981";
  if (s.includes("pending")) return "#ffb700";
  if (s.includes("progress")) return "#a0a0a0";
  if (s.includes("cancel")) return "#ef4444";
  return "#ccc";
}

function getPillClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("completed") || s.includes("done")) return styles.pillCompleted;
  if (s.includes("accepted")) return styles.pillAccepted;
  if (s.includes("pending")) return styles.pillPending;
  if (s.includes("progress")) return styles.pillInProgress;
  if (s.includes("cancel")) return styles.pillCancelled;
  return "";
}

function getBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("completed") || s.includes("done")) return styles.badgeCompleted;
  if (s.includes("accepted")) return styles.badgeAccepted;
  if (s.includes("pending")) return styles.badgePending;
  if (s.includes("progress")) return styles.badgeInProgress;
  if (s.includes("cancel")) return styles.badgeCancelled;
  return "";
}

function formatDateShort(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/** Compute which grid column a booking starts/ends on within a 7-day week (1-indexed for CSS grid). */
function getWeekSpan(booking: BookingWithParsedDates, weekStart: Date) {
  const msPerDay = 86400000;
  const weekStartMs = weekStart.getTime();
  const startCol = Math.max(1, Math.floor((booking.start.getTime() - weekStartMs) / msPerDay) + 1);
  const endCol = Math.min(8, Math.floor((booking.end.getTime() - weekStartMs) / msPerDay) + 2); // +2 because grid end is exclusive
  return { startCol, endCol };
}

interface LaneEntry {
  booking: BookingWithParsedDates;
  startCol: number;
  endCol: number;
  lane: number;
}

/** Assign bookings to non-overlapping horizontal lanes. */
function assignLanes(bookings: BookingWithParsedDates[], weekStart: Date): LaneEntry[] {
  const items = bookings
    .map((b) => ({ booking: b, ...getWeekSpan(b, weekStart) }))
    .sort((a, b) => a.startCol - b.startCol || (b.endCol - b.startCol) - (a.endCol - a.startCol));

  const lanes: number[][] = []; // lanes[i] = array of endCol values for items in that lane
  const result: LaneEntry[] = [];

  for (const item of items) {
    let placed = false;
    for (let l = 0; l < lanes.length; l++) {
      // Check if this lane is free (no item extends into our startCol)
      if (lanes[l].every((end) => end <= item.startCol)) {
        lanes[l].push(item.endCol);
        result.push({ ...item, lane: l });
        placed = true;
        break;
      }
    }
    if (!placed) {
      lanes.push([item.endCol]);
      result.push({ ...item, lane: lanes.length - 1 });
    }
  }

  return result;
}

export default function CalendarView() {
  const {
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
    monthDays,
    getBookingsForDay,
    isSameDay,
    goToToday,
    goToPrev,
    goToNext,
    goToDate,
    dayLabelsShort,
    monthNames,
  } = useCalendarTimeline();

  const [selectedBooking, setSelectedBooking] = useState<BookingWithParsedDates | null>(null);
  const [miniCalMonth, setMiniCalMonth] = useState(currentDate.getMonth());
  const [miniCalYear, setMiniCalYear] = useState(currentDate.getFullYear());

  const miniCalDays = useMemo(() => {
    const firstDay = new Date(miniCalYear, miniCalMonth, 1).getDay();
    const daysInMonth = new Date(miniCalYear, miniCalMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(miniCalYear, miniCalMonth, 0).getDate();
    const cells: { date: Date; outside: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ date: new Date(miniCalYear, miniCalMonth - 1, daysInPrevMonth - i), outside: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(miniCalYear, miniCalMonth, d), outside: false });
    }
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        cells.push({ date: new Date(miniCalYear, miniCalMonth + 1, d), outside: true });
      }
    }
    return cells;
  }, [miniCalYear, miniCalMonth]);

  const miniCalPrev = () => {
    if (miniCalMonth === 0) {
      setMiniCalMonth(11);
      setMiniCalYear(miniCalYear - 1);
    } else {
      setMiniCalMonth(miniCalMonth - 1);
    }
  };

  const miniCalNext = () => {
    if (miniCalMonth === 11) {
      setMiniCalMonth(0);
      setMiniCalYear(miniCalYear + 1);
    } else {
      setMiniCalMonth(miniCalMonth + 1);
    }
  };

  const handleMiniCalDayClick = (date: Date) => {
    goToDate(date);
  };

  // Get upcoming bookings sorted by date (deduplicated)
  const upcomingBookings = useMemo(() => {
    if (viewMode === "week") {
      return [...weekBookings].sort((a, b) => a.start.getTime() - b.start.getTime());
    }
    const allDays = monthDays.map((d) => d.date);
    const seen = new Set<string>();
    const upcoming: BookingWithParsedDates[] = [];
    for (const day of allDays) {
      for (const b of getBookingsForDay(day)) {
        if (!seen.has(b.id)) {
          seen.add(b.id);
          upcoming.push(b);
        }
      }
    }
    return upcoming.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [viewMode, weekBookings, monthDays, getBookingsForDay]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.navGroup}>
            <button className={styles.navBtn} onClick={goToPrev}>
              <IoIosArrowBack />
            </button>
            <button className={styles.navBtn} onClick={goToNext}>
              <IoIosArrowForward />
            </button>
          </div>
          <button className={styles.todayBtn} onClick={goToToday}>
            Today
          </button>
          <span className={styles.headerLabel}>{headerLabel}</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.filters}>
            {STATUSES.map((s) => (
              <button
                key={s}
                className={`${styles.filterPill} ${selectedStatus === s ? styles.filterPillActive : ""}`}
                onClick={() => setSelectedStatus(selectedStatus === s ? null : s)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === "week" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("week")}
            >
              Week
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === "month" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("month")}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* Mini Calendar */}
          <div className={styles.miniCalendar}>
            <div className={styles.miniCalHeader}>
              <span className={styles.miniCalMonth}>
                {monthNames[miniCalMonth]} {miniCalYear}
              </span>
              <div className={styles.miniCalNav}>
                <button className={styles.miniCalNavBtn} onClick={miniCalPrev}>
                  <IoIosArrowBack />
                </button>
                <button className={styles.miniCalNavBtn} onClick={miniCalNext}>
                  <IoIosArrowForward />
                </button>
              </div>
            </div>
            <div className={styles.miniCalDayLabels}>
              {dayLabelsShort.map((d) => (
                <span key={d} className={styles.miniCalDayLabel}>{d}</span>
              ))}
            </div>
            <div className={styles.miniCalDays}>
              {miniCalDays.map((cell, i) => {
                const isToday = isSameDay(cell.date, today);
                const isSelected = isSameDay(cell.date, currentDate);
                const hasBooking = getBookingsForDay(cell.date).length > 0;
                return (
                  <button
                    key={i}
                    className={`${styles.miniCalDay} ${cell.outside ? styles.miniCalDayOutside : ""} ${isToday ? styles.miniCalDayToday : ""} ${isSelected && !isToday ? styles.miniCalDaySelected : ""} ${hasBooking && !isToday && !isSelected ? styles.miniCalDayHasBooking : ""}`}
                    onClick={() => handleMiniCalDayClick(cell.date)}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming */}
          <div className={styles.upcomingSection}>
            <div className={styles.upcomingTitle}>Upcoming bookings</div>
            <div className={styles.upcomingList}>
              {upcomingBookings.slice(0, 10).map((b) => (
                <div
                  key={b.id}
                  className={styles.upcomingItem}
                  onClick={() => setSelectedBooking(b)}
                >
                  <div className={styles.upcomingDot} style={{ background: getStatusColor(b.status) }} />
                  <div className={styles.upcomingInfo}>
                    <div className={styles.upcomingService}>{b.serviceName}</div>
                    <div className={styles.upcomingDate}>
                      {formatDateShort(b.start)} — {b.name}
                    </div>
                  </div>
                </div>
              ))}
              {upcomingBookings.length === 0 && (
                <div className={styles.upcomingDate}>No bookings found</div>
              )}
            </div>
          </div>
        </div>

        {/* Main Timeline */}
        <div className={styles.timeline}>
          {viewMode === "week" ? (
            <WeekView
              weekDays={weekDays}
              weekStart={weekStart}
              weekBookings={weekBookings}
              today={today}
              isSameDay={isSameDay}
              dayLabelsShort={dayLabelsShort}
              onBookingClick={setSelectedBooking}
            />
          ) : (
            <MonthView
              monthDays={monthDays}
              today={today}
              isSameDay={isSameDay}
              dayLabelsShort={dayLabelsShort}
              getBookingsForDay={getBookingsForDay}
              onBookingClick={setSelectedBooking}
            />
          )}
        </div>
      </div>

      {/* Booking Detail Overlay */}
      {selectedBooking && (
        <div className={styles.overlay} onClick={() => setSelectedBooking(null)}>
          <div className={styles.overlayCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.overlayHeader}>
              <span className={styles.overlayTitle}>Booking Details</span>
              <button className={styles.overlayClose} onClick={() => setSelectedBooking(null)}>
                <IoClose />
              </button>
            </div>
            <div className={styles.overlayBody}>
              <div className={styles.overlayRow}>
                <span className={styles.overlayLabel}>Service</span>
                <span className={styles.overlayValue}>{selectedBooking.serviceName}</span>
              </div>
              <div className={styles.overlayRow}>
                <span className={styles.overlayLabel}>Client</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <img className={styles.overlayAvatar} src={selectedBooking.ownerIcon} alt={selectedBooking.name} />
                  <span className={styles.overlayValue}>{selectedBooking.name}</span>
                </div>
              </div>
              <div className={styles.overlayRow}>
                <span className={styles.overlayLabel}>Vehicle</span>
                <span className={styles.overlayValue}>
                  {selectedBooking.carYear} {selectedBooking.carMake} {selectedBooking.carModel}
                </span>
              </div>
              <div className={styles.overlayRow}>
                <span className={styles.overlayLabel}>Date</span>
                <span className={styles.overlayValue}>
                  {formatDateShort(selectedBooking.start)} — {formatDateShort(selectedBooking.end)}
                </span>
              </div>
              <div className={styles.overlayRow}>
                <span className={styles.overlayLabel}>Status</span>
                <span className={`${styles.overlayStatusBadge} ${getBadgeClass(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>
              <div className={styles.overlayRow}>
                <span className={styles.overlayLabel}>ID</span>
                <span className={styles.overlayValue}>#{selectedBooking.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Week View Sub-Component ── */
function WeekView({
  weekDays,
  weekStart,
  weekBookings,
  today,
  isSameDay,
  dayLabelsShort,
  onBookingClick,
}: {
  weekDays: Date[];
  weekStart: Date;
  weekBookings: BookingWithParsedDates[];
  today: Date;
  isSameDay: (a: Date, b: Date) => boolean;
  dayLabelsShort: string[];
  onBookingClick: (b: BookingWithParsedDates) => void;
}) {
  const laneEntries = useMemo(() => assignLanes(weekBookings, weekStart), [weekBookings, weekStart]);
  const totalLanes = laneEntries.length > 0 ? Math.max(...laneEntries.map((e) => e.lane)) + 1 : 0;

  return (
    <>
      {/* Day headers */}
      <div className={styles.weekHeader}>
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={i}
              className={`${styles.weekDayHeader} ${isToday ? styles.weekDayHeaderToday : ""}`}
            >
              <span className={styles.weekDayLabel}>{dayLabelsShort[day.getDay()]}</span>
              <span className={styles.weekDayNumber}>{day.getDate()}</span>
            </div>
          );
        })}
      </div>

      {/* Spanning bars grid */}
      {totalLanes > 0 ? (
        <div className={styles.lanesGrid}>
          {/* Column dividers for visual separation */}
          {weekDays.map((_, i) => (
            <div
              key={`col-${i}`}
              className={styles.laneColumnBg}
              style={{ gridColumn: i + 1, gridRow: `1 / ${totalLanes + 1}` }}
            />
          ))}

          {/* Booking bars */}
          {laneEntries.map((entry) => (
            <div
              key={entry.booking.id}
              className={`${styles.bookingBar} ${getBarClass(entry.booking.status)}`}
              style={{
                gridColumn: `${entry.startCol} / ${entry.endCol}`,
                gridRow: entry.lane + 1,
              }}
              onClick={() => onBookingClick(entry.booking)}
            >
              <img className={styles.barAvatar} src={entry.booking.ownerIcon} alt={entry.booking.name} />
              <div className={styles.barContent}>
                <span className={styles.barService}>{entry.booking.serviceName}</span>
                <span className={styles.barMeta}>
                  {entry.booking.name} &middot; {entry.booking.carMake} {entry.booking.carModel}
                </span>
              </div>
              <span className={styles.barStatus} style={{ color: getStatusColor(entry.booking.status) }}>
                {entry.booking.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyWeek}>
          <span className={styles.emptyWeekText}>No bookings this week</span>
        </div>
      )}
    </>
  );
}

/* ── Month View Sub-Component ── */
function MonthView({
  monthDays,
  today,
  isSameDay,
  dayLabelsShort,
  getBookingsForDay,
  onBookingClick,
}: {
  monthDays: { date: Date; outside: boolean }[];
  today: Date;
  isSameDay: (a: Date, b: Date) => boolean;
  dayLabelsShort: string[];
  getBookingsForDay: (date: Date) => BookingWithParsedDates[];
  onBookingClick: (b: BookingWithParsedDates) => void;
}) {
  const MAX_PILLS = 3;

  return (
    <>
      <div className={styles.monthDayLabels}>
        {dayLabelsShort.map((d) => (
          <span key={d} className={styles.monthDayLabel}>{d}</span>
        ))}
      </div>
      <div className={styles.monthGrid}>
        {monthDays.map((cell, i) => {
          const isToday = isSameDay(cell.date, today);
          const dayBookings = getBookingsForDay(cell.date);
          const visibleBookings = dayBookings.slice(0, MAX_PILLS);
          const moreCount = dayBookings.length - MAX_PILLS;

          return (
            <div
              key={i}
              className={`${styles.monthCell} ${cell.outside ? styles.monthCellOutside : ""} ${isToday ? styles.monthCellToday : ""}`}
            >
              <span className={`${styles.monthCellNumber} ${isToday ? styles.monthCellTodayNumber : ""}`}>
                {cell.date.getDate()}
              </span>
              {visibleBookings.map((b) => (
                <div
                  key={b.id}
                  className={`${styles.monthBookingPill} ${getPillClass(b.status)}`}
                  onClick={() => onBookingClick(b)}
                >
                  <span className={styles.pillDot} style={{ background: getStatusColor(b.status) }} />
                  {b.serviceName}
                </div>
              ))}
              {moreCount > 0 && (
                <span className={styles.monthMore}>+{moreCount} more</span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
