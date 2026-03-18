import styles from "./ColumnSelectionBar.module.css";

export interface ColumnOption {
  key: string;
  label: string;
  visible: boolean;
}

interface ColumnSelectionBarProps {
  columns: ColumnOption[];
  onToggle: (key: string) => void;
  onClose: () => void;
}

export default function ColumnSelectionBar({ columns, onToggle, onClose }: ColumnSelectionBarProps) {
  return (
    <div className={styles.bar}>
      {columns.map((col) => (
        <label key={col.key} className={styles.item}>
          <input
            className={styles.checkBox}
            type="checkbox"
            checked={col.visible}
            onChange={() => onToggle(col.key)}
          />
          <span>{col.label}</span>
        </label>
      ))}
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
    </div>
  );
}
