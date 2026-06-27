"use client";

import type { StatusCounts } from "@/infrastructure/services/dashboard.service";
import styles from "./StatusSummaryWidget.module.css";

interface StatusSummaryWidgetProps {
  title: string;
  counts: StatusCounts;
}

const STATUSES = [
  { key: "inProgress", label: "In progress", color: "#a0a0a0" },
  { key: "completed", label: "Completed", color: "#10b981" },
  { key: "pending", label: "Pending", color: "#ffb700" },
  { key: "cancelled", label: "Cancelled", color: "#ef4444" },
] as const;

const ARC_PATH = "M 18 94 A 76 76 0 0 1 170 94";

export default function StatusSummaryWidget({
  title,
  counts,
}: StatusSummaryWidgetProps) {
  const statuses = STATUSES.map((status) => ({
    ...status,
    count: counts[status.key],
  }));
  const total = statuses.reduce((sum, status) => sum + status.count, 0);
  let start = 0;

  return (
    <div className={styles.statusWidget}>
      <div className={styles.statusWidgetHeader}>
        <div className={styles.statusWidgetTitle}>{title}</div>
        <div className={styles.statusWidgetSub}>Service summary</div>
      </div>

      <div className={styles.statusChart}>
        <svg
          viewBox="0 0 188 104"
          role="img"
          aria-label={`${total} services split by booking status`}
        >
          <path className={styles.statusArcBg} d={ARC_PATH} pathLength="100" />
          {statuses.map((status) => {
            const percentage = total > 0 ? (status.count / total) * 100 : 0;
            const offset = start;
            start += percentage;

            return percentage > 0 ? (
              <path
                key={status.key}
                className={styles.statusArcSegment}
                d={ARC_PATH}
                pathLength="100"
                stroke={status.color}
                strokeDasharray={`${percentage} ${100 - percentage}`}
                strokeDashoffset={-offset}
              />
            ) : null;
          })}
        </svg>
        <div className={styles.statusChartText}>
          <span className={styles.statusCount}>{total}</span>
          <span className={styles.statusLabel}>
            {total === 1 ? "Service" : "Services"}
          </span>
        </div>
      </div>

      <div className={styles.statusLegend}>
        {statuses.map((status) => {
          const percentage =
            total > 0 ? Math.round((status.count / total) * 100) : 0;

          return (
            <div className={styles.statusLegendItem} key={status.key}>
              <span
                className={styles.statusLegendDot}
                style={{ backgroundColor: status.color }}
              />
              <span className={styles.statusLegendLabel}>{status.label}</span>
              <span className={styles.statusLegendValue}>
                {status.count} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
