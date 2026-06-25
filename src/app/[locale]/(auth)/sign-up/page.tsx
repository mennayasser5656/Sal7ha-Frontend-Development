"use client";

import React, { useState } from "react";
import styles from "../auth.module.css";
import ErrorAlert from "@/presentation/components/CustomAlert/ErrorAlert";
import { FaEnvelope, FaLock } from "react-icons/fa";
import InputWrapper from "@/presentation/components/InputWrapper/InputWrapper";
import { PasswordInput } from "@/presentation/components/PasswordInput/PasswordInput";
import CustomButton from "@/presentation/components/CustomButton/CustomButton";
import { PasswordChecklist, Validation } from "@/domain/validation/validation";
import { authSchema } from "@/domain/validation/schema";
import z from "zod";
import { useParams, useRouter } from "next/navigation";
import { useBusinessSignUp } from "@/application/context/business-signup.context";
import { DEMO_BUSINESS_ACCOUNT } from "@/application/config/demo-business-account";

export default function SignUpView() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const { setData } = useBusinessSignUp();
  // Form state
  const [email, setEmail] = useState(DEMO_BUSINESS_ACCOUNT.email);
  const [password, setPassword] = useState(DEMO_BUSINESS_ACCOUNT.password);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  const checkList = React.useMemo<PasswordChecklist>(
    () => Validation.passwordChecklist(password),
    [password],
  );

  type RequirementItem = { ok: boolean; text: string };
  const items: RequirementItem[] = [
    { ok: checkList.length12, text: "At least 12 Characters" },
    { ok: checkList.lower, text: "At least 1 Lower Case Letter" },
    { ok: checkList.upper, text: "At least 1 Upper Case Letter" },
    { ok: checkList.symbol, text: "At least 1 Symbol" },
    { ok: checkList.number, text: "At least 1 Number" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      authSchema.parse({ email, password, rememberMe });
      setData({ email, password });
      router.push(`/${params.locale}/onboarding/owner-information`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message ?? "Validation Error");
      } else {
        setError("Sign Up failed. Please try again.");
      }
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} noValidate onSubmit={handleSubmit}>
        <label className={styles.authFormLabel}>SIGN UP</label>
        <div className={styles.authFormContent}>
          {error && <ErrorAlert message={error} />}
          <InputWrapper
            placeholder="E-mail"
            icon={<FaEnvelope />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          {error && <ErrorAlert message={error} />}
          <PasswordInput
            placeholder="Password"
            icon={<FaLock />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
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
          <CustomButton type="submit" text="SIGN UP" />

          <span className={styles.switch}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                router.push("sign-in");
              }}
            >
              SIGN IN
            </a>
          </span>
        </div>
        <div className={styles.requirements}>
          {items.map((r) => (
            <div
              key={r.text}
              className={`${styles.requirement} ${
                r.ok ? styles.requirementOk : styles.requirementBad
              }`}
            >
              <div
                className={`${styles.circle} ${
                  r.ok ? styles.circleOk : styles.circleBad
                }`}
              />
              <span>{r.text}</span>
            </div>
          ))}
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
