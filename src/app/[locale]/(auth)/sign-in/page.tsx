"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../auth.module.css";
import ErrorAlert from "@/presentation/components/CustomAlert/ErrorAlert";
import { FaEnvelope, FaLock } from "react-icons/fa";
import InputWrapper from "@/presentation/components/InputWrapper/InputWrapper";
import { PasswordInput } from "@/presentation/components/PasswordInput/PasswordInput";
import CustomButton from "@/presentation/components/CustomButton/CustomButton";
import { authSchema } from "@/domain/validation/schema";
import z from "zod";
import { authApi } from "@/infrastructure/api/auth.api";
import { apiClient } from "@/infrastructure/api/client";
import { DEMO_BUSINESS_ACCOUNT } from "@/application/config/demo-business-account";

function isUnauthorized(error: unknown) {
  return (
    error instanceof Error &&
    "status" in error &&
    (error as Error & { status?: number }).status === 401
  );
}

function isDemoAccount(email: string, password: string) {
  return (
    email.trim().toLowerCase() === DEMO_BUSINESS_ACCOUNT.email &&
    password === DEMO_BUSINESS_ACCOUNT.password
  );
}

async function createDemoBusinessAccount() {
  await authApi.signUp({
    email: DEMO_BUSINESS_ACCOUNT.email,
    password: DEMO_BUSINESS_ACCOUNT.password,
    name: DEMO_BUSINESS_ACCOUNT.business.name,
    phoneNumber: DEMO_BUSINESS_ACCOUNT.business.phoneNumber,
    country: DEMO_BUSINESS_ACCOUNT.business.country,
    city: DEMO_BUSINESS_ACCOUNT.business.city,
    commercialRegistrationNumber: Number(
      DEMO_BUSINESS_ACCOUNT.business.commercialRegistrationNumber,
    ),
    taxIdentificationNumber: Number(
      DEMO_BUSINESS_ACCOUNT.business.taxIdentificationNumber,
    ),
    businessOwner: {
      firstName: DEMO_BUSINESS_ACCOUNT.owner.firstName,
      lastName: DEMO_BUSINESS_ACCOUNT.owner.lastName,
      email: DEMO_BUSINESS_ACCOUNT.email,
      phoneNumber: DEMO_BUSINESS_ACCOUNT.owner.phoneNumber,
      streetAddress: DEMO_BUSINESS_ACCOUNT.owner.streetAddress,
      country: DEMO_BUSINESS_ACCOUNT.owner.country,
      city: DEMO_BUSINESS_ACCOUNT.owner.city,
      state: DEMO_BUSINESS_ACCOUNT.owner.state,
      zipCode: DEMO_BUSINESS_ACCOUNT.owner.zipCode,
    },
  });

  await apiClient("/onboarding/business-information", {
    method: "POST",
    body: {
      businessName: DEMO_BUSINESS_ACCOUNT.business.name,
      businessType: DEMO_BUSINESS_ACCOUNT.business.businessType,
      employeeCount: DEMO_BUSINESS_ACCOUNT.business.employeeCount,
      location: {
        country: DEMO_BUSINESS_ACCOUNT.business.country,
        streetAddress: DEMO_BUSINESS_ACCOUNT.business.streetAddress,
        city: DEMO_BUSINESS_ACCOUNT.business.city,
        state: DEMO_BUSINESS_ACCOUNT.business.state,
        zipCode: DEMO_BUSINESS_ACCOUNT.business.zipCode,
      },
    },
  });
}

export default function SignInView() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const [email, setEmail] = useState(DEMO_BUSINESS_ACCOUNT.email);
  const [password, setPassword] = useState(DEMO_BUSINESS_ACCOUNT.password);
  const [rememberMe, setRememberMe] = useState(true);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setFormError("");

    try {
      authSchema.parse({ email, password, rememberMe });
      setIsSubmitting(true);
      await authApi.signIn({ email, password, rememberMe });
      router.push(`/${params.locale}/dashboard`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.issues.forEach((issue) => {
          const field = issue.path[0];
          if (field === "email") {
            setEmailError(issue.message);
          } else if (field === "password") {
            setPasswordError(issue.message);
          }
        });
      } else if (
        process.env.NODE_ENV === "development" &&
        isUnauthorized(err) &&
        isDemoAccount(email, password)
      ) {
        try {
          await createDemoBusinessAccount();
          router.push(`/${params.locale}/dashboard`);
        } catch (demoError) {
          setFormError(
            demoError instanceof Error
              ? demoError.message
              : "Could not create the demo account.",
          );
        }
      } else {
        setFormError(err instanceof Error ? err.message : "Sign in failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
        <label className={styles.authFormLabel}>SIGN IN</label>
        <div className={styles.authFormContent}>
          {formError && <ErrorAlert message={formError} />}
          <InputWrapper
            placeholder="E-mail"
            icon={<FaEnvelope />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          {emailError && <ErrorAlert message={emailError} />}

          <PasswordInput
            placeholder="Password"
            icon={<FaLock />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {passwordError && <ErrorAlert message={passwordError} />}

          <div className={styles.rememberMe}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me</span>
          </div>
        </div>
        <div className="flex flex-col w-full items-center gap-4">
          <CustomButton
            type="submit"
            text={isSubmitting ? "SIGNING IN..." : "SIGN IN"}
          />

          <span className={styles.switch}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                router.push("sign-up");
              }}
            >
              SIGN UP
            </a>
          </span>
        </div>
      </form>

      <ul className={styles.authContainerItems}>
        <li>
          <a href="#">Contact Us</a>
        </li>
        <li>
          <a href="#">Privacy</a>
        </li>
        <li>
          <a href="#">Terms</a>
        </li>
        <li>
          <a href="#">Legal</a>
        </li>
      </ul>
    </div>
  );
}
