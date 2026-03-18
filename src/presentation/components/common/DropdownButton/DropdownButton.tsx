"use client";

import React, { useRef, useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import styles from "./DropdownButton.module.css";

export interface DropdownOption {
  label: string;
  icon?: React.ReactNode;
  submenu?: DropdownOption[];
}

interface DropdownButtonProps {
  options: DropdownOption[];
  selected: DropdownOption;
  onSelect: (option: DropdownOption) => void;
  fixedLabel?: string;
  fixedIcon?: React.ReactNode;
}

export default function DropdownButton({
  options,
  selected,
  onSelect,
  fixedLabel,
  fixedIcon,
}: DropdownButtonProps) {
  const [open, setOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const isFiltered =
    fixedLabel !== undefined && selected.label !== options[0]?.label;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setHoveredItem(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerIcon = fixedIcon ?? selected.icon;
  const triggerLabel = fixedLabel ?? selected.label;

  return (
    <div className={styles.wrapper} ref={ref}>
      <div
        className={`${styles.trigger} ${isFiltered ? styles.triggerActive : ""}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        {triggerIcon && <span className={styles.icon}>{triggerIcon}</span>}
        <span>{triggerLabel}</span>
        <IoIosArrowDown
          className={`${styles.arrow} ${open ? styles.arrowOpen : ""}`}
        />
      </div>

      {open && (
        <div className={styles.dropdown}>
          {options.map((option) => (
            <div
              key={option.label}
              className={styles.itemWrapper}
              onMouseEnter={() => setHoveredItem(option.label)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div
                className={`${styles.item} ${
                  selected.label === option.label ||
                  option.submenu?.some((s) => s.label === selected.label)
                    ? styles.itemActive
                    : ""
                }`}
                onClick={() => {
                  if (!option.submenu) {
                    onSelect(option);
                    setOpen(false);
                  }
                }}
              >
                {option.icon && (
                  <span className={styles.icon}>{option.icon}</span>
                )}
                <span>{option.label}</span>
                {option.submenu && (
                  <IoIosArrowForward className={styles.submenuArrow} />
                )}
              </div>

              {option.submenu && hoveredItem === option.label && (
                <div className={styles.submenu}>
                  {option.submenu.map((sub) => (
                    <div
                      key={sub.label}
                      className={`${styles.item} ${
                        selected.label === sub.label ? styles.itemActive : ""
                      }`}
                      onClick={() => {
                        onSelect(sub);
                        setOpen(false);
                      }}
                    >
                      {sub.icon && (
                        <span className={styles.icon}>{sub.icon}</span>
                      )}
                      <span>{sub.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
