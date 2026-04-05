"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./DashboardBar.module.css";
import DashboardItem from "../DashboardItem/DashboardItem";
import { FaBook } from "react-icons/fa";
import { FiCalendar } from "react-icons/fi";
import { FaCalendar } from "react-icons/fa";
import { TbPremiumRights } from "react-icons/tb";
import { IoTrophySharp } from "react-icons/io5";
import { IoTrophyOutline } from "react-icons/io5";
import { HiNewspaper } from "react-icons/hi2";
import { RiNewspaperLine } from "react-icons/ri";
import { FaReceipt } from "react-icons/fa";


import {
  MdOutlineSpaceDashboard,
  MdSpaceDashboard,
  MdBook,
  MdArchive,
  MdOutlineFeedback,
  MdFeedback,
} from "react-icons/md";
import { FiBook } from "react-icons/fi";
import { RiNotification3Line, RiNotification3Fill } from "react-icons/ri";
import { LuCalendar } from "react-icons/lu";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { IoSettingsOutline, IoSettings } from "react-icons/io5";
import { FiArchive } from "react-icons/fi";
import { FaArchive } from "react-icons/fa";

import { IoIosHelpCircleOutline, IoIosHelpCircle } from "react-icons/io";
import { IoRocketOutline } from "react-icons/io5";

export default function DashboardBar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string) => pathname.endsWith(path);

  return (
    <div className={styles.dashboardBar}>
      <div className={styles.profile}>
        <img
          className={styles.profileImg}
          src="/assets/profile_img.svg"
          alt=""
        />
        <h1>SG Repair Shop</h1>
      </div>
      {/* Items */}
      <div className={styles.spaceBetween}>
        <div className={styles.items}>
          <hr className={styles.dashedDivider} />
          {/* Main Menu Items */}
          <div className={styles.sectionItems}>
            <DashboardItem
              icon={<MdOutlineSpaceDashboard />}
              hoveredIcon={<MdSpaceDashboard />}
              text="Dashboard"
              isSelected={isActive("/dashboard")}
              onClick={() => handleNavigation("/en/dashboard")}
            />
            <DashboardItem
              icon={<FiBook />}
              hoveredIcon={<FaBook />}
              text="Bookings"
              isSelected={isActive("/bookings")}
              onClick={() => handleNavigation("/en/bookings")}
            />
            <DashboardItem
              icon={<FiCalendar />}
              hoveredIcon={<FaCalendar />}
              text="Calendar"
              isSelected={isActive("/calendar")}
              onClick={() => handleNavigation("/en/calendar")}
            />
          </div>
          <hr className={styles.dashedDivider} />
          {/* Tools Items */}
          <div className={styles.sectionItems}>
            <DashboardItem
              icon={<FiArchive />}
              hoveredIcon={<FaArchive />}
              text="Storage"
              isSelected={isActive("/storage")}
              onClick={() => handleNavigation("/en/storage")}
            />
            <DashboardItem
              icon={<RiNotification3Line />}
              hoveredIcon={<RiNotification3Fill />}
              text="Inbox"
              isSelected={isActive("/inbox")}
              onClick={() => handleNavigation("/en/inbox")}
            />
            <DashboardItem
              icon={<IoTrophyOutline />}
              hoveredIcon={<IoTrophySharp />}
              text="Reports"
              isSelected={isActive("/growth")}
              onClick={() => handleNavigation("/en/growth")}
            />
            <DashboardItem
              icon={<RiNewspaperLine />}
              hoveredIcon={<HiNewspaper />}
              text="Growth"
              isSelected={isActive("/reports")}
              onClick={() => handleNavigation("/en/reports")}
            />
            <DashboardItem
              icon={<FaReceipt />}
              hoveredIcon={<FaReceipt />}
              text="Payments"
              isSelected={isActive("/payments")}
              onClick={() => handleNavigation("payments")}
            />
          </div>
          <hr className={styles.dashedDivider} />
          {/* End Items */}
          <div className={styles.sectionItems}>
            <DashboardItem
              icon={<IoIosHelpCircleOutline />}
              hoveredIcon={<IoIosHelpCircle />}
              text="Help Center"
              isSelected={isActive("/helpCenter") || isActive("/help")}
              onClick={() => handleNavigation("/en/helpCenter")}
            />

            <DashboardItem
              icon={<MdOutlineFeedback />}
              hoveredIcon={<MdFeedback />}
              text="Feedback"
              isSelected={isActive("/feedback")}
              onClick={() => handleNavigation("/en/feedback")}
            />
            <DashboardItem
              icon={<IoSettingsOutline />}
              hoveredIcon={<IoSettings />}
              text="Settings"
              isSelected={isActive("/settings")}
              onClick={() => handleNavigation("/en/settings")}
            />
          </div>
        </div>
        <div>
          {/* Premium Box */}
          <div className={styles.premium}>
            <div className={styles.premiumBox}>
              <TbPremiumRights />
              <h1>Upgrade & Unlock</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
