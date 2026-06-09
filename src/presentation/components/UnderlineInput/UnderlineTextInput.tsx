"use client";

import { useId } from "react";
import styles from "./UnderlineInput.module.css";
import { IoClose } from "react-icons/io5";

interface UnderlineTextInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  span?: number;
  error?: string;
}

export default function UnderlineTextInput({
  label,
  placeholder = "",
  value,
  onChange,
  type = "text",
  span,
  error,
}: UnderlineTextInputProps) {
  const errorId = useId();

  return (
    <div className={styles.wrapper} style={span ? { gridColumn: `span ${span}` } : undefined}>
      <span className={styles.label}>{label}</span>
      <div className={`${styles.inputRow} ${error ? styles.inputRowError : ""}`}>
        <input
          className={styles.input}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
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
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
