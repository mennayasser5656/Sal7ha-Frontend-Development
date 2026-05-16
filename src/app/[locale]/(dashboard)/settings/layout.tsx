"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./settings.module.css";

const TABS = [
  { label: "Personal Information", segment: "personal" },
  { label: "Business Information", segment: "business" },
  { label: "Items", segment: "items" },
  { label: "Services", segment: "services" },
  { label: "Notifications", segment: "notifications" },
  { label: "Security", segment: "security" },
  { label: "Billing", segment: "billing" },
];

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
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
}
