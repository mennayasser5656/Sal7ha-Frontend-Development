"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./storage.module.css";

const TABS = [
  { label: "Overview", segment: "overview" },
  { label: "Inventory", segment: "inventory" },
];

export default function StorageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = pathname.replace(/\/(overview|inventory)$/, "");

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h1 className={styles.title}>Storage</h1>
        <div className={styles.tabs}>
          {TABS.map((tab) => {
            const href = `${base}/${tab.segment}`;
            const isActive = pathname === href;
            return (
              <Link
                key={tab.segment}
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
