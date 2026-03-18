"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ONBOARDING_STEPS,
  getStepByRoute,
  getNextStep,
  type OnboardingStep,
} from "@/infrastructure/services/onboarding.service";

export function useOnboardingSteps() {
  const pathname = usePathname();
  const router = useRouter();

  const currentStep = getStepByRoute(pathname);
  const isGettingStarted = pathname.includes("/getting-started");

  const currentIndex = currentStep
    ? ONBOARDING_STEPS.indexOf(currentStep)
    : -1;
  const nextStep = currentStep ? getNextStep(currentStep.id) : null;
  const totalSteps = ONBOARDING_STEPS.length;

  const goToStep = (step: OnboardingStep) => {
    const locale = pathname.split("/")[1] ?? "en";
    router.push(`/${locale}${step.route}`);
  };

  const goToStart = () => {
    const locale = pathname.split("/")[1] ?? "en";
    router.push(`/${locale}/onboarding/getting-started`);
  };

  const goToNextStep = () => {
    if (!currentStep) return;
    const next = getNextStep(currentStep.id);
    if (next) {
      goToStep(next);
    } else {
      goToStart();
    }
  };

  const startOnboarding = () => {
    goToStep(ONBOARDING_STEPS[0]);
  };

  return {
    currentStep,
    currentIndex,
    nextStep,
    totalSteps,
    isGettingStarted,
    steps: ONBOARDING_STEPS,
    goToStep,
    goToStart,
    goToNextStep,
    startOnboarding,
  };
}
