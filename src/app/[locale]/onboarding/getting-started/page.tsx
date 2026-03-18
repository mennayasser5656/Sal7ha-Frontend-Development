"use client";

import React from "react";
import styles from "./GettingStarted.module.css";
import layoutStyles from "../Onboarding.module.css";
import Task from "@/presentation/components/form/Task/Task";
import GetStartedButton from "@/presentation/components/form/GetStartedButton/GetStartedButton";
import { useOnboardingSteps } from "@/application/hooks/useOnboardingSteps";

const summaryCards = [
  { title: "Progress", value: "0%" },
  { title: "Pending", value: "5 Tasks" },
  { title: "Completed", value: "0 Tasks" },
];

export default function GettingStartedView() {
  const { steps, startOnboarding } = useOnboardingSteps();
  let delay = 0;
  const step = 150;

  return (
    <section className={styles.screen}>
      <h1
        className={layoutStyles.animated}
        style={{ animationDelay: `${(delay += step, delay)}ms` }}
      >
        Onboarding Tasks
      </h1>
      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className={`${styles.summaryCard} ${layoutStyles.animated}`}
            style={{ animationDelay: `${(delay += step, delay)}ms` }}
          >
            <h2>{card.title}</h2>
            <h3>{card.value}</h3>
          </div>
        ))}
      </div>
      <div className={styles.tasks}>
        {steps.map((t) => (
          <div
            key={t.id}
            className={layoutStyles.animated}
            style={{ animationDelay: `${(delay += step, delay)}ms` }}
          >
            <Task title={t.title} />
          </div>
        ))}
      </div>
      <div
        className={layoutStyles.animated}
        style={{ animationDelay: `${(delay += step, delay)}ms` }}
      >
        <GetStartedButton onClick={startOnboarding} />
      </div>
    </section>
  );
}
