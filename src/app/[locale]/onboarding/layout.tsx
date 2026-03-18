"use client";

import React from "react";
import styles from "./Onboarding.module.css";
import AnimatedText from "@/presentation/components/AnimatedText/AnimatedText";
import StepIndicator from "@/presentation/components/form/StepIndicator/StepIndicator";
import { useOnboardingSteps } from "@/application/hooks/useOnboardingSteps";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentStep, currentIndex, nextStep, totalSteps, isGettingStarted } =
    useOnboardingSteps();

  const title =
    isGettingStarted || !currentStep
      ? "Let's get you started"
      : currentStep.title;

  const description =
    isGettingStarted || !currentStep
      ? "Welcome to Sal7ha Car Service Platform! Here you check all pending onboarding tasks we would like you to complete before your first day. Please make sure you provide accurate information."
      : currentStep.description;

  const showStepIndicator = !isGettingStarted && currentStep;

  return (
    <section className={styles.screen}>
      <div className={styles.leftSide}>
        <div className={styles.logo}>
          <AnimatedText text="Sal7ha" as="h1" baseDelay={0} letterDelay={40} />
        </div>
        {showStepIndicator && (
          <div key={currentStep.id} className={styles.stepIndicator}>
            <StepIndicator
              currentIndex={currentIndex}
              totalSteps={totalSteps}
            />
          </div>
        )}
        <div className={styles.title}>
          <AnimatedText
            key={title}
            text={title}
            as="h1"
            baseDelay={300}
            letterDelay={30}
          />
          <AnimatedText
            key={description}
            text={description}
            as="p"
            baseDelay={600}
            letterDelay={8}
          />
        </div>
      </div>
      <div className={styles.rightSide}>{children}</div>
    </section>
  );
}
