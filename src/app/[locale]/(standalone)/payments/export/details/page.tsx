"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { IoIosArrowDown } from "react-icons/io";
import { useClickOutside } from "@/application/hooks/useClickOutside";
import type { PaymentExportCategory } from "@/domain/entities/Payment";
import {
  UnderlineDateInput,
  UnderlineDropdownInput,
  UnderlineTextInput,
} from "@/presentation/components/UnderlineInput";
import {
  PAYMENT_EXPORT_CATEGORY_OPTIONS,
  usePaymentExportFlow,
} from "@/application/hooks/usePaymentExportFlow";
import styles from "./details.module.css";

const STEPS = ["Export", "Details"];

const FORMAT_OPTIONS = [
  { value: "excel", label: "EXCEL" },
  { value: "pdf", label: "PDF" },
  { value: "word", label: "Word" },
  { value: "google-docs", label: "Google Docs" },
  { value: "dashboard", label: "Dashboard" },
];

function CategoryDropdown({
  value,
  onChange,
}: {
  value: PaymentExportCategory[];
  onChange: (categories: PaymentExportCategory[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, useCallback(() => setOpen(false), []));

  const allSelected = value.length === PAYMENT_EXPORT_CATEGORY_OPTIONS.length;
  const selectedLabels = PAYMENT_EXPORT_CATEGORY_OPTIONS.filter((option) =>
    value.includes(option.value),
  ).map((option) => option.label);
  const label = allSelected
    ? "All"
    : selectedLabels.length
    ? selectedLabels.join(", ")
    : "None";

  function toggleCategory(category: PaymentExportCategory) {
    if (value.includes(category)) {
      onChange(value.filter((current) => current !== category));
      return;
    }

    onChange([...value, category]);
  }

  return (
    <div className={styles.categoryDropdown} ref={ref}>
      <span className={styles.dropdownLabel}>Include</span>
      <button
        type="button"
        className={styles.categoryTrigger}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span>{label}</span>
        <IoIosArrowDown
          className={`${styles.categoryArrow} ${
            open ? styles.categoryArrowOpen : ""
          }`}
        />
      </button>

      {open && (
        <div className={styles.categoryMenu}>
          <button
            type="button"
            className={styles.categoryOption}
            onClick={() =>
              onChange(
                allSelected
                  ? []
                  : PAYMENT_EXPORT_CATEGORY_OPTIONS.map((option) => option.value),
              )
            }
          >
            <span>Select all</span>
            <span
              className={`${styles.checkBox} ${
                allSelected ? styles.checkBoxActive : ""
              }`}
            />
          </button>

          {PAYMENT_EXPORT_CATEGORY_OPTIONS.map((option) => {
            const selected = value.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                className={styles.categoryOption}
                onClick={() => toggleCategory(option.value)}
              >
                <span>{option.label}</span>
                <span
                  className={`${styles.checkBox} ${
                    selected ? styles.checkBoxActive : ""
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PaymentExportDetailsPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  const paymentsHref = `/${locale}/payments`;
  const exportHref = `/${locale}/payments/export`;
  const exportFlow = usePaymentExportFlow();

  return (
    <main className={styles.screen}>
      <Link
        href={exportHref}
        className={styles.backButton}
        aria-label="Back to export overview"
      >
        <ArrowLeft aria-hidden="true" />
      </Link>

      <nav className={styles.progress} aria-label="Payment export progress">
        <div className={styles.progressTrack} />
        {STEPS.map((step, index) => (
          <div
            key={step}
            className={`${styles.step} ${index === 1 ? styles.stepActive : ""}`}
          >
            <span className={styles.stepLabel}>{step}</span>
            <span className={styles.stepDot} aria-hidden="true" />
          </div>
        ))}
      </nav>

      <Link
        href={paymentsHref}
        className={styles.closeButton}
        aria-label="Close payment export"
      >
        <X aria-hidden="true" />
      </Link>

      <section className={styles.content}>
        <div className={styles.copy}>
          <h1>Export details</h1>
          <p>
            Choose the report format and the payment range you want to include.
            These filters shape the file before it is generated.
          </p>
          <p>
            Services and items are available now. Car data is included as a
            separate option so it can be connected when car-level payment data is
            added to the history.
          </p>
        </div>

        <form className={styles.form}>
          <div className={styles.formGrid}>
            <UnderlineDateInput
              label="Start Date"
              value={exportFlow.startDate}
              onChange={exportFlow.updateStartDate}
            />
            <UnderlineDateInput
              label="End Date"
              value={exportFlow.endDate}
              onChange={exportFlow.updateEndDate}
              dropdownAlign="right"
            />
            <UnderlineDropdownInput
              label="Format"
              placeholder="Choose format"
              options={FORMAT_OPTIONS}
              value={exportFlow.criteria.format}
              onChange={exportFlow.updateFormat}
              span={2}
            />
            <UnderlineTextInput
              label="Minimum Price"
              placeholder="0"
              type="number"
              value={exportFlow.criteria.minPrice}
              onChange={(value) => exportFlow.updateCriteria("minPrice", value)}
            />
            <UnderlineTextInput
              label="Maximum Price"
              placeholder="500"
              type="number"
              value={exportFlow.criteria.maxPrice}
              onChange={(value) => exportFlow.updateCriteria("maxPrice", value)}
            />
          </div>

          <CategoryDropdown
            value={exportFlow.criteria.categories}
            onChange={exportFlow.updateCategories}
          />

          <div className={styles.exportMeta}>
            <span>{exportFlow.exportPayments.length} matching payments</span>
            <span>${exportFlow.summary.monthlyPayments} total</span>
          </div>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={exportFlow.generateExport}
          >
            Generate export
          </button>
        </form>
      </section>
    </main>
  );
}
