// ── Step definitions ──

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  route: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "owner-information",
    title: "Owner Information",
    description:
      "Please provide your personal details as the business owner. This helps us verify your identity and set up your account.",
    route: "/onboarding/owner-information",
  },
  {
    id: "business-information",
    title: "Business Information",
    description:
      "Tell us about your car service business — name, type, and registration details.",
    route: "/onboarding/business-information",
  },
  {
    id: "build-business",
    title: "Build Your Business",
    description:
      "Set up the services you offer, your working hours, and pricing to get your workshop ready.",
    route: "/onboarding/build-business",
  },
  {
    id: "bank-details",
    title: "Bank Details",
    description:
      "Add your bank account information so you can receive payments from your customers.",
    route: "/onboarding/bank-details",
  },
  {
    id: "two-factor-auth",
    title: "Two Factor Authentication",
    description:
      "Secure your account by enabling two-factor authentication for an extra layer of protection.",
    route: "/onboarding/two-factor-auth",
  },
];

// ── Step helpers ──

export function getStepByRoute(pathname: string): OnboardingStep | null {
  return (
    ONBOARDING_STEPS.find((step) => pathname.includes(step.route)) ?? null
  );
}

export function getStepIndex(stepId: string): number {
  return ONBOARDING_STEPS.findIndex((step) => step.id === stepId);
}

export function getNextStep(currentId: string): OnboardingStep | null {
  const idx = getStepIndex(currentId);
  return ONBOARDING_STEPS[idx + 1] ?? null;
}
