"use client";

import styles from "./CustomizeOverlay.module.css";
import { FiPlus, FiMinus } from "react-icons/fi";
import { WidgetDefinition } from "@/infrastructure/services/dashboard.service";
import { StatusCounts } from "@/infrastructure/services/dashboard.service";
import Booking from "@/domain/entities/Booking";
import WidgetRenderer from "../Widgets/WidgetRenderer";

interface CustomizeOverlayProps {
  activeWidgets: WidgetDefinition[];
  inactiveWidgets: WidgetDefinition[];
  addWidget: (id: string) => void;
  removeWidget: (id: string) => void;
  onClose: () => void;
  statusCounts: StatusCounts;
  calendarProps: {
    today: Date;
    viewMonth: number;
    viewYear: number;
    monthName: string;
    dayLabels: string[];
    calendarDays: { day: number; outside: boolean }[];
    monthBookings: Booking[];
    prevMonth: () => void;
    nextMonth: () => void;
    formatBookingDateRange: (start: string, end: string) => string;
    getClientImage: (index: number) => string;
  };
}

export default function CustomizeOverlay({
  activeWidgets,
  inactiveWidgets,
  addWidget,
  removeWidget,
  onClose,
  statusCounts,
  calendarProps,
}: CustomizeOverlayProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.overlayContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.overlaySectionTitle}>Current Widgets</h3>
        <div className={styles.overlayWidgetGrid}>
          {activeWidgets.map((w) =>
            w ? (
              <div
                key={w.id}
                className={styles.overlayCard}
                style={{ gridColumn: `span ${w.span ?? 1}` }}
              >
                <button
                  className={`${styles.overlayCircleBtn} ${styles.overlayRemoveBtn}`}
                  onClick={() => removeWidget(w.id)}
                >
                  <FiMinus />
                </button>
                <WidgetRenderer
                  widget={w}
                  statusCounts={statusCounts}
                  calendarProps={calendarProps}
                />
              </div>
            ) : null,
          )}
        </div>

        {inactiveWidgets.length > 0 && (
          <>
            <h3 className={styles.overlaySectionTitle}>Add Widgets</h3>
            <div className={styles.overlayWidgetGrid}>
              {inactiveWidgets.map((w) => (
                <div
                  key={w.id}
                  className={styles.overlayCard}
                  style={{ gridColumn: `span ${w.span ?? 1}` }}
                >
                  <button
                    className={`${styles.overlayCircleBtn} ${styles.overlayAddBtn}`}
                    onClick={() => addWidget(w.id)}
                  >
                    <FiPlus />
                  </button>
                  <WidgetRenderer
                    widget={w}
                    statusCounts={statusCounts}
                    calendarProps={calendarProps}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
