"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SetupStatusIndicator,
  type SetupStatus,
} from "@/presentation/components/settings/SetupStatusIndicator";
import {
  ACCOUNT_PROFILE_UPDATED_EVENT,
} from "@/application/events/accountProfile.events";
import { getPersonalSettingsSetupIndicator } from "@/application/utils/accountSetupWarnings";
import {
  getAccountProfile,
  type AccountProfile,
} from "@/infrastructure/services/account.service";
import { authApi } from "@/infrastructure/api/auth.api";
import styles from "./settings.module.css";

const TABS = [
  { label: "Personal Information", segment: "personal" },
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
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [accountProfile, setAccountProfile] = useState<AccountProfile | null>(
    null,
  );
  const settingsIdx = pathname.indexOf("/settings");
  const base = pathname.slice(0, settingsIdx + "/settings".length);
  const remainder = pathname.slice(settingsIdx + "/settings".length);
  const activeSegment = remainder.replace(/^\//, "");
  const personalSetupIndicator = accountProfile
    ? getPersonalSettingsSetupIndicator(accountProfile)
    : null;

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await authApi.signOut();
    } catch {
      // The auth service clears the local session even if the API is unavailable.
    } finally {
      const locale = pathname.split("/")[1] || "en";
      router.replace(`/${locale}/sign-in`);
      router.refresh();
    }
  }

  useEffect(() => {
    let ignore = false;

    void getAccountProfile().then((profile) => {
      if (!ignore) setAccountProfile(profile);
    });

    function handleAccountProfileUpdated(event: Event) {
      setAccountProfile((event as CustomEvent<AccountProfile>).detail);
    }

    window.addEventListener(
      ACCOUNT_PROFILE_UPDATED_EVENT,
      handleAccountProfileUpdated,
    );

    return () => {
      ignore = true;
      window.removeEventListener(
        ACCOUNT_PROFILE_UPDATED_EVENT,
        handleAccountProfileUpdated,
      );
    };
  }, []);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Settings</h1>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
        <div className={styles.tabs}>
          {TABS.map((tab) => {
            const href = `${base}/${tab.segment}`;
            const isActive = activeSegment === tab.segment;
            const setupStatus =
              tab.segment === "personal"
                ? personalSetupIndicator?.status
                : tab.setupStatus;
            const setupLabel =
              tab.segment === "personal"
                ? personalSetupIndicator?.label
                : tab.setupLabel;
            return (
              <Link
                key={tab.segment || "root"}
                href={href}
                className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              >
                <span>{tab.label}</span>
                {setupStatus && (
                  <SetupStatusIndicator
                    status={setupStatus}
                    label={setupLabel}
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
