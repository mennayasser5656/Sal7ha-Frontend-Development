import React, { useState } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import styles from "./PhoneNumberInput.module.css";
import { FiPhone } from "react-icons/fi";

interface PhoneNumberInputProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  className,
  value,
  onChange,
}) => {
  const [phone, setPhone] = useState<string>(value ?? "");

  return (
    <div className={`${styles.phoneNumberInputContainer} ${className || ""}`}>
      <span>Phone Number</span>
      <div
        className={`${styles.inputContainer} ${styles.phoneInputContainer} ${
          phone.length === 0 ? "" : styles.focused
        }`}
      >
        <PhoneInput
          defaultCountry="eg"
          value={phone}
          onChange={(value) => {
            setPhone(value);
            onChange?.(value);
          }}
          className={styles.phoneInput}
          inputClassName={styles.inputField}
        />
      </div>
    </div>
  );
};

export default PhoneNumberInput;
