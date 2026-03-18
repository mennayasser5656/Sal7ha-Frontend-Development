import React, { useState } from "react";
import styles from "./PasswordInput.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export const PasswordInput = ({
  placeholder,
  icon,
  value,
  onChange,
  required = false,
  error = "",
}: {
  placeholder: string;
  icon: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div
      className={`${styles.inputContainer} ${error ? styles.errorBorder : ""}`}
    >
      <span className={styles.endIcon}>{icon}</span>
      <input
        type={showPassword ? "text" : "password"}
        className={styles.inputField}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      <span className={styles.endIcon} onClick={togglePassword}>
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>
  );
};
