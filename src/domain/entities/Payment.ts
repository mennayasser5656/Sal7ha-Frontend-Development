export type PaymentMethod = "VISA" | "Fawry" | "PayPal" | "Cash";

export type PaymentKind = "item" | "service" | "car";

export interface Payment {
  id: string;
  customer: string;
  item: string;
  method: PaymentMethod;
  date: string;
  amount: number;
  kind: PaymentKind;
}

export type PaymentSortKey =
  | "id"
  | "customer"
  | "item"
  | "method"
  | "date"
  | "amount";

export interface PaymentSummary {
  monthlyPayments: number;
  yearlyPayments: number;
  itemsSold: number;
  servicesDone: number;
}

export type PaymentExportFormat =
  | "excel"
  | "pdf"
  | "word"
  | "google-docs"
  | "dashboard";

export interface PaymentExportOption {
  label: string;
  format: PaymentExportFormat;
}

export type PaymentExportCategory = PaymentKind;

export interface PaymentExportCriteria {
  format: PaymentExportFormat;
  startDate: string;
  endDate: string;
  categories: PaymentExportCategory[];
  minPrice: string;
  maxPrice: string;
}
