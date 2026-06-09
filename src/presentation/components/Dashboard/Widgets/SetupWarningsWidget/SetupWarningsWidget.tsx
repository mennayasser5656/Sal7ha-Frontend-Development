"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SetupWarning } from "@/infrastructure/services/dashboard.service";
import { SetupStatusIndicator } from "@/presentation/components/settings/SetupStatusIndicator";
import styles from "./SetupWarningsWidget.module.css";

interface SetupWarningsWidgetProps {
  warnings: SetupWarning[];
}

export default function SetupWarningsWidget({
  warnings,
}: SetupWarningsWidgetProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  return (
    <div className={styles.setupWarningsWidget}>
      <div className={styles.header}>
        <h2 className={styles.title}>Setup warnings</h2>
        <span className={styles.subtitle}>{warnings.length} need attention</span>
      </div>

      <div className={styles.warningsList}>
        {warnings.map((warning) => (
          <Link
            key={warning.id}
            href={`/${locale}/settings/${warning.segment}`}
            className={styles.warningItem}
          >
            <SetupStatusIndicator
              status={warning.severity}
              label={warning.description}
            />
            <span className={styles.warningCopy}>
              <span className={styles.warningTitle}>{warning.title}</span>
              <span className={styles.warningDescription}>
                {warning.description}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
