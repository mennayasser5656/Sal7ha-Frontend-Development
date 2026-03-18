"use client";

import React from "react";
import styles from "./ChoiceCard.module.css";

interface ChoiceCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

const ChoiceCard = ({
  title,
  description,
  icon,
  selected = false,
  onClick,
}: ChoiceCardProps) => {
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      onClick={onClick}
    >
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        {description && <span className={styles.description}>{description}</span>}
      </div>
      <div className={styles.icon}>{icon}</div>
    </button>
  );
};

export default ChoiceCard;
