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
import { FaReceipt } from "react-icons/fa";


import {
  MdOutlineSpaceDashboard,
  MdSpaceDashboard,
  MdBook,
  MdArchive,
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
  const locale = pathname.split("/")[1] || "en";

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const openStandalone = (path: string) => {
    window.open(path, "_blank", "noopener,noreferrer");
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
              isSelected={isActive("/overview") || isActive("/inventory")}
              onClick={() => handleNavigation("/en/overview")}
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
              text="Growth"
              isSelected={isActive("/reports")}
              onClick={() => handleNavigation("/en/reports")}
            />
            <DashboardItem
              icon={<FaReceipt />}
              hoveredIcon={<FaReceipt />}
              text="Payments"
              isSelected={isActive("/payments")}
              onClick={() => handleNavigation("/en/payments")}
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
              onClick={() => openStandalone(`/${locale}/helpCenter`)}
            />
            <DashboardItem
              icon={<IoSettingsOutline />}
              hoveredIcon={<IoSettings />}
              text="Settings"
              isSelected={pathname.includes("/settings")}
              onClick={() => handleNavigation("/en/settings/personal")}
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
