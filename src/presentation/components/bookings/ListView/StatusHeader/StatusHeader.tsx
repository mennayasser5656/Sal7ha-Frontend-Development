import React from "react";
import styles from "./StatusHeader.module.css";

export function InProgressStatus({ size }: { size: number }) {
  return (
    <div className={`${styles.status} ${styles.inProgress}`}>
      <div className={styles.bar}></div>
      <span>In Progress</span>
      <p>({size})</p>
    </div>
  );
}

export function PendingStatus({ size }: { size: number }) {
  return (
    <div className={`${styles.status} ${styles.pending}`}>
      <div className={styles.bar}></div>
      <span>PENDING</span>
      <p>({size})</p>
    </div>
  );
}

export function CanceledStatus({ size }: { size: number }) {
  return (
    <div className={`${styles.status} ${styles.canceled}`}>
      <div className={styles.bar}></div>
      <span>CANCELED</span>
      <p>({size})</p>
    </div>
  );
}

export function CompletedStatus({ size }: { size: number }) {
  return (
    <div className={`${styles.status} ${styles.completed}`}>
      <div className={styles.bar}></div>
      <span>COMPLETED</span>
      <p>({size})</p>
    </div>
  );
}
