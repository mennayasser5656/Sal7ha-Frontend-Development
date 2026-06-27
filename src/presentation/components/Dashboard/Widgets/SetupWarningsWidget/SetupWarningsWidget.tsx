"use client";

import { AlertCircle, Clock, ShieldCheck, WalletCards, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import type {
  SetupWarning,
  StatusCounts,
} from "@/infrastructure/services/dashboard.service";
import styles from "./SetupWarningsWidget.module.css";

interface SetupWarningsWidgetProps {
  warnings: SetupWarning[];
  statusCounts: StatusCounts;
}

type ActionItem = {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  tone: "request" | "critical" | "warning";
};

const MAX_VISIBLE_ITEMS = 5;

function getSetupIcon(segment: string) {
  if (segment === "billing") return WalletCards;
  if (segment === "security") return ShieldCheck;
  if (segment === "personal") return UserRound;
  return AlertCircle;
}

export default function SetupWarningsWidget({
  warnings,
  statusCounts,
}: SetupWarningsWidgetProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const pendingLabel =
    statusCounts.pending === 1
      ? "Review 1 pending booking request"
      : `Review ${statusCounts.pending} pending booking requests`;
  const actionItems: ActionItem[] = [
    ...(statusCounts.pending > 0
      ? [
          {
            id: "pending-booking-requests",
            label: pendingLabel,
            href: `/${locale}/bookings`,
            icon: Clock,
            tone: "request" as const,
          },
        ]
      : []),
    ...warnings.map((warning) => ({
      id: warning.id,
      label: `${warning.title}: ${warning.description}`,
      href: `/${locale}/settings/${warning.segment}`,
      icon: getSetupIcon(warning.segment),
      tone: warning.severity,
    })),
  ];
  const visibleItems = actionItems.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenCount = Math.max(actionItems.length - visibleItems.length, 0);

  return (
    <div className={styles.actionItemsWidget}>
      <div className={styles.header}>
        <h2 className={styles.title}>Action items</h2>
        <span className={styles.subtitle}>
          {actionItems.length > 0
            ? `${actionItems.length} need attention`
            : "All clear"}
        </span>
      </div>

      <div className={styles.actionList}>
        {visibleItems.length > 0 ? (
          visibleItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.id} href={item.href} className={styles.actionItem}>
                <span
                  className={`${styles.actionIcon} ${styles[item.tone]}`}
                  aria-hidden="true"
                >
                  <Icon size={13} strokeWidth={2} />
                </span>
                <span className={styles.actionLabel}>{item.label}</span>
              </Link>
            );
          })
        ) : (
          <div className={styles.emptyState}>No action items right now</div>
        )}

        {hiddenCount > 0 && (
          <span className={styles.moreLink}>
            {hiddenCount} more {hiddenCount === 1 ? "item" : "items"}
          </span>
        )}
      </div>
    </div>
  );
}
