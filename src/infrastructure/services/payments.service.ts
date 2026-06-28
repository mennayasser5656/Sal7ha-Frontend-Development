import type {
  Payment,
  PaymentExportCategory,
  PaymentExportCriteria,
  PaymentExportFormat,
  PaymentMethod,
  PaymentSortKey,
  PaymentSummary,
} from "@/domain/entities/Payment";
import {
  apiClient,
  getStoredAuthSession,
  type PaginatedResponse,
} from "@/infrastructure/api/client";
import { isMockAuthSession } from "@/infrastructure/mock/mock-api";

export const PAYMENT_METHOD_FILTERS: PaymentMethod[] = [
  "VISA",
  "Fawry",
  "PayPal",
  "Cash",
];

export interface PaymentListQuery {
  method?: string | null;
  kind?: string | null;
  search?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  sortBy?: PaymentSortKey | null;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaymentExportJob {
  id: string;
  type: string;
  status: "queued" | "processing" | "completed" | "failed" | string;
  format: PaymentExportFormat | string;
  matchedCount: number;
  downloadUrl: string | null;
  errorMessage?: string | null;
  createdAt: string;
  completedAt?: string | null;
  expiresAt?: string | null;
}

function toApiDate(date: Date | string | null | undefined) {
  if (!date) return undefined;
  return date instanceof Date ? date.toISOString().slice(0, 10) : date;
}

export function listPayments(query: PaymentListQuery) {
  return apiClient<
    PaginatedResponse<Payment> & {
      summary: PaymentSummary;
    }
  >("/payments", {
    query: {
      method: query.method,
      kind: query.kind,
      search: query.search,
      startDate: toApiDate(query.startDate),
      endDate: toApiDate(query.endDate),
      sortBy: query.sortBy ?? undefined,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit,
    },
  });
}

export function getPaymentSummary(query: {
  startDate?: Date | string | null;
  endDate?: Date | string | null;
} = {}) {
  return apiClient<PaymentSummary>("/payments/summary", {
    query: {
      startDate: toApiDate(query.startDate),
      endDate: toApiDate(query.endDate),
    },
  });
}

export function refundPayment(paymentId: string, reason?: string) {
  return apiClient(`/payments/${paymentId}/refund`, {
    method: "POST",
    body: { reason },
  });
}

export function batchRefundPayments(ids: Iterable<string>, reason?: string) {
  return apiClient("/payments/batch/refund", {
    method: "POST",
    body: { ids: Array.from(ids), reason },
  });
}

export function createPaymentExportJob(criteria: PaymentExportCriteria) {
  return apiClient<PaymentExportJob>("/payments/export-jobs", {
    method: "POST",
    body: {
      format: criteria.format,
      startDate: criteria.startDate || null,
      endDate: criteria.endDate || null,
      categories: criteria.categories as PaymentExportCategory[],
      minPrice: criteria.minPrice ? Number(criteria.minPrice) : null,
      maxPrice: criteria.maxPrice ? Number(criteria.maxPrice) : null,
    },
  });
}

export function getPaymentExportJob(jobId: string) {
  return apiClient<PaymentExportJob>(`/payments/export-jobs/${jobId}`);
}

export async function downloadPaymentExport(job: PaymentExportJob) {
  if (isMockAuthSession(getStoredAuthSession())) {
    const response = await listPayments({ page: 1, limit: 1000 });
    const blob = new Blob(
      [
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            job,
            summary: response.summary,
            payments: response.data,
          },
          null,
          2,
        ),
      ],
      { type: "application/json;charset=utf-8" },
    );
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `${job.id}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
    return;
  }

  const { getAccessToken } = await import("@/infrastructure/api/client");
  const token = getAccessToken();
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.API_BASE_URL ??
    "http://localhost:3334";
  const response = await fetch(
    `${baseUrl}/payments/export-jobs/${job.id}/download`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );

  if (!response.ok) {
    throw new Error("Could not download export.");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = `${job.id}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
