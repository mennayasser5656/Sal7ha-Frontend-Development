"use client";

import { useState } from "react";
import styles from "./UnderlineInput.module.css";
import { IoClose } from "react-icons/io5";

interface UnderlineTextInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  span?: number;
}

export default function UnderlineTextInput({
  label,
  placeholder = "",
  value,
  onChange,
  type = "text",
  span,
}: UnderlineTextInputProps) {
  return (
    <div className={styles.wrapper} style={span ? { gridColumn: `span ${span}` } : undefined}>
      <span className={styles.label}>{label}</span>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            className={styles.iconBtn}
            type="button"
            onClick={() => onChange("")}
          >
            <IoClose />
          </button>
        )}
      </div>
    </div>
  );
}
