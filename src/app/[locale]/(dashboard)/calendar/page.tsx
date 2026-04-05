"use client";

import styles from "./calendar.module.css";
import CalendarView from "@/presentation/components/bookings/CalendarView/CalendarView";

export default function CalendarPage() {
  return (
    <div className={styles.section}>
      <h1 className={styles.title}>Calendar</h1>
      <CalendarView />
    </div>
  );
}
