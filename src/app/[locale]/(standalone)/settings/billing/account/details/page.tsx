"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, X } from "lucide-react";
import {
  bankDetailsSchema,
  type BankDetailsData,
} from "@/domain/validation/schema";
import { validateStep } from "@/domain/validation/validation";
import { UnderlineTextInput } from "@/presentation/components/UnderlineInput";
import styles from "./details.module.css";

const STEPS = [
  "Billing Account",
  "Choose Bank",
  "Bank Details",
  "Review",
];

const FIELDS = [
  {
    key: "accountHolder",
    label: "Account Holder",
    placeholder: 'Ex: "John Doe"',
    type: "text",
  },
  {
    key: "accountNumber",
    label: "Account Number",
    placeholder: 'Ex: "608010167519"',
    type: "text",
  },
  {
    key: "iban",
    label: "IBAN",
    placeholder: "EG00 0000 0000 0000 0000 0000 000",
    type: "text",
  },
  {
    key: "swift",
    label: "SWIFT / BIC",
    placeholder: 'Ex: "CIBEEGCX"',
    type: "text",
  },
  {
    key: "branch",
    label: "Branch Name",
    placeholder: 'Ex: "New Cairo Branch"',
    type: "text",
  },
  {
    key: "billingEmail",
    label: "Billing Email",
    placeholder: 'Ex: "billing@company.com"',
    type: "email",
  },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];
type Errors = Partial<Record<string, string>>;

const EMPTY_DETAILS: Record<FieldKey, string> = {
  accountHolder: "",
  accountNumber: "",
  iban: "",
  swift: "",
  branch: "",
  billingEmail: "",
};

export default function BankDetailsPage() {
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params.locale;
  const bank = searchParams.get("bank") ?? "";
  const [details, setDetails] = useState<Record<FieldKey, string>>(EMPTY_DETAILS);
  const [errors, setErrors] = useState<Errors>({});

  const billingHref = `/${locale}/settings/billing`;
  const bankHref = `/${locale}/settings/billing/account/bank`;

  function buildReviewHref(validDetails: BankDetailsData) {
    const query = new URLSearchParams();
    query.set("bank", validDetails.bankName);
    query.set("accountHolder", validDetails.accountHolder);
    query.set("accountNumber", validDetails.accountNumber);
    query.set("iban", validDetails.iban);
    query.set("swift", validDetails.swift);
    query.set("branch", validDetails.branch);
    query.set("billingEmail", validDetails.billingEmail);

    return `/${locale}/settings/billing/account/review?${query.toString()}`;
  }

  function setField(key: FieldKey, value: string) {
    setDetails((currentDetails) => ({ ...currentDetails, [key]: value }));
    setErrors((currentErrors) => {
      if (!currentErrors[key]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[key];
      return nextErrors;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateStep(bankDetailsSchema, {
      bankName: bank,
      ...details,
    });

    if (!result.success) {
      setErrors(result.errors as Errors);
      return;
    }

    setErrors({});
    router.push(buildReviewHref(result.data));
  }

  return (
    <main className={styles.screen}>
      <Link
        href={bankHref}
        className={styles.backButton}
        aria-label="Back to bank selection"
      >
        <ArrowLeft aria-hidden="true" />
      </Link>

      <nav className={styles.progress} aria-label="Billing setup progress">
        <div className={styles.progressTrack} />
        {STEPS.map((step, index) => (
          <div
            key={step}
            className={`${styles.step} ${index === 2 ? styles.stepActive : ""}`}
          >
            <span className={styles.stepLabel}>{step}</span>
            <span className={styles.stepDot} aria-hidden="true" />
          </div>
        ))}
      </nav>

      <Link
        href={billingHref}
        className={styles.closeButton}
        aria-label="Close billing account setup"
      >
        <X aria-hidden="true" />
      </Link>

      <section className={styles.content}>
        <div className={styles.copy}>
          <h1>Bank details</h1>
          <p>
            Add the account information that will be used to verify payouts,
            invoices, and billing statements for this workspace.
          </p>
          <p>
            These details should match the legal bank account connected to your
            service business. We will review the information before activating
            the billing account.
          </p>
          {bank && (
            <p className={styles.selectedBank}>
              Selected bank: <strong>{bank}</strong>
            </p>
          )}
          {errors["bankName"] && (
            <p className={styles.bankError}>{errors["bankName"]}</p>
          )}
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {FIELDS.map((field) => (
            <UnderlineTextInput
              key={field.key}
              label={field.label}
              placeholder={field.placeholder}
              type={field.type}
              value={details[field.key]}
              onChange={(value) => setField(field.key, value)}
              error={errors[field.key]}
            />
          ))}

          <button type="submit" className={styles.primaryButton}>
            Review details
          </button>
        </form>
      </section>
    </main>
  );
}
