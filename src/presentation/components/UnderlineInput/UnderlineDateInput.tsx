"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./UnderlineInput.module.css";
import { FiCalendar } from "react-icons/fi";
import { IoIosArrowDown, IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface UnderlineDateInputProps {
  label: string;
  placeholder?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  span?: number;
  dropdownAlign?: "left" | "right";
}

function formatDate(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function parseDate(str: string): Date | null {
  const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, mm, dd, yyyy] = match;
  const m = parseInt(mm, 10);
  const d = parseInt(dd, 10);
  const y = parseInt(yyyy, 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d);
  if (date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

export default function UnderlineDateInput({
  label,
  placeholder = "MM/DD/YYYY",
  value,
  onChange,
  span,
  dropdownAlign = "left",
}: UnderlineDateInputProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? today.getMonth());
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? today.getFullYear());
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [textValue, setTextValue] = useState(value ? formatDate(value) : "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTextValue(value ? formatDate(value) : "");
  }, [value]);

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

  const isSameDay = (a: Date | null, day: number, month: number, year: number) => {
    if (!a) return false;
    return a.getDate() === day && a.getMonth() === month && a.getFullYear() === year;
  };

  const isToday = (day: number, month: number, year: number) =>
    isSameDay(today, day, month, year);

  const isSelected = (day: number, month: number, year: number) =>
    isSameDay(value, day, month, year);

  const handleDayClick = (day: number, month: number, year: number) => {
    const clicked = new Date(year, month, day);
    if (value && clicked.getTime() === value.getTime()) {
      onChange(null);
    } else {
      onChange(clicked);
    }
    setOpen(false);
  };

  const yearRange = () => {
    const current = today.getFullYear();
    const years: number[] = [];
    for (let y = current - 5; y <= current + 5; y++) years.push(y);
    return years;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // Only allow digits and slashes
    raw = raw.replace(/[^\d/]/g, "");

    // Auto-insert slashes: after MM and after MM/DD
    const digits = raw.replace(/\//g, "");
    if (digits.length >= 4) {
      raw = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    } else if (digits.length >= 2) {
      raw = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    // Cap at 10 chars (MM/DD/YYYY)
    if (raw.length > 10) raw = raw.slice(0, 10);

    setTextValue(raw);

    const parsed = parseDate(raw);
    if (parsed) {
      onChange(parsed);
      setViewMonth(parsed.getMonth());
      setViewYear(parsed.getFullYear());
    } else if (raw === "") {
      onChange(null);
    }
  };

  const handleBlur = () => {
    setTextValue(value ? formatDate(value) : "");
  };

  return (
    <div className={styles.wrapper} ref={ref} style={span ? { gridColumn: `span ${span}` } : undefined}>
      <span className={styles.label}>{label}</span>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          type="text"
          placeholder={placeholder}
          value={textValue}
          onChange={handleTextChange}
          onBlur={handleBlur}
        />
        <button
          className={styles.iconBtn}
          type="button"
          onClick={() => setOpen(!open)}
        >
          <FiCalendar />
        </button>
      </div>

      {open && (
        <div className={styles.dropdown} style={dropdownAlign === "right" ? { right: 0, left: "auto" } : { left: 0, right: "auto" }} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
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
                  <button className={styles.navBtn} onClick={prevMonth} type="button">
                    <IoIosArrowBack />
                  </button>
                  <button className={styles.navBtn} onClick={nextMonth} type="button">
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
                      type="button"
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
                      const sel = isSelected(cell.day, cell.month, cell.year);
                      const tod = isToday(cell.day, cell.month, cell.year);
                      return (
                        <button
                          key={i}
                          type="button"
                          className={[
                            styles.day,
                            cell.outside ? styles.dayOutside : "",
                            sel ? styles.daySelected : "",
                            tod && !sel ? styles.dayToday : "",
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