"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Dropdown.module.css";
import { IoIosArrowDown, IoIosClose } from "react-icons/io";

interface DropdownProps {
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  label?: string;
}

export default function Dropdown({
  options,
  selected,
  onSelect,
  label = "Select",
}: DropdownProps) {
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

  return (
    <div className={styles.dropdown} ref={ref}>
      <button
        className={`${styles.button} ${selected ? styles.buttonActive : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span>{selected || label}</span>
        {selected ? (
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
                onSelect(selected === option ? null : option);
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
