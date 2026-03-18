import React from "react";
import styles from "./FormRow.module.css";

interface FormRowProps {
  title?: string;
  children: React.ReactNode;
}

const FormRow = ({ title, children }: FormRowProps) => {
  return (
    <div className={styles.row}>
      {title && <span className={styles.title}>{title}</span>}
      <div className={styles.fields}>{children}</div>
    </div>
  );
};

export default FormRow;
