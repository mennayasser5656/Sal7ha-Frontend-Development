import React from "react";
import styles from "./DashboardItem.module.css";

interface DashboardItemProps {
  icon: React.ReactNode;
  text: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function DashboardItem({
  icon,
  text,
  isSelected,
  onClick,
}: DashboardItemProps) {
  return (
    <div
      className={`${styles.dashboardItem} ${isSelected ? styles.isSelected : ""}`}
      onClick={onClick}
    >
      <div className={styles.dashboardItemIcon}>{icon}</div>
      <span className={styles.dashboardItemText}>{text}</span>
    </div>
  );
}
