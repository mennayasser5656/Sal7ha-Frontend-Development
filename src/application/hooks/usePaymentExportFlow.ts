"use client";

import { useMemo, useState } from "react";
import type {
  PaymentExportCategory,
  PaymentExportCriteria,
  PaymentExportFormat,
} from "@/domain/entities/Payment";
import {
  filterPaymentsForExport,
  getPaymentHistory,
  getPaymentSummary,
} from "@/infrastructure/services/payments.service";
import { exportPaymentHistory } from "@/infrastructure/services/payment-export.service";
import { formatDatePadded } from "@/infrastructure/services/date.service";

const DEFAULT_CRITERIA: PaymentExportCriteria = {
  format: "excel",
  startDate: "",
  endDate: "",
  categories: ["service", "car", "item"],
  minPrice: "",
  maxPrice: "",
};

export const PAYMENT_EXPORT_CATEGORY_OPTIONS: {
  value: PaymentExportCategory;
  label: string;
}[] = [
  { value: "service", label: "Services" },
  { value: "car", label: "Cars" },
  { value: "item", label: "Items" },
];

export function usePaymentExportFlow() {
  const [payments] = useState(getPaymentHistory);
  const [criteria, setCriteria] =
    useState<PaymentExportCriteria>(DEFAULT_CRITERIA);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const exportPayments = useMemo(
    () => filterPaymentsForExport({ payments, criteria }),
    [criteria, payments],
  );

  const summary = useMemo(
    () => getPaymentSummary(exportPayments),
    [exportPayments],
  );

  function updateCriteria<TKey extends keyof PaymentExportCriteria>(
    key: TKey,
    value: PaymentExportCriteria[TKey],
  ) {
    setCriteria((current) => ({ ...current, [key]: value }));
  }

  function updateFormat(format: string) {
    updateCriteria("format", format as PaymentExportFormat);
  }

  function updateCategories(categories: PaymentExportCategory[]) {
    updateCriteria("categories", categories);
  }

  function updateStartDate(date: Date | null) {
    setStartDate(date);
    updateCriteria("startDate", date ? formatDatePadded(date) : "");
  }

  function updateEndDate(date: Date | null) {
    setEndDate(date);
    updateCriteria("endDate", date ? formatDatePadded(date) : "");
  }

  function generateExport() {
    exportPaymentHistory({
      format: criteria.format,
      payments: exportPayments,
      summary,
    });
  }

  return {
    criteria,
    startDate,
    endDate,
    updateCriteria,
    updateFormat,
    updateCategories,
    updateStartDate,
    updateEndDate,
    exportPayments,
    summary,
    generateExport,
  };
}
