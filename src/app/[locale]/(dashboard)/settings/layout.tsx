"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SetupStatusIndicator,
  type SetupStatus,
} from "@/presentation/components/settings/SetupStatusIndicator";
import styles from "./settings.module.css";

const TABS = [
  {
    label: "Personal Information",
    segment: "personal",
    setupStatus: "warning",
    setupLabel: "Birth date is not set",
  },
  { label: "Business Information", segment: "business" },
  { label: "Items", segment: "items" },
  { label: "Services", segment: "services" },
  { label: "Notifications", segment: "notifications" },
  {
    label: "Security",
    segment: "security",
    setupStatus: "warning",
    setupLabel: "Multi-factor authentication is not set",
  },
  {
    label: "Billing",
    segment: "billing",
    setupStatus: "critical",
    setupLabel: "Billing setup is required",
  },
] satisfies {
  label: string;
  segment: string;
  setupStatus?: SetupStatus;
  setupLabel?: string;
}[];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const settingsIdx = pathname.indexOf("/settings");
  const base = pathname.slice(0, settingsIdx + "/settings".length);
  const remainder = pathname.slice(settingsIdx + "/settings".length);
  const activeSegment = remainder.replace(/^\//, "");

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h1 className={styles.title}>Business Settings</h1>
        <div className={styles.tabs}>
          {TABS.map((tab) => {
            const href = `${base}/${tab.segment}`;
            const isActive = activeSegment === tab.segment;
            return (
              <Link
                key={tab.segment || "root"}
                href={href}
                className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              >
                <span>{tab.label}</span>
                {tab.setupStatus && (
                  <SetupStatusIndicator
                    status={tab.setupStatus}
                    label={tab.setupLabel}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
}
