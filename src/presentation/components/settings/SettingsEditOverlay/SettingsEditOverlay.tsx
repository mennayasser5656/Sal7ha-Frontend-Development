"use client";

import { useState, type FormEvent } from "react";
import {
  UnderlineDateInput,
  UnderlineDropdownInput,
  UnderlineTextInput,
} from "@/presentation/components/UnderlineInput";
import {
  formatDatePadded,
  parseDateStrict,
} from "@/infrastructure/services/date.service";
import styles from "./SettingsEditOverlay.module.css";

type DropdownOption = { value: string; label: string };

export type SettingsEditField<TKey extends string = string> = {
  key: TKey;
  label: string;
  placeholder?: string;
  type?: "text" | "date" | "dropdown" | "multiDropdown";
  options?:
    | DropdownOption[]
    | ((draft: Partial<Record<TKey, string>>) => DropdownOption[]);
  clearsFields?: TKey[];
};

export function SettingsEditOverlay<TKey extends string>({
  title,
  fields,
  values,
  onClose,
  onSave,
}: {
  title: string;
  fields: SettingsEditField<TKey>[];
  values: Record<TKey, string>;
  onClose: () => void;
  onSave: (values: Partial<Record<TKey, string>>) => void;
}) {
  const [draft, setDraft] = useState<Partial<Record<TKey, string>>>(() =>
    fields.reduce<Partial<Record<TKey, string>>>((nextDraft, field) => {
      nextDraft[field.key] = values[field.key];
      return nextDraft;
    }, {}),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(draft);
    onClose();
  }

  return (
    <section className={styles.overlay} aria-label={`Edit ${title}`}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close settings editor"
        onClick={onClose}
      />
      <div className={styles.panelWrapper}>
        <form className={styles.panel} onSubmit={handleSubmit}>
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
          </div>

          <div className={styles.fields}>
            {fields.map((field) => {
              const value = draft[field.key] ?? "";

              if (field.type === "date") {
                return (
                  <UnderlineDateInput
                    key={field.key}
                    label={field.label}
                    value={value ? parseDateStrict(value) : null}
                    placeholder={field.placeholder}
                    onChange={(date) =>
                      setDraft((currentDraft) => ({
                        ...currentDraft,
                        [field.key]: date ? formatDatePadded(date) : "",
                      }))
                    }
                  />
                );
              }

              if (field.type === "dropdown") {
                const dropdownOptions =
                  typeof field.options === "function"
                    ? field.options(draft)
                    : field.options ?? [];

                return (
                  <UnderlineDropdownInput
                    key={field.key}
                    label={field.label}
                    value={value}
                    placeholder={field.placeholder}
                    options={dropdownOptions}
                    onChange={(nextValue) =>
                      setDraft((currentDraft) => {
                        const nextDraft: Partial<Record<TKey, string>> = {
                          ...currentDraft,
                          [field.key]: nextValue,
                        };
                        field.clearsFields?.forEach((dependentKey) => {
                          nextDraft[dependentKey] = "";
                        });
                        return nextDraft;
                      })
                    }
                  />
                );
              }

              if (field.type === "multiDropdown") {
                const dropdownOptions =
                  typeof field.options === "function"
                    ? field.options(draft)
                    : field.options ?? [];
                const selectedValues = value
                  .split(",")
                  .map((selectedValue) => selectedValue.trim())
                  .filter(Boolean);

                return (
                  <div key={field.key} className={styles.multiField}>
                    <span className={styles.multiLabel}>{field.label}</span>
                    <div className={styles.multiOptions}>
                      {dropdownOptions.length === 0 ? (
                        <span className={styles.multiEmpty}>
                          {field.placeholder ?? "Select another field first"}
                        </span>
                      ) : (
                        dropdownOptions.map((option) => {
                          const selected = selectedValues.includes(option.value);

                          return (
                            <button
                              key={option.value}
                              type="button"
                              className={`${styles.multiOption} ${
                                selected ? styles.multiOptionSelected : ""
                              }`}
                              aria-pressed={selected}
                              onClick={() =>
                                setDraft((currentDraft) => {
                                  const currentValue = currentDraft[field.key] ?? "";
                                  const currentValues = currentValue
                                    .split(",")
                                    .map((selectedValue) => selectedValue.trim())
                                    .filter(Boolean);
                                  const nextValues = currentValues.includes(option.value)
                                    ? currentValues.filter(
                                        (selectedValue) =>
                                          selectedValue !== option.value,
                                      )
                                    : [...currentValues, option.value];

                                  return {
                                    ...currentDraft,
                                    [field.key]: nextValues.join(", "),
                                  };
                                })
                              }
                            >
                              {option.label}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <UnderlineTextInput
                  key={field.key}
                  label={field.label}
                  value={value}
                  placeholder={field.placeholder}
                  onChange={(nextValue) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      [field.key]: nextValue,
                    }))
                  }
                />
              );
            })}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
