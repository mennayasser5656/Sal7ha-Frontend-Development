"use client";

import { useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { IoCheckmarkCircle } from "react-icons/io5";
import TagSelector from "../TagSelector/TagSelector";
import type { ConfigOption } from "@/domain/data/service-configs";
import styles from "./ServiceConfigCard.module.css";

export type PriceRange = { min: string; max: string };

interface ServiceConfigCardProps {
  serviceId: string;
  label: string;
  category: string;
  configOptions: ConfigOption[];
  /** Current selections: key → selected values */
  values: Record<string, string[]>;
  onChange: (serviceId: string, key: string, selected: string[]) => void;
  priceRange: PriceRange;
  onPriceChange: (serviceId: string, price: PriceRange) => void;
  onRemove: (serviceId: string) => void;
}

export default function ServiceConfigCard({
  serviceId,
  label,
  category,
  configOptions,
  values,
  onChange,
  priceRange,
  onPriceChange,
  onRemove,
}: ServiceConfigCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hasConfigOptions = configOptions.length > 0;
  const totalOptions = configOptions.length;
  const configuredCount = configOptions.filter(
    (opt) => (values[opt.key]?.length ?? 0) > 0,
  ).length;
  const hasPriceSet = priceRange.min !== "" || priceRange.max !== "";
  const isFullyConfigured =
    (!hasConfigOptions || configuredCount === totalOptions) && hasPriceSet;
  const hasAnyConfig = configuredCount > 0 || hasPriceSet;

  return (
    <div
      className={`${styles.card} ${expanded ? styles.cardExpanded : ""}`}
    >
      <button
        type="button"
        className={styles.header}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={styles.headerLeft}>
          <span className={styles.label}>{label}</span>
          <span className={styles.category}>{category}</span>
        </div>

        <div className={styles.headerRight}>
          {isFullyConfigured ? (
            <span className={styles.badgeComplete}>
              <IoCheckmarkCircle size={14} />
              Ready
            </span>
          ) : hasAnyConfig ? (
            <span className={styles.badgePartial}>
              {configuredCount + (hasPriceSet ? 1 : 0)}/{totalOptions + 1}
            </span>
          ) : (
            <span className={styles.badgeSetup}>Set up</span>
          )}
          <IoChevronDown
            size={16}
            className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}
          />
        </div>
      </button>

      {expanded && (
        <div className={styles.body}>
          {configOptions.map((opt) => (
            <TagSelector
              key={opt.key}
              label={opt.label}
              options={opt.options}
              selected={values[opt.key] ?? []}
              onChange={(selected) => onChange(serviceId, opt.key, selected)}
            />
          ))}

          <div className={styles.priceSection}>
            <span className={styles.priceLabel}>Price Range</span>
            <div className={styles.priceInputs}>
              <div className={styles.priceField}>
                <span className={styles.priceCurrency}>$</span>
                <input
                  type="number"
                  className={styles.priceInput}
                  placeholder="Min"
                  min={0}
                  value={priceRange.min}
                  onChange={(e) =>
                    onPriceChange(serviceId, { ...priceRange, min: e.target.value })
                  }
                />
              </div>
              <span className={styles.priceSeparator}>—</span>
              <div className={styles.priceField}>
                <span className={styles.priceCurrency}>$</span>
                <input
                  type="number"
                  className={styles.priceInput}
                  placeholder="Max"
                  min={0}
                  value={priceRange.max}
                  onChange={(e) =>
                    onPriceChange(serviceId, { ...priceRange, max: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => onRemove(serviceId)}
          >
            Remove service
          </button>
        </div>
      )}
    </div>
  );
}
