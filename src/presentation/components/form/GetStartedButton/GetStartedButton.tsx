import styles from "./GetStartedButton.module.css";

export default function GetStartedButton({
  onClick,
  label = "Get Started",
}: {
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button className={styles.button} onClick={onClick}>
      {label}
    </button>
  );
}
