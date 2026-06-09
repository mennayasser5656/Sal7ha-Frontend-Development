import styles from "./SetupStatusIndicator.module.css";

export type SetupStatus = "warning" | "critical";

const STATUS_LABELS: Record<SetupStatus, string> = {
  warning: "Recommended setup missing",
  critical: "Important setup missing",
};

export default function SetupStatusIndicator({
  status,
  label,
}: {
  status: SetupStatus;
  label?: string;
}) {
  return (
    <span
      className={`${styles.indicator} ${styles[status]}`}
      role="img"
      aria-label={label ?? STATUS_LABELS[status]}
      title={label ?? STATUS_LABELS[status]}
    >
      !
    </span>
  );
}
