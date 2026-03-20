import React from "react";
import styles from "./ActionButton.module.css";

interface ActionButtonProps {
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export default function ActionButton({
  label,
  isActive = false,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      className={`${styles.actionButton} ${isActive ? styles.active : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
