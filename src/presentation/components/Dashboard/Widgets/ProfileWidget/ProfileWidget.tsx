"use client";

import styles from "./ProfileWidget.module.css";
import { IoIosCheckmarkCircle } from "react-icons/io";

export default function ProfileWidget() {
  return (
    <div className={styles.profileCard}>
      <img
        className={styles.profileImg}
        src="/assets/profile_img.svg"
        alt="Shop profile"
      />
      <span className={styles.profileName}>SG Repair Shop</span>
      <div className={styles.profileStatus}>
        <IoIosCheckmarkCircle />
        <span>Up to date</span>
      </div>
    </div>
  );
}
