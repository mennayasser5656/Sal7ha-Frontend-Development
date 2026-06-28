"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./Dropdown.module.css";
import { IoIosArrowDown, IoIosClose } from "react-icons/io";
import { useClickOutside } from "@/application/hooks/useClickOutside";

interface DropdownProps {
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  label?: string;
  clearable?: boolean;
  showLabelWithSelection?: boolean;
}

export default function Dropdown({
  options,
  selected,
  onSelect,
  label = "Select",
  clearable = true,
  showLabelWithSelection = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, useCallback(() => setOpen(false), []));

  return (
    <div className={styles.dropdown} ref={ref}>
      <button
        className={`${styles.button} ${selected ? styles.buttonActive : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span>
          {selected
            ? showLabelWithSelection
              ? `${label}: ${selected}`
              : selected
            : label}
        </span>
        {selected && clearable ? (
          <IoIosClose
            className={styles.clearIcon}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);
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
          {options.map((option) => (
            <button
              key={option}
              className={`${styles.item} ${selected === option ? styles.itemActive : ""}`}
              onClick={() => {
                onSelect(selected === option && clearable ? null : option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
