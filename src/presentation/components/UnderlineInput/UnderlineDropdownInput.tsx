"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./UnderlineInput.module.css";
import { IoIosArrowDown } from "react-icons/io";

interface Option {
  value: string;
  label: string;
}

interface UnderlineDropdownInputProps {
  label: string;
  placeholder?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  span?: number;
}

export default function UnderlineDropdownInput({
  label,
  placeholder = "Select",
  options,
  value,
  onChange,
  span,
}: UnderlineDropdownInputProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={styles.wrapper} ref={ref} style={span ? { gridColumn: `span ${span}` } : undefined}>
      <span className={styles.label}>{label}</span>
      <div className={styles.inputRow}>
        <div
          className={styles.selectTrigger}
          onClick={() => setOpen(!open)}
        >
          {selectedOption ? (
            <span className={styles.selectValue}>{selectedOption.label}</span>
          ) : (
            <span className={styles.selectPlaceholder}>{placeholder}</span>
          )}
          <IoIosArrowDown
            className={`${styles.selectArrow} ${open ? styles.selectArrowOpen : ""}`}
          />
        </div>
      </div>

      {open && (
        <div className={styles.selectDropdown}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.selectOption} ${option.value === value ? styles.selectOptionActive : ""}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
