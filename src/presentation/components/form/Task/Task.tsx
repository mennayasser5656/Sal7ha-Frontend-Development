import React from "react";
import styles from "./Task.module.css";
import { FaClock } from "react-icons/fa";

type TaskProps = {
  title: string;
};
export default function Task({ title }: TaskProps) {
  return (
    <div className={styles.task}>
      <div className={styles.left}>
        <FaClock />
        <h1>{title}</h1>
        <div className={styles.detailBox}>
          <span></span>
        </div>
      </div>
    </div>
  );
}
