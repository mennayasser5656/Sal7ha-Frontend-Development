"use client";

import styles from "./StatusWidget.module.css";

interface StatusWidgetProps {
  title: string;
  count: number;
  total: number;
  color: string;
}

export default function StatusWidget({ title, count, total, color }: StatusWidgetProps) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? count / total : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className={styles.statusWidget}>
      <div className={styles.statusWidgetHeader}>
        <div className={styles.statusWidgetTitle}>{title}</div>
        <div className={styles.statusWidgetSub}>Summary</div>
      </div>
      <div className={styles.statusCircle}>
        <svg viewBox="0 0 44 44">
          <circle className={styles.statusCircleBg} cx="22" cy="22" r={radius} />
          <circle
            className={styles.statusCircleFg}
            cx="22"
            cy="22"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className={styles.statusCircleText}>
          <span className={styles.statusCount}>{count}</span>
          <span className={styles.statusLabel}>Service</span>
        </div>
      </div>
    </div>
  );
}
