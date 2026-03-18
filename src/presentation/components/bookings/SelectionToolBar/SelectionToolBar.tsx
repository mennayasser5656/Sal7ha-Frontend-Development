import React, { useState } from "react";
import styles from "./SelectionToolBar.module.css";
import { MdDelete, MdClose, MdCheckCircle } from "react-icons/md";
import { MdSwapHoriz } from "react-icons/md";
import { MdMoreHoriz } from "react-icons/md";

type Status = "In-Progress" | "Pending" | "Cancelled" | "Completed";

interface SelectionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete: () => void;
  onChangeStatus: (status: Status) => void;
}

const STATUS_OPTIONS: Status[] = [
  "In-Progress",
  "Pending",
  "Cancelled",
  "Completed",
];

export default function SelectionToolBar({
  selectedCount,
  onClearSelection,
  onDelete,
  onChangeStatus,
}: SelectionBarProps) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className={styles.bar}>
      {/* Left: count + clear */}
      <div className={styles.left}>
        <div className={styles.badge}>{selectedCount}</div>
        <span className={styles.label}>Selected</span>
        <button className={styles.clearBtn} onClick={onClearSelection}>
          <MdClose size={14} />
          Clear
        </button>
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Actions */}
      <div className={styles.actions}>
        {/* Change Status */}
        <div className={styles.dropdownWrapper}>
          <button
            className={styles.actionBtn}
            onClick={() => setStatusMenuOpen((v) => !v)}
          >
            <MdSwapHoriz size={15} />
            Change Status
          </button>
          {statusMenuOpen && (
            <div className={styles.dropdown}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  className={styles.dropdownItem}
                  onClick={() => {
                    onChangeStatus(s);
                    setStatusMenuOpen(false);
                  }}
                >
                  <span
                    className={`${styles.dot} ${styles[`dot_${s.replace("-", "")}`]}`}
                  />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={onDelete}
        >
          <MdDelete size={15} />
          Delete
        </button>
      </div>
    </div>
  );
}
