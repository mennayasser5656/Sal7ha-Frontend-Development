"use client";

import type { ReactNode } from "react";
import { FiEdit2 } from "react-icons/fi";
import styles from "./SettingsInfoSection.module.css";

export function SettingsInfoSection({
  title,
  children,
  editLabel,
  onEdit,
}: {
  title: string;
  children: ReactNode;
  editLabel?: string;
  onEdit?: () => void;
}) {
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {onEdit && (
          <button
            type="button"
            className={styles.editButton}
            onClick={onEdit}
            aria-label={editLabel ?? `Edit ${title}`}
          >
            <FiEdit2 />
          </button>
        )}
      </div>
      <div className={styles.rows}>{children}</div>
    </div>
  );
}

export function SettingsInfoRow({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: string;
}) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      {value ? (
        <span className={styles.rowValue}>{value}</span>
      ) : (
        <button type="button" className={styles.rowLink}>
          {placeholder ?? `Set ${label.toLowerCase()}`}
        </button>
      )}
    </div>
  );
}
