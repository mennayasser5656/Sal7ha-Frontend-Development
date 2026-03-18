import React from "react";
import styles from "./CustomButton.module.css";

const CustomButton = ({
  text = "LOGIN",
  type = "button",
  disabled = false,
  onClick,
}: {
  text?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${styles.buttonContainer} ${disabled ? styles.disabled : ""}`}
    >
      {text}
    </button>
  );
};

export default CustomButton;
