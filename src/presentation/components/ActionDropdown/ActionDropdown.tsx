"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./ActionDropdown.module.css";
import { IoIosArrowDown } from "react-icons/io";

interface ActionDropdownProps {
  count: number;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ActionDropdown({
  count,
  onAccept,
  onDecline,
}: ActionDropdownProps) {
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

  if (count === 0) return null;

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(!open)}
      >
        <span>Actions</span>
        <span className={styles.badge}>{count}</span>
        <IoIosArrowDown
          className={`${styles.arrow} ${open ? styles.arrowOpen : ""}`}
        />
      </button>
      {open && (
        <div className={styles.menu}>
          <button
            className={styles.item}
            onClick={() => {
              onAccept();
              setOpen(false);
            }}
          >
            Accept
          </button>
          <button
            className={styles.item}
            onClick={() => {
              onDecline();
              setOpen(false);
            }}
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
