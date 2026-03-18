"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./ServiceTableRow.module.css";
import { IoIosArrowDown } from "react-icons/io";
import { HiDotsHorizontal } from "react-icons/hi";

interface Service {
  id: number;
  serviceType: string;
  serviceName: string;
  serviceIcon: string;
  carType: string;
  startDate: string;
  endDate: string;
  progress: string;
  percentage: string;
}

interface ServiceTableRowProps {
  service: Service;
  onDelete?: (serviceId: number) => void;
}

export default function ServiceTableRow({
  service,
  onDelete,
}: ServiceTableRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleMenu = (event: React.MouseEvent) => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      return;
    }

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    const menuHeight = 200;
    const menuWidth = 80;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top;
    if (spaceBelow >= menuHeight) {
      top = rect.bottom + 5;
    } else if (spaceAbove >= menuHeight) {
      top = rect.top - menuHeight - 5;
    } else {
      top = rect.bottom + 5;
    }

    let left = rect.right - menuWidth;
    if (left < 0) {
      left = rect.left;
    }

    setMenuPosition({ top, left });
    setIsMenuOpen(true);
  };

  const handleMenuAction = (action: string) => {
    console.log(`Action: ${action} for service ID: ${service.id}`);
    if (action === "Cancel" && onDelete) {
      onDelete(service.id);
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <tr>
        <td>
          <p>{service.serviceType}</p>
        </td>

        <td>
          <div className={styles.serviceName}>
            <img src={service.serviceIcon} alt="service" />
            <p>{service.serviceName}</p>
          </div>
        </td>

        <td>
          <p>{service.carType}</p>
        </td>

        <td>
          <p>{service.startDate}</p>
        </td>

        <td>
          <p>{service.endDate}</p>
        </td>

        <td>
          <div className={styles.progress}>
            <p>{service.progress}</p>
          </div>
        </td>

        <td>
          <p>{service.percentage}</p>
        </td>

        <td>
          <div className={styles.icons}>
            <div className={styles.icon}>
              <IoIosArrowDown />
            </div>
            <div className={styles.icon} onClick={toggleMenu}>
              <HiDotsHorizontal />
            </div>
          </div>
        </td>
      </tr>

      {/* Fixed Position Dropdown Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className={styles.dropdown}
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <button
            className={styles.dropdownItem}
            onClick={() => handleMenuAction("View")}
          >
            View Details
          </button>
          <button
            className={styles.dropdownItem}
            onClick={() => handleMenuAction("Change Service")}
          >
            Change Status
          </button>
          <button
            className={`${styles.dropdownItem} ${styles.danger}`}
            onClick={() => handleMenuAction("Cancel")}
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
