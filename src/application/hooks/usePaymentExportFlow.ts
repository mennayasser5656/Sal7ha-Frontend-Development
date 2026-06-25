"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  PaymentExportCategory,
  PaymentExportCriteria,
  PaymentExportFormat,
  PaymentSummary,
} from "@/domain/entities/Payment";
import {
  createPaymentExportJob,
  downloadPaymentExport,
  getPaymentExportJob,
  listPayments,
  type PaymentExportJob,
} from "@/infrastructure/services/payments.service";

const DEFAULT_CRITERIA: PaymentExportCriteria = {
  format: "excel",
  startDate: "",
  endDate: "",
  categories: ["service", "car", "item"],
  minPrice: "",
  maxPrice: "",
};

const EMPTY_SUMMARY: PaymentSummary = {
  monthlyPayments: 0,
  yearlyPayments: 0,
  itemsSold: 0,
  servicesDone: 0,
};

export const PAYMENT_EXPORT_CATEGORY_OPTIONS: {
  value: PaymentExportCategory;
  label: string;
}[] = [
  { value: "service", label: "Services" },
  { value: "car", label: "Cars" },
  { value: "item", label: "Items" },
];

function toApiDate(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

async function waitForCompletedJob(job: PaymentExportJob) {
  let current = job;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (current.status === "completed" || current.status === "failed") {
      return current;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    current = await getPaymentExportJob(job.id);
  }

  return current;
}

export function usePaymentExportFlow() {
  const [criteria, setCriteria] =
    useState<PaymentExportCriteria>(DEFAULT_CRITERIA);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [matchingCount, setMatchingCount] = useState(0);
  const [summary, setSummary] = useState<PaymentSummary>(EMPTY_SUMMARY);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadPreview() {
      const response = await listPayments({
        startDate: criteria.startDate,
        endDate: criteria.endDate,
        page: 1,
        limit: 1,
      });

      if (!ignore) {
        setMatchingCount(response.pagination.total);
        setSummary(response.summary);
      }
    }

    void loadPreview();

    return () => {
      ignore = true;
    };
  }, [criteria.endDate, criteria.startDate]);

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
    updateCriteria("startDate", toApiDate(date));
  }

  function updateEndDate(date: Date | null) {
    setEndDate(date);
    updateCriteria("endDate", toApiDate(date));
  }

  const generateExport = useCallback(async () => {
    setIsGenerating(true);
    try {
      const queued = await createPaymentExportJob(criteria);
      const completed = await waitForCompletedJob(queued);

      if (completed.status === "completed") {
        await downloadPaymentExport(completed);
      }

      return completed;
    } finally {
      setIsGenerating(false);
    }
  }, [criteria]);

  return {
    criteria,
    startDate,
    endDate,
    updateCriteria,
    updateFormat,
    updateCategories,
    updateStartDate,
    updateEndDate,
    matchingCount,
    exportPayments: { length: matchingCount },
    summary,
    isGenerating,
    generateExport,
  };
}
