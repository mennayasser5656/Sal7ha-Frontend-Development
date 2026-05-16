import { useMemo, useState } from "react";
import type { PaymentSortKey } from "@/domain/entities/Payment";
import {
  filterPayments,
  getPaymentHistory,
  getPaymentSummary,
  getTotalPaymentPages,
  paginatePayments,
  PAYMENT_METHOD_FILTERS,
  sortPayments,
} from "@/infrastructure/services/payments.service";

export function usePayments() {
  const [payments] = useState(getPaymentHistory);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCards, setShowCards] = useState(true);
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<PaymentSortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const summary = useMemo(() => getPaymentSummary(payments), [payments]);

  const filteredPayments = useMemo(
    () =>
      filterPayments({
        payments,
        method: selectedMethod,
        query: searchQuery,
      }),
    [payments, searchQuery, selectedMethod],
  );

  const sortedPayments = useMemo(
    () =>
      sortPayments({
        payments: filteredPayments,
        sortKey,
        direction: sortDirection,
      }),
    [filteredPayments, sortDirection, sortKey],
  );

  const totalPages = useMemo(
    () => getTotalPaymentPages(sortedPayments.length, itemsPerPage),
    [itemsPerPage, sortedPayments.length],
  );

  const paginatedPayments = useMemo(
    () =>
      paginatePayments({
        payments: sortedPayments,
        page: currentPage,
        itemsPerPage,
      }),
    [currentPage, itemsPerPage, sortedPayments],
  );

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

  function handleSearchQueryChange(query: string) {
    setSearchQuery(query);
    setCurrentPage(1);
  }

  function clearSelectedPayments() {
    setSelectedPayments(new Set());
  }

  return {
    methodFilters: PAYMENT_METHOD_FILTERS,
    selectedMethod,
    setSelectedMethod: handleSelectMethod,
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
    sortedPayments,
    paginatedPayments,
    totalPages,
    setCurrentPage,
    handleSetPerPage,
    handleSort,
  };
}
