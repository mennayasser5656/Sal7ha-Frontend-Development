"use client";

import React, { useState } from "react";
import styles from "./FormSelectField.module.css";

interface Option {
  value: string;
  label: string;
}

interface FormSelectFieldProps {
  label: string;
  placeholder?: string;
  span?: number;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const FormSelectField = ({
  label,
  placeholder = "",
  span = 6,
  name,
  value,
  onChange,
  options,
  required = false,
  error = "",
  disabled = false,
}: FormSelectFieldProps) => {
  const [focused, setFocused] = useState(false);
  const filled = (value ?? "").length > 0;

  const wrapperClass = [
    "floatField",
    filled ? "floatFieldFilled" : "",
    error ? "floatFieldError" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <div
        className={wrapperClass}
        onClick={(e) => {
          const select = (e.currentTarget as HTMLElement).querySelector("select");
          select?.focus();
        }}
      >
        <label className="floatFieldLabel">
          {label}
          {required && " *"}
        </label>
        <select
          className={styles.select}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          required={required}
        >
          <option value="" disabled hidden>
            {focused ? placeholder : ""}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="floatFieldError">{error}</p>}
    </div>
  );
};

export default FormSelectField;
