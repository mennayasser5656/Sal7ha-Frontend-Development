"use client";

import React, { useState } from "react";

interface FormTextFieldProps {
  label: string;
  placeholder?: string;
  span?: number;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

const FormTextField = ({
  label,
  placeholder = "",
  span = 6,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  error = "",
  disabled = false,
}: FormTextFieldProps) => {
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
    <div style={{ gridColumn: `span ${span}`, cursor: "text" }}>
      <div
        className={wrapperClass}
        onClick={(e) => {
          const input = (e.currentTarget as HTMLElement).querySelector("input");
          input?.focus();
        }}
      >
        <label className="floatFieldLabel">
          {label}
          {required && " *"}
        </label>
        <input
          className="floatFieldInput"
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused ? placeholder : ""}
          disabled={disabled}
          required={required}
        />
      </div>
      {error && <p className="floatFieldError">{error}</p>}
    </div>
  );
};

export default FormTextField;
