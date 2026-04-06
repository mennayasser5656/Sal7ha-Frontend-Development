"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import styles from "./DateActionButton.module.css";
import { IoIosArrowDown, IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiCalendar } from "react-icons/fi";
import { useClickOutside } from "@/application/hooks/useClickOutside";
import { MONTH_NAMES, DAY_LABELS_SHORT, getCalendarDays, getYearRange } from "@/infrastructure/services/date.service";

interface DateRange {
  start: Date;
  end: Date | null;
}

interface DateActionButtonProps {
  range: DateRange | null;
  onRangeChange: (range: DateRange | null) => void;
}

export default function DateActionButton({ range, onRangeChange }: DateActionButtonProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(range?.start.getMonth() ?? today.getMonth());
  const [viewYear, setViewYear] = useState(range?.start.getFullYear() ?? today.getFullYear());
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, useCallback(() => { setOpen(false); setYearPickerOpen(false); }, []));

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const days = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const isSameDay = (a: Date | null | undefined, day: number, month: number, year: number) => {
    if (!a) return false;
    return a.getDate() === day && a.getMonth() === month && a.getFullYear() === year;
  };

  const isInRange = (day: number, month: number, year: number) => {
    if (!range || !range.end) return false;
    const t = new Date(year, month, day).getTime();
    return t > range.start.getTime() && t < range.end.getTime();
  };

  const handleDayClick = (day: number, month: number, year: number) => {
    const clicked = new Date(year, month, day);
    if (!range) {
      onRangeChange({ start: clicked, end: null });
    } else if (!range.end) {
      if (clicked.getTime() === range.start.getTime()) {
        onRangeChange(null);
      } else if (clicked < range.start) {
        onRangeChange({ start: clicked, end: range.start });
      } else {
        onRangeChange({ start: range.start, end: clicked });
      }
    } else {
      onRangeChange({ start: clicked, end: null });
    }
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
              {getYearRange().map((y) => (
                <button
                  key={y}
                  className={`${styles.yearBtn} ${y === viewYear ? styles.yearBtnActive : ""}`}
                  onClick={() => { setViewYear(y); setYearPickerOpen(false); }}
                >
                  {y}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className={styles.dayLabels}>
                {DAY_LABELS_SHORT.map((d) => (
                  <span key={d} className={styles.dayLabel}>{d}</span>
                ))}
              </div>
              <div className={styles.days}>
                {days.map((cell, i) => {
                  const rStart = isSameDay(range?.start, cell.day, cell.month, cell.year);
                  const rEnd = isSameDay(range?.end, cell.day, cell.month, cell.year);
                  const inRange = isInRange(cell.day, cell.month, cell.year);
                  const tod = isSameDay(today, cell.day, cell.month, cell.year);
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
