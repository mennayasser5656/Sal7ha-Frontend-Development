import React from "react";
import { useRouter } from "next/navigation";
import styles from "./DashboardBar.module.css";
import DashboardItem from "../DashboardItem/DashboardItem";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { FiBook } from "react-icons/fi";
import { RiNotification3Line } from "react-icons/ri";
import { LuCalendar } from "react-icons/lu";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { FiArchive } from "react-icons/fi";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { IoRocketOutline } from "react-icons/io5";
import { MdOutlineFeedback } from "react-icons/md";

export default function DashboardBar() {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className={styles.dashboardBar}>
      <div className={styles.profile}>
        <div className={styles.profileContent}>
          <img
            className={styles.profileImg}
            src="/assets/profile_img.svg"
            alt=""
          />
          <div className={styles.profileDetails}>
            <h1 className={styles.profileName}>SG Repair Shop</h1>
            <h2 className={styles.profilePlan}>Free Plan</h2>
          </div>
        </div>
      </div>
      {/* Items */}
      <div className={styles.spaceBetween}>
        <div className={styles.items}>
          {/* Main Menu Items */}
          <div className={styles.sectionItems}>
            <h1>Main Menu</h1>
            <DashboardItem
              icon={<MdOutlineSpaceDashboard />}
              text="Dashboard"
              isSelected={false}
              onClick={() => handleNavigation("/en/dashboard")}
            />
            <DashboardItem
              icon={<FiBook />}
              text="Bookings"
              isSelected={true}
              onClick={() => handleNavigation("/en/bookings")}
            />
            <DashboardItem
              icon={<LuCalendar />}
              text="Calendar"
              isSelected={false}
              onClick={() => handleNavigation("/en/calendar")}
            />
          </div>
          <hr className={styles.dashedDivider} />
          {/* Tools Items */}
          <div className={styles.sectionItems}>
            <h1>Tools</h1>
            <DashboardItem
              icon={<FiArchive />}
              text="Storage"
              isSelected={false}
              onClick={() => handleNavigation("/en/storage")}
            />
            <DashboardItem
              icon={<RiNotification3Line />}
              text="Inbox"
              isSelected={false}
              onClick={() => handleNavigation("/en/inbox")}
            />
            <DashboardItem
              icon={<TbBrandGoogleAnalytics />}
              text="Analytics"
              isSelected={false}
              onClick={() => handleNavigation("/en/analytics")}
            />
          </div>
          <hr className={styles.dashedDivider} />
        </div>
        {/* End Items */}
        <div>
          <div className={styles.sectionItems}>
            <DashboardItem
              icon={<IoIosHelpCircleOutline />}
              text="Help Center"
              isSelected={false}
              onClick={() => handleNavigation("/en/help")}
            />
            <DashboardItem
              icon={<MdOutlineFeedback />}
              text="Feedback"
              isSelected={false}
              onClick={() => handleNavigation("/en/feedback")}
            />
            <DashboardItem
              icon={<IoSettingsOutline />}
              text="Settings"
              isSelected={false}
              onClick={() => handleNavigation("/en/settings")}
            />
          </div>
          {/* Premium Box */}
          <div className={styles.profile}>
            <div className={styles.profileContent}>
              <div className={styles.icon}>
                <IoRocketOutline />
              </div>
              <div className={styles.profileDetails}>
                <h1 className={styles.profileName}>Upgrade & Unlock</h1>
                <h2 className={styles.profilePlan}>All Features</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
