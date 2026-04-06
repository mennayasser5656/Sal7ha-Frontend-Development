"use client";

import styles from "./TagSelector.module.css";

interface TagSelectorProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function TagSelector({
  label,
  options,
  selected,
  onChange,
}: TagSelectorProps) {
  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div className={styles.container}>
      <span className={styles.label}>{label}</span>
      <div className={styles.tags}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`${styles.tag} ${selected.includes(option) ? styles.tagSelected : ""}`}
            onClick={() => toggle(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
