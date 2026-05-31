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
