import type { AccountProfile } from "@/infrastructure/services/account.service";

export const ACCOUNT_PROFILE_UPDATED_EVENT = "account-profile-updated";

export function publishAccountProfileUpdated(profile: AccountProfile) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<AccountProfile>(ACCOUNT_PROFILE_UPDATED_EVENT, {
      detail: profile,
    }),
  );
}
