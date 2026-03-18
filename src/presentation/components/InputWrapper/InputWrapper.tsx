import React from "react";
import styles from "./InputWrapper.module.css";

const InputWrapper = ({
  placeholder,
  icon,
  value,
  onChange,
  type = "text",
  required = false,
  error = "",
}: {
  placeholder: string;
  icon: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  error?: string;
}) => {
  return (
    <div
      className={`${styles.inputContainer} ${error ? styles.errorBorder : ""}`}
    >
      <span className={styles.icon}>{icon}</span>
      <input
        type={type}
        className={styles.inputField}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
};

export default InputWrapper;
