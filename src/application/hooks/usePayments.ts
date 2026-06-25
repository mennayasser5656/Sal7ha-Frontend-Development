import { useCallback, useEffect, useState } from "react";
import type { PaymentSortKey } from "@/domain/entities/Payment";
import {
  batchRefundPayments,
  listPayments,
  PAYMENT_METHOD_FILTERS,
} from "@/infrastructure/services/payments.service";
import { useToastNotifications } from "./useToastNotifications";
import type { Payment, PaymentSummary } from "@/domain/entities/Payment";

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    monthlyPayments: 0,
    yearlyPayments: 0,
    itemsSold: 0,
    servicesDone: 0,
  });
  const { showNotification } = useToastNotifications();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [dateRangeStart, setDateRangeStart] = useState<Date | null>(null);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCards, setShowCards] = useState(true);
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<PaymentSortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listPayments({
        method: selectedMethod,
        search: searchQuery,
        startDate: dateRangeStart,
        endDate: dateRangeEnd,
        sortBy: sortKey,
        sortOrder: sortDirection,
        page: currentPage,
        limit: itemsPerPage,
      });
      setPayments(response.data);
      setSummary(response.summary);
      setTotalPages(Math.max(1, response.pagination.pages));
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Could not load payments.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    dateRangeEnd,
    dateRangeStart,
    itemsPerPage,
    searchQuery,
    selectedMethod,
    showNotification,
    sortDirection,
    sortKey,
  ]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  function handleSort(key: PaymentSortKey) {
    if (sortKey === key) {
      setSortDirection((direction) =>
        direction === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  }

  function handleSetPerPage(value: number) {
    setItemsPerPage(value);
    setCurrentPage(1);
  }

  function handleSelectMethod(method: string | null) {
    setSelectedMethod(method);
    setCurrentPage(1);
  }

  function handleDateRangeChange(range: { start: Date; end: Date | null } | null) {
    setDateRangeStart(range?.start ?? null);
    setDateRangeEnd(range?.end ?? null);
    setCurrentPage(1);
  }

  function handleSearchQueryChange(query: string) {
    setSearchQuery(query);
    setCurrentPage(1);
  }

  function clearSelectedPayments() {
    setSelectedPayments(new Set());
  }

  async function refundSelectedPayments() {
    if (selectedPayments.size === 0) return;

    try {
      await batchRefundPayments(selectedPayments);
      clearSelectedPayments();
      showNotification("Payments refunded successfully.", "success");
      void loadPayments();
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Could not refund payments.",
        "error",
      );
    }
  }

  return {
    methodFilters: PAYMENT_METHOD_FILTERS,
    isLoading,
    selectedMethod,
    setSelectedMethod: handleSelectMethod,
    dateRangeStart,
    dateRangeEnd,
    setDateRange: handleDateRangeChange,
    searchQuery,
    setSearchQuery: handleSearchQueryChange,
    showCards,
    toggleCards: () => setShowCards((current) => !current),
    selectedPayments,
    setSelectedPayments,
    clearSelectedPayments,
    currentPage,
    itemsPerPage,
    sortKey,
    sortDirection,
    summary,
    sortedPayments: payments,
    paginatedPayments: payments,
    totalPages,
    setCurrentPage,
    handleSetPerPage,
    handleSort,
    refundSelectedPayments,
  };
}
