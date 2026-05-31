import type {
  Payment,
  PaymentExportCriteria,
  PaymentMethod,
  PaymentSortKey,
  PaymentSummary,
} from "@/domain/entities/Payment";

export const PAYMENT_METHOD_FILTERS: PaymentMethod[] = [
  "VISA",
  "Fawry",
  "PayPal",
  "Cash",
];

const MOCK_PAYMENTS: Payment[] = [
  {
    id: "PAY-8821",
    customer: "Ali Hassan",
    item: "Wheel alignment",
    method: "VISA",
    date: "Apr 24, 2026",
    amount: 65,
    kind: "service",
  },
  {
    id: "PAY-8828",
    customer: "Mariam Saleh",
    item: "Engine diagnostics",
    method: "Fawry",
    date: "Apr 23, 2026",
    amount: 120,
    kind: "service",
  },
  {
    id: "PAY-8819",
    customer: "Omar Faisal",
    item: "Body & Paint",
    method: "PayPal",
    date: "Apr 22, 2026",
    amount: 350,
    kind: "service",
  },
  {
    id: "PAY-8818",
    customer: "Lina Abdullah",
    item: "Battery replacement",
    method: "Cash",
    date: "Apr 21, 2026",
    amount: 85,
    kind: "item",
  },
  {
    id: "PAY-8817",
    customer: "Yusuf Malik",
    item: "Tire rotation",
    method: "VISA",
    date: "Apr 19, 2026",
    amount: 45,
    kind: "service",
  },
  {
    id: "PAY-8816",
    customer: "Sara Al-Zahra",
    item: "Oil change",
    method: "Fawry",
    date: "Apr 18, 2026",
    amount: 50,
    kind: "service",
  },
  {
    id: "PAY-8815",
    customer: "Hassan Mohamed",
    item: "Brake pads",
    method: "Cash",
    date: "Apr 17, 2026",
    amount: 95,
    kind: "item",
  },
  {
    id: "PAY-8814",
    customer: "Menna Yasser",
    item: "Engine diagnostics",
    method: "PayPal",
    date: "Apr 16, 2026",
    amount: 120,
    kind: "service",
  },
];

export function getPaymentHistory(): Payment[] {
  return [...MOCK_PAYMENTS];
}

export function getPaymentSummary(payments: Payment[]): PaymentSummary {
  const monthlyPayments = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  return {
    monthlyPayments,
    yearlyPayments: monthlyPayments * 12,
    itemsSold: payments.filter((payment) => payment.kind === "item").length,
    servicesDone: payments.filter((payment) => payment.kind === "service")
      .length,
  };
}

export function filterPayments({
  payments,
  method,
  query,
  rangeStart,
  rangeEnd,
}: {
  payments: Payment[];
  method: string | null;
  query: string;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
}): Payment[] {
  const normalizedQuery = query.trim().toLowerCase();

  return payments.filter((payment) => {
    if (method && payment.method !== method) {
      return false;
    }

    if (rangeStart && !isPaymentWithinDateRange(payment, rangeStart, rangeEnd)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return (
      payment.customer.toLowerCase().includes(normalizedQuery) ||
      payment.id.toLowerCase().includes(normalizedQuery) ||
      payment.item.toLowerCase().includes(normalizedQuery) ||
      payment.method.toLowerCase().includes(normalizedQuery)
    );
  });
}

function isPaymentWithinDateRange(
  payment: Payment,
  rangeStart: Date,
  rangeEnd: Date | null | undefined,
) {
  const paymentDate = parsePaymentDate(payment.date);
  if (!paymentDate) {
    return true;
  }

  const start = new Date(rangeStart);
  start.setHours(0, 0, 0, 0);

  const end = rangeEnd ? new Date(rangeEnd) : new Date(rangeStart);
  end.setHours(23, 59, 59, 999);

  return paymentDate >= start && paymentDate <= end;
}

export function sortPayments({
  payments,
  sortKey,
  direction,
}: {
  payments: Payment[];
  sortKey: PaymentSortKey | null;
  direction: "asc" | "desc";
}): Payment[] {
  if (!sortKey) {
    return payments;
  }

  const sorted = [...payments].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];

    if (typeof av === "number" && typeof bv === "number") {
      return av - bv;
    }

    return String(av).localeCompare(String(bv));
  });

  return direction === "asc" ? sorted : sorted.reverse();
}

export function getTotalPaymentPages(totalItems: number, itemsPerPage: number) {
  return Math.max(1, Math.ceil(totalItems / itemsPerPage));
}

export function paginatePayments({
  payments,
  page,
  itemsPerPage,
}: {
  payments: Payment[];
  page: number;
  itemsPerPage: number;
}): Payment[] {
  const start = (page - 1) * itemsPerPage;
  return payments.slice(start, start + itemsPerPage);
}

function parsePaymentDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isWithinDateRange(
  payment: Payment,
  startDate: string,
  endDate: string,
) {
  const paymentDate = parsePaymentDate(payment.date);
  if (!paymentDate) {
    return true;
  }

  if (startDate) {
    const start = new Date(startDate);
    if (!Number.isNaN(start.getTime()) && paymentDate < start) {
      return false;
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    if (!Number.isNaN(end.getTime()) && paymentDate > end) {
      return false;
    }
  }

  return true;
}

function isWithinPriceRange(payment: Payment, minPrice: string, maxPrice: string) {
  const min = Number(minPrice);
  const max = Number(maxPrice);

  if (minPrice && !Number.isNaN(min) && payment.amount < min) {
    return false;
  }

  if (maxPrice && !Number.isNaN(max) && payment.amount > max) {
    return false;
  }

  return true;
}

export function filterPaymentsForExport({
  payments,
  criteria,
}: {
  payments: Payment[];
  criteria: PaymentExportCriteria;
}): Payment[] {
  return payments.filter((payment) => {
    if (!criteria.categories.includes(payment.kind)) {
      return false;
    }

    return (
      isWithinDateRange(payment, criteria.startDate, criteria.endDate) &&
      isWithinPriceRange(payment, criteria.minPrice, criteria.maxPrice)
    );
  });
}
