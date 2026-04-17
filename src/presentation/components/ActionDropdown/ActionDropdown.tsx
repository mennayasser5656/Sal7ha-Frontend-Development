"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./ActionDropdown.module.css";
import { IoIosArrowDown } from "react-icons/io";
import { useClickOutside } from "@/application/hooks/useClickOutside";

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
  useClickOutside(ref, useCallback(() => setOpen(false), []));

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
