"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../auth.module.css";
import ErrorAlert from "@/presentation/components/CustomAlert/ErrorAlert";
import { FaEnvelope, FaLock } from "react-icons/fa";
import InputWrapper from "@/presentation/components/InputWrapper/InputWrapper";
import { PasswordInput } from "@/presentation/components/PasswordInput/PasswordInput";
import CustomButton from "@/presentation/components/CustomButton/CustomButton";
import { authSchema } from "@/domain/validation/schema";
import z from "zod";

export default function SignInView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    try {
      authSchema.parse({ email, password, rememberMe });
      console.log("Form is valid, proceed with sign-in");
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
      }
    }
  };

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
        <label className={styles.authFormLabel}>SIGN IN</label>
        <div className={styles.authFormContent}>
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
          <CustomButton type="submit" text="SIGN IN" />

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
