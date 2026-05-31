"use client";

import { useCallback, useRef, useState } from "react";
import { IoIosArrowDown, IoIosClose } from "react-icons/io";
import { IoCheckmark } from "react-icons/io5";
import { useClickOutside } from "@/application/hooks/useClickOutside";
import styles from "./MultiSelectDropdown.module.css";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: MultiSelectOption[];
  /** Currently selected option values. */
  selected: string[];
  onChange: (next: string[]) => void;
  label: string;
  allLabel?: string;
}

export default function MultiSelectDropdown({
  options,
  selected,
  onChange,
  label,
  allLabel = "All",
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, useCallback(() => setOpen(false), []));

  const allSelected = options.length > 0 && selected.length === options.length;
  const hasSelection = selected.length > 0;

  function toggleAll() {
    onChange(allSelected ? [] : options.map((option) => option.value));
  }

  function toggleOption(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  }

  function buttonText() {
    if (!hasSelection) {
      return label;
    }
    if (allSelected) {
      return `${label}: ${allLabel}`;
    }
    if (selected.length === 1) {
      const match = options.find((option) => option.value === selected[0]);
      return `${label}: ${match?.label ?? selected[0]}`;
    }
    return `${label}: ${selected.length}`;
  }

  return (
    <div className={styles.dropdown} ref={ref}>
      <button
        type="button"
        className={`${styles.button} ${hasSelection ? styles.buttonActive : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span>{buttonText()}</span>
        {hasSelection ? (
          <IoIosClose
            className={styles.clearIcon}
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
              setOpen(false);
            }}
          />
        ) : (
          <IoIosArrowDown
            className={`${styles.arrow} ${open ? styles.arrowOpen : ""}`}
          />
        )}
      </button>
      {open && (
        <div className={styles.menu}>
          <button
            type="button"
            className={`${styles.item} ${allSelected ? styles.itemActive : ""}`}
            onClick={toggleAll}
          >
            <span>{allLabel}</span>
            {allSelected && <IoCheckmark className={styles.check} />}
          </button>
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                className={`${styles.item} ${isSelected ? styles.itemActive : ""}`}
                onClick={() => toggleOption(option.value)}
              >
                <span>{option.label}</span>
                {isSelected && <IoCheckmark className={styles.check} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
