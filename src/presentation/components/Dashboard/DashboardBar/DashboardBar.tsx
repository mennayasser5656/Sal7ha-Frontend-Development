import React from "react";
import { useRouter } from "next/navigation";
import styles from "./DashboardBar.module.css";
import DashboardItem from "../DashboardItem/DashboardItem";
import { FaBook } from "react-icons/fa";
import { FiCalendar } from "react-icons/fi";
import { FaCalendar } from "react-icons/fa";
import { SiGoogleanalytics } from "react-icons/si";
import { TbPremiumRights } from "react-icons/tb";

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

  const handleNavigation = (path: string) => {
    router.push(path);
  };

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
              isSelected={false}
              onClick={() => handleNavigation("/en/dashboard")}
            />
            <DashboardItem
              icon={<FiBook />}
              hoveredIcon={<FaBook />}
              text="Bookings"
              isSelected={true}
              onClick={() => handleNavigation("/en/bookings")}
            />
            <DashboardItem
              icon={<FiCalendar />}
              hoveredIcon={<FaCalendar />}
              text="Calendar"
              isSelected={false}
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
              isSelected={false}
              onClick={() => handleNavigation("/en/storage")}
            />
            <DashboardItem
              icon={<RiNotification3Line />}
              hoveredIcon={<RiNotification3Fill />}
              text="Inbox"
              isSelected={false}
              onClick={() => handleNavigation("/en/inbox")}
            />
            <DashboardItem
              icon={<TbBrandGoogleAnalytics />}
              hoveredIcon={<SiGoogleanalytics />}
              text="Analytics"
              isSelected={false}
              onClick={() => handleNavigation("/en/analytics")}
            />
          </div>
          <hr className={styles.dashedDivider} />
          {/* End Items */}
          <div className={styles.sectionItems}>
            <DashboardItem
              icon={<IoIosHelpCircleOutline />}
              hoveredIcon={<IoIosHelpCircle />}
              text="Help Center"
              isSelected={false}
              onClick={() => handleNavigation("/en/help")}
            />
            <DashboardItem
              icon={<MdOutlineFeedback />}
              hoveredIcon={<MdFeedback />}
              text="Feedback"
              isSelected={false}
              onClick={() => handleNavigation("/en/feedback")}
            />
            <DashboardItem
              icon={<IoSettingsOutline />}
              hoveredIcon={<IoSettings />}
              text="Settings"
              isSelected={false}
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
