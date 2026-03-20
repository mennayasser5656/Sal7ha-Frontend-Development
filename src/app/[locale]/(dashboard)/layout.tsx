"use client";

import React from "react";
import styles from "./dashboard.module.css";
import DashboardBar from "@/presentation/components/Dashboard/DashboardBar/DashboardBar";
import { RiNotification3Line } from "react-icons/ri";
import { IoSettingsOutline } from "react-icons/io5";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.screen}>
      <DashboardBar></DashboardBar>
      <div className={styles.section}>
        <div className={styles.content}>
          <div className={styles.children}>{children}</div>
        </div>
      </div>
    </div>
  );
}
