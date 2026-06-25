"use client";

import { useState } from "react";
import styles from "./dashboard.module.css";
import { MdDashboardCustomize } from "react-icons/md";
import { useDashboard } from "@/application/hooks/useDashboard";
import WidgetRenderer from "@/presentation/components/Dashboard/Widgets/WidgetRenderer";
import CustomizeOverlay from "@/presentation/components/Dashboard/CustomizeOverlay/CustomizeOverlay";

export default function DashboardView() {
  const {
    today,
    viewMonth,
    viewYear,
    monthName,
    dayLabels,
    calendarDays,
    monthBookings,
    prevMonth,
    nextMonth,
    formatBookingDateRange,
    getClientImage,
    statusCounts,
    activeWidgets,
    inactiveWidgets,
    setupWarnings,
    businessProfile,
    addWidget,
    removeWidget,
  } = useDashboard();

  const [overlayOpen, setOverlayOpen] = useState(false);

  const calendarProps = {
    today,
    viewMonth,
    viewYear,
    monthName,
    dayLabels,
    calendarDays,
    monthBookings,
    prevMonth,
    nextMonth,
    formatBookingDateRange,
    getClientImage,
  };

  return (
    <>
      <div className={styles.page}>
        {activeWidgets.map(
          (w) =>
            w && (
              <WidgetRenderer
                key={w.id}
                widget={w}
                statusCounts={statusCounts}
                setupWarnings={setupWarnings}
                businessProfile={businessProfile}
                calendarProps={calendarProps}
              />
            ),
        )}
      </div>

      <button
        className={styles.customizeBtn}
        onClick={() => setOverlayOpen(true)}
      >
        <MdDashboardCustomize />
        <span>Customize</span>
      </button>

      {overlayOpen && (
        <CustomizeOverlay
          activeWidgets={activeWidgets.filter(Boolean) as import("@/infrastructure/services/dashboard.service").WidgetDefinition[]}
          inactiveWidgets={inactiveWidgets}
          addWidget={addWidget}
          removeWidget={removeWidget}
          onClose={() => setOverlayOpen(false)}
          statusCounts={statusCounts}
          setupWarnings={setupWarnings}
          businessProfile={businessProfile}
          calendarProps={calendarProps}
        />
      )}
    </>
  );
}
