import React from "react";
import styles from "./status.module.css";
import { RiProgress3Line } from "react-icons/ri";
import { IoIosWarning } from "react-icons/io";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";



export function InProgressComponent() {
  return (
    <div className={`${styles.status} ${styles.inProgress}`}>
      <RiProgress3Line />
      <span>In Progress</span>
    </div>
  );
}

export function PendingComponent() {
  return (
    <div className={`${styles.status} ${styles.pending}`}>
      <IoIosWarning />
      <span>Pending</span>
    </div>
  );
}

export function CanceledComponent() {
  return (
    <div className={`${styles.status} ${styles.canceled}`}>
      <MdOutlineCancel  />
      <span>Canceled</span>
    </div>
  );
}

export function CompletedComponent() {
  return (
    <div className={`${styles.status} ${styles.completed}`}>
      <IoCheckmarkCircleOutline  />
      <span>Completed</span>
    </div>
  );
}
