// app/auth/layout.tsx
"use client";

import React from "react";
import styles from "./auth.module.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.authScreen}>
      <div className={styles.authHeroContainer}>
        <img src="/assets/Dark Themed Logo.svg" alt="Logo" />
        <div className="flex flex-col gap-4">
          <h2>
            Welcome To Sal7ha!
            <br />
            Your All In One Car <br />
            Service Platform
          </h2>
        </div>
      </div>
      {children}
    </div>
  );
}
