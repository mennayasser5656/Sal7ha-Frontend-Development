"use client";

import styles from "./Toast.module.css";
import { IoIosClose } from "react-icons/io";
import { Notification } from "@/application/hooks/useBookings";

interface ToastContainerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ notifications, onDismiss }: ToastContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div className={styles.container}>
      {notifications.map((n) => (
        <div key={n.id} className={`${styles.toast} ${styles[n.type]}`}>
          <span>{n.message}</span>
          <button className={styles.closeBtn} onClick={() => onDismiss(n.id)}>
            <IoIosClose />
          </button>
        </div>
      ))}
    </div>
  );
}
