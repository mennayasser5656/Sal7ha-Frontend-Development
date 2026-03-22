"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./DateActionButton.module.css";
import { IoIosArrowDown, IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiCalendar } from "react-icons/fi";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface DateRange {
  start: Date;
  end: Date | null;
}

interface DateActionButtonProps {
  range: DateRange | null;
  onRangeChange: (range: DateRange | null) => void;
}

function toKey(day: number, month: number, year: number) {
  return new Date(year, month, day).getTime();
}

export default function DateActionButton({ range, onRangeChange }: DateActionButtonProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(range?.start.getMonth() ?? today.getMonth());
  const [viewYear, setViewYear] = useState(range?.start.getFullYear() ?? today.getFullYear());
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setYearPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const getDays = () => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { day: number; month: number; year: number; outside: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({ day: daysInPrevMonth - i, month: prevM, year: prevY, outside: true });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, month: viewMonth, year: viewYear, outside: false });
    }

    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      for (let d = 1; d <= remaining; d++) {
        cells.push({ day: d, month: nextM, year: nextY, outside: true });
      }
    }

    return cells;
  };

  const isSameDay = (a: Date | null | undefined, day: number, month: number, year: number) => {
    if (!a) return false;
    return a.getDate() === day && a.getMonth() === month && a.getFullYear() === year;
  };

  const isToday = (day: number, month: number, year: number) => {
    return isSameDay(today, day, month, year);
  };

  const isInRange = (day: number, month: number, year: number) => {
    if (!range || !range.end) return false;
    const t = toKey(day, month, year);
    const s = range.start.getTime();
    const e = range.end.getTime();
    return t > s && t < e;
  };

  const isRangeStart = (day: number, month: number, year: number) => {
    return isSameDay(range?.start, day, month, year);
  };

  const isRangeEnd = (day: number, month: number, year: number) => {
    return isSameDay(range?.end, day, month, year);
  };

  const handleDayClick = (day: number, month: number, year: number) => {
    const clicked = new Date(year, month, day);

    if (!range) {
      // No selection yet — set as start
      onRangeChange({ start: clicked, end: null });
    } else if (!range.end) {
      // Have start, no end — set end (swap if needed)
      if (clicked.getTime() === range.start.getTime()) {
        // Clicked same day — deselect
        onRangeChange(null);
      } else if (clicked < range.start) {
        onRangeChange({ start: clicked, end: range.start });
      } else {
        onRangeChange({ start: range.start, end: clicked });
      }
    } else {
      // Already have a full range — start fresh with this date
      onRangeChange({ start: clicked, end: null });
    }
  };

  const yearRange = () => {
    const current = today.getFullYear();
    const years: number[] = [];
    for (let y = current - 5; y <= current + 5; y++) {
      years.push(y);
    }
    return years;
  };

  return (
    <div className={styles.wrapper} ref={ref}>
      <button className={styles.trigger} onClick={() => setOpen(!open)}>
        <span>Date</span>
        <FiCalendar className={styles.calendarIcon} />
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <button
              className={styles.monthYearBtn}
              onClick={() => setYearPickerOpen(!yearPickerOpen)}
            >
              <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
              <IoIosArrowDown
                className={`${styles.monthYearArrow} ${yearPickerOpen ? styles.monthYearArrowOpen : ""}`}
              />
            </button>
            <div className={styles.navButtons}>
              <button className={styles.navBtn} onClick={prevMonth}>
                <IoIosArrowBack />
              </button>
              <button className={styles.navBtn} onClick={nextMonth}>
                <IoIosArrowForward />
              </button>
            </div>
          </div>

          {yearPickerOpen ? (
            <div className={styles.yearPicker}>
              {yearRange().map((y) => (
                <button
                  key={y}
                  className={`${styles.yearBtn} ${y === viewYear ? styles.yearBtnActive : ""}`}
                  onClick={() => {
                    setViewYear(y);
                    setYearPickerOpen(false);
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className={styles.dayLabels}>
                {DAY_LABELS.map((d) => (
                  <span key={d} className={styles.dayLabel}>{d}</span>
                ))}
              </div>
              <div className={styles.days}>
                {getDays().map((cell, i) => {
                  const rStart = isRangeStart(cell.day, cell.month, cell.year);
                  const rEnd = isRangeEnd(cell.day, cell.month, cell.year);
                  const inRange = isInRange(cell.day, cell.month, cell.year);
                  const tod = isToday(cell.day, cell.month, cell.year);
                  return (
                    <button
                      key={i}
                      className={[
                        styles.day,
                        cell.outside ? styles.dayOutside : "",
                        rStart ? styles.dayRangeStart : "",
                        rEnd ? styles.dayRangeEnd : "",
                        inRange ? styles.dayInRange : "",
                        tod && !rStart && !rEnd ? styles.dayToday : "",
                      ].filter(Boolean).join(" ")}
                      onClick={() => {
                        handleDayClick(cell.day, cell.month, cell.year);
                        if (cell.outside) {
                          setViewMonth(cell.month);
                          setViewYear(cell.year);
                        }
                      }}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
