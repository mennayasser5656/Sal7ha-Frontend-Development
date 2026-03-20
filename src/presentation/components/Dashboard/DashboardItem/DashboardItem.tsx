import React, { useState } from "react";
import styles from "./DashboardItem.module.css";

interface DashboardItemProps {
  icon: React.ReactNode;
  hoveredIcon?: React.ReactNode;
  text: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function DashboardItem({
  icon,
  hoveredIcon,
  text,
  isSelected,
  onClick,
}: DashboardItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`${styles.dashboardItem} ${isSelected ? styles.isSelected : ""}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.dashboardItemIcon}>
        {(isHovered || isSelected) && hoveredIcon ? hoveredIcon : icon}
      </div>
      <span className={styles.dashboardItemText}>{text}</span>
    </div>
  );
}
