"use client";

import styles from "./ProfileWidget.module.css";
import { IoIosCheckmarkCircle } from "react-icons/io";

export default function ProfileWidget({
  name = "Repair Shop",
  imageUrl = "/assets/profile_img.svg",
  upToDate = true,
}: {
  name?: string;
  imageUrl?: string;
  upToDate?: boolean;
}) {
  return (
    <div className={styles.profileCard}>
      <img
        className={styles.profileImg}
        src={imageUrl}
        alt="Shop profile"
      />
      <span className={styles.profileName}>{name}</span>
      <div className={styles.profileStatus}>
        <IoIosCheckmarkCircle />
        <span>{upToDate ? "Up to date" : "Needs setup"}</span>
      </div>
    </div>
  );
}
