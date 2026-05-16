import { useCallback } from "react";
import type {
  Payment,
  PaymentExportFormat,
  PaymentSummary,
} from "@/domain/entities/Payment";
import {
  exportPaymentHistory,
  PAYMENT_EXPORT_OPTIONS,
} from "@/infrastructure/services/payment-export.service";

export function usePaymentExport() {
  const exportPayments = useCallback(
    (format: PaymentExportFormat, payments: Payment[], summary: PaymentSummary) => {
      exportPaymentHistory({ format, payments, summary });
    },
    [],
  );

  return {
    exportOptions: PAYMENT_EXPORT_OPTIONS,
    exportPayments,
  };
}
