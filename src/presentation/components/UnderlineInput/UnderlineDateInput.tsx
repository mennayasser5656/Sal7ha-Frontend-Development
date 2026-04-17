"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import styles from "./UnderlineInput.module.css";
import { FiCalendar } from "react-icons/fi";
import { IoIosArrowDown, IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useClickOutside } from "@/application/hooks/useClickOutside";
import {
  MONTH_NAMES,
  DAY_LABELS_SHORT,
  getCalendarDays,
  getYearRange,
  formatDatePadded,
  parseDateStrict,
} from "@/infrastructure/services/date.service";

interface UnderlineDateInputProps {
  label: string;
  placeholder?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  span?: number;
  dropdownAlign?: "left" | "right";
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
  const [textValue, setTextValue] = useState(value ? formatDatePadded(value) : "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTextValue(value ? formatDatePadded(value) : "");
  }, [value]);

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

  const isSameDay = (a: Date | null, day: number, month: number, year: number) => {
    if (!a) return false;
    return a.getDate() === day && a.getMonth() === month && a.getFullYear() === year;
  };

  const handleDayClick = (day: number, month: number, year: number) => {
    const clicked = new Date(year, month, day);
    if (value && clicked.getTime() === value.getTime()) {
      onChange(null);
    } else {
      onChange(clicked);
    }
    setOpen(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d/]/g, "");
    const digits = raw.replace(/\//g, "");
    if (digits.length >= 4) {
      raw = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    } else if (digits.length >= 2) {
      raw = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    if (raw.length > 10) raw = raw.slice(0, 10);
    setTextValue(raw);

    const parsed = parseDateStrict(raw);
    if (parsed) {
      onChange(parsed);
      setViewMonth(parsed.getMonth());
      setViewYear(parsed.getFullYear());
    } else if (raw === "") {
      onChange(null);
    }
  };

  const handleBlur = () => {
    setTextValue(value ? formatDatePadded(value) : "");
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
        <button className={styles.iconBtn} type="button" onClick={() => setOpen(!open)}>
          <FiCalendar />
        </button>
      </div>

      {open && (
        <div
          className={styles.dropdown}
          style={dropdownAlign === "right" ? { right: 0, left: "auto" } : { left: 0, right: "auto" }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <button className={styles.monthYearBtn} onClick={() => setYearPickerOpen(!yearPickerOpen)}>
              <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
              <IoIosArrowDown className={`${styles.monthYearArrow} ${yearPickerOpen ? styles.monthYearArrowOpen : ""}`} />
            </button>
            <div className={styles.navButtons}>
              <button className={styles.navBtn} onClick={prevMonth} type="button"><IoIosArrowBack /></button>
              <button className={styles.navBtn} onClick={nextMonth} type="button"><IoIosArrowForward /></button>
            </div>
          </div>

          {yearPickerOpen ? (
            <div className={styles.yearPicker}>
              {getYearRange().map((y) => (
                <button
                  key={y}
                  className={`${styles.yearBtn} ${y === viewYear ? styles.yearBtnActive : ""}`}
                  onClick={() => { setViewYear(y); setYearPickerOpen(false); }}
                  type="button"
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
                  const sel = isSameDay(value, cell.day, cell.month, cell.year);
                  const tod = isSameDay(today, cell.day, cell.month, cell.year);
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
