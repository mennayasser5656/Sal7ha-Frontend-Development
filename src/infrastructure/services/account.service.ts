import { apiClient } from "@/infrastructure/api/client";

export interface AccountProfile {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  phoneNumber?: string | null;
  address?: Record<string, unknown> | null;
  setupStatus?: "ok" | "warning";
}

export interface SecurityPreference {
  key: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface MfaSettings {
  enabled: boolean;
  method: "sms" | "authenticator" | null;
  phone?: string | null;
  verifiedAt?: string | null;
}

export function getAccountProfile() {
  return apiClient<AccountProfile>("/account/profile");
}

export function updateAccountProfile(payload: {
  firstName?: string;
  lastName?: string;
  birthDate?: string | null;
  phoneNumber?: string;
  address?: Record<string, unknown>;
}) {
  return apiClient<AccountProfile>("/account/profile", {
    method: "PATCH",
    body: payload,
  });
}

export function getAccountSecurity() {
  return apiClient<{
    preferences: SecurityPreference[];
    mfa: MfaSettings;
  }>("/account/security");
}

export function updateAccountSecurity(preferences: Record<string, boolean>) {
  return apiClient<{
    preferences: SecurityPreference[];
    mfa: MfaSettings;
  }>("/account/security", {
    method: "PATCH",
    body: { preferences },
  });
}

export function updateAccountMfa(payload: {
  enabled: boolean;
  method?: "sms" | "authenticator";
  phone?: string | null;
}) {
  return apiClient<MfaSettings>("/account/mfa", {
    method: "PUT",
    body: payload,
  });
}
