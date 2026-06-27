"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./dashboard.module.css";
import DashboardBar from "@/presentation/components/Dashboard/DashboardBar/DashboardBar";
import { getStoredAuthSession } from "@/infrastructure/api/client";
import { useFcmDeviceRegistration } from "@/application/hooks/useFcmDeviceRegistration";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  useFcmDeviceRegistration({
    autoRegister: true,
    listenForForegroundMessages: true,
  });

  useEffect(() => {
    if (!getStoredAuthSession()) {
      const locale = pathname.split("/")[1] || "en";
      router.replace(`/${locale}/sign-in`);
    }
  }, [pathname, router]);

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
