import { apiClient } from "@/infrastructure/api/client";

export interface BillingAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  iban: string;
  swift: string;
  branch?: string | null;
  billingEmail?: string | null;
  status?: string;
}

export interface SupportedBank {
  name: string;
  imageUrl?: string | null;
  supportsBulkPayment?: boolean;
}

export function listBillingAccounts() {
  return apiClient<BillingAccount[]>("/billing/accounts");
}

export function listSupportedBanks() {
  return apiClient<SupportedBank[]>("/billing/banks");
}

export function createBillingAccount(payload: Omit<BillingAccount, "id">) {
  return apiClient<BillingAccount>("/billing/accounts", {
    method: "POST",
    body: payload,
  });
}

export function updateBillingAccount(
  id: string,
  payload: Partial<Omit<BillingAccount, "id">>,
) {
  return apiClient<BillingAccount>(`/billing/accounts/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function submitBillingAccount(id: string) {
  return apiClient<BillingAccount>(`/billing/accounts/${id}/submit`, {
    method: "POST",
  });
}
