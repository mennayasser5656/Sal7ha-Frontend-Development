import ApplicationStats from "@/presentation/components/Reports/ApplicationStats/ApplicationStats";
import styles from "./Reports.module.css";

export default function AnalyticsView() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Growth</h1>
      <div className={styles.content}>
        <ApplicationStats />
      </div>
    </div>
  );
}
