"use client";

import { useState } from "react";
import { IoChevronDown, IoCheckmarkCircle } from "react-icons/io5";
import TagSelector from "../TagSelector/TagSelector";
import type { ConfigOption } from "@/domain/data/service-configs";
import styles from "./CategoryConfigCard.module.css";

export type PriceRange = { min: string; max: string };

interface ServiceEntry {
  id: string;
  label: string;
}

interface CategoryConfigCardProps {
  category: string;
  services: ServiceEntry[];
  configOptions: ConfigOption[];
  /** Category-level inventory selections: key → selected values */
  inventoryValues: Record<string, string[]>;
  onInventoryChange: (category: string, key: string, selected: string[]) => void;
  /** Per-service price ranges */
  prices: Record<string, PriceRange>;
  onPriceChange: (serviceId: string, price: PriceRange) => void;
}

export default function CategoryConfigCard({
  category,
  services,
  configOptions,
  inventoryValues,
  onInventoryChange,
  prices,
  onPriceChange,
}: CategoryConfigCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Progress: count configured tag groups + services with price set
  const inventoryDone = configOptions.filter(
    (opt) => (inventoryValues[opt.key]?.length ?? 0) > 0,
  ).length;
  const pricesDone = services.filter((s) => {
    const p = prices[s.id];
    return p && (p.min !== "" || p.max !== "");
  }).length;

  const totalSteps = configOptions.length + services.length;
  const doneSteps = inventoryDone + pricesDone;
  const isFullyConfigured = doneSteps === totalSteps;
  const hasAnyProgress = doneSteps > 0;

  return (
    <div className={`${styles.card} ${expanded ? styles.cardExpanded : ""}`}>
      {/* ── Collapsed header ── */}
      <button
        type="button"
        className={styles.header}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={styles.headerLeft}>
          <span className={styles.title}>{category}</span>
          <span className={styles.subtitle}>
            {services.length} service{services.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className={styles.headerRight}>
          {isFullyConfigured ? (
            <span className={styles.badgeComplete}>
              <IoCheckmarkCircle size={14} />
              Ready
            </span>
          ) : hasAnyProgress ? (
            <span className={styles.badgePartial}>
              {doneSteps}/{totalSteps}
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

      {/* ── Expanded body ── */}
      {expanded && (
        <div className={styles.body}>
          {/* ── Service pricing ── */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Service Pricing</span>
            <div className={styles.priceList}>
              {services.map((service) => {
                const price = prices[service.id] ?? { min: "", max: "" };
                return (
                  <div key={service.id} className={styles.priceRow}>
                    <span className={styles.serviceName}>{service.label}</span>
                    <div className={styles.priceInputs}>
                      <div className={styles.priceField}>
                        <span className={styles.priceCurrency}>$</span>
                        <input
                          type="number"
                          className={styles.priceInput}
                          placeholder="Min"
                          min={0}
                          value={price.min}
                          onChange={(e) =>
                            onPriceChange(service.id, { ...price, min: e.target.value })
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
                          value={price.max}
                          onChange={(e) =>
                            onPriceChange(service.id, { ...price, max: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Category inventory / what you offer ── */}
          {configOptions.length > 0 && (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>What You Offer</span>
              <div className={styles.tagGroups}>
                {configOptions.map((opt) => (
                  <TagSelector
                    key={opt.key}
                    label={opt.label}
                    options={opt.options}
                    selected={inventoryValues[opt.key] ?? []}
                    onChange={(selected) => onInventoryChange(category, opt.key, selected)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
