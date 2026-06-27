import type {
  AccountProfile,
  PersonalIdReviewStatus,
} from "@/infrastructure/services/account.service";
import type { SetupWarning } from "@/infrastructure/services/dashboard.service";

export type SetupIndicator = {
  status: "warning" | "critical";
  label: string;
};

export function getPersonalIdSetupIndicator(
  status: PersonalIdReviewStatus,
): SetupIndicator | null {
  if (status === "pending") {
    return {
      status: "warning",
      label: "Personal ID card is awaiting review",
    };
  }

  if (status === "not_uploaded") {
    return {
      status: "critical",
      label: "Personal ID card is not uploaded",
    };
  }

  if (status === "rejected") {
    return {
      status: "critical",
      label: "Personal ID card needs to be replaced",
    };
  }

  return null;
}

export function getAccountSetupWarnings(
  profile: AccountProfile,
): SetupWarning[] {
  const reviewStatus =
    profile.personalIdReviewStatus ??
    (profile.personalIdFileName ? "pending" : "not_uploaded");
  const personalIdIndicator = getPersonalIdSetupIndicator(reviewStatus);
  const warnings: SetupWarning[] = [];

  if (!profile.birthDate) {
    warnings.push({
      id: "personal-birth-date",
      title: "Personal info",
      description: "Birth date is not set.",
      segment: "personal",
      severity: "warning",
    });
  }

  if (personalIdIndicator) {
    warnings.push({
      id: "personal-id-card",
      title: "Personal ID",
      description: `${personalIdIndicator.label}.`,
      segment: "personal",
      severity: personalIdIndicator.status,
    });
  }

  return warnings;
}

export function getPersonalSettingsSetupIndicator(
  profile: AccountProfile,
): SetupIndicator | null {
  const warnings = getAccountSetupWarnings(profile);
  const highestPriorityWarning =
    warnings.find((warning) => warning.severity === "critical") ?? warnings[0];

  return highestPriorityWarning
    ? {
        status: highestPriorityWarning.severity,
        label: highestPriorityWarning.description,
      }
    : null;
}
