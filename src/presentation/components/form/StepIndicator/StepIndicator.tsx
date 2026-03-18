import styles from "./StepIndicator.module.css";

interface StepIndicatorProps {
  currentIndex: number;
  totalSteps: number;
}

const StepIndicator = ({ currentIndex, totalSteps }: StepIndicatorProps) => {
  return (
    <div className={styles.wrapper}>
      <span className={styles.counter}>
        {currentIndex + 1} of {totalSteps}
      </span>
    </div>
  );
};

export default StepIndicator;
