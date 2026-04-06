"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./ServicePicker.module.css";
import { useClickOutside } from "@/application/hooks/useClickOutside";

export interface ServiceItem {
  id: string;
  label: string;
  category: string;
}

interface ServicePickerProps {
  label: string;
  placeholder?: string;
  services: ServiceItem[];
  selected: string[];
  onChange: (selected: string[]) => void;
  error?: string;
  /** When true, chips are not rendered (parent handles display) */
  hideChips?: boolean;
}

export default function ServicePicker({
  label,
  placeholder = "",
  services,
  selected,
  onChange,
  error = "",
  hideChips = false,
}: ServicePickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filled = selected.length > 0 || query.length > 0;

  useClickOutside(wrapperRef, useCallback(() => setOpen(false), []));

  const available = services.filter(
    (s) =>
      !selected.includes(s.id) &&
      s.label.toLowerCase().includes(query.toLowerCase()),
  );

  const grouped: Record<string, ServiceItem[]> = {};
  for (const s of available) {
    (grouped[s.category] ??= []).push(s);
  }

  const handleSelect = (id: string) => {
    onChange([...selected, id]);
    setQuery("");
  };

  const handleRemove = (id: string) => {
    onChange(selected.filter((s) => s !== id));
  };

  const selectedServices = selected
    .map((id) => services.find((s) => s.id === id)!)
    .filter(Boolean);

  const wrapperClass = [
    "floatField",
    filled ? "floatFieldFilled" : "",
    error ? "floatFieldError" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={wrapperRef} className={styles.container}>
      <div
        className={wrapperClass}
        style={{ cursor: "text" }}
        onClick={() => {
          wrapperRef.current?.querySelector("input")?.focus();
        }}
      >
        <label className="floatFieldLabel">{label}</label>
        <input
          className="floatFieldInput"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          placeholder={focused ? placeholder : ""}
        />
      </div>

      {open && Object.keys(grouped).length > 0 && (
        <div className={styles.dropdown}>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className={styles.group}>
              <span className={styles.categoryTitle}>{category}</span>
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.option}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {!hideChips && selectedServices.length > 0 && (
        <div className={styles.chips}>
          {selectedServices.map((s) => (
            <span key={s.id} className={styles.chip}>
              {s.label}
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => handleRemove(s.id)}
                aria-label={`Remove ${s.label}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {error && <p className="floatFieldError">{error}</p>}
    </div>
  );
}
