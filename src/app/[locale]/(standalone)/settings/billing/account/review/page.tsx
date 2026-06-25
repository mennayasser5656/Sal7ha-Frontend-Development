"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import {
  createBillingAccount,
  submitBillingAccount,
} from "@/infrastructure/services/billing.service";
import styles from "./review.module.css";

const STEPS = [
  "Billing Account",
  "Choose Bank",
  "Bank Details",
  "Review",
];

const DETAILS = [
  { key: "bank", label: "Bank" },
  { key: "accountHolder", label: "Account Holder" },
  { key: "accountNumber", label: "Account Number" },
  { key: "iban", label: "IBAN" },
  { key: "swift", label: "SWIFT / BIC" },
  { key: "branch", label: "Branch" },
  { key: "billingEmail", label: "Billing Email" },
] as const;

export default function ReviewBankDetailsPage() {
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const locale = params.locale;
  const billingHref = `/${locale}/settings/billing`;
  const detailsHref = `/${locale}/settings/billing/account/details`;

  function getValue(key: string) {
    return searchParams.get(key) ?? "";
  }

  async function handleSubmit() {
    setError("");
    setIsSubmitting(true);

    try {
      const account = await createBillingAccount({
        bankName: getValue("bank"),
        accountHolder: getValue("accountHolder"),
        accountNumber: getValue("accountNumber"),
        iban: getValue("iban"),
        swift: getValue("swift"),
        branch: getValue("branch"),
        billingEmail: getValue("billingEmail"),
      });
      await submitBillingAccount(account.id);
      router.push(billingHref);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not submit billing account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.screen}>
      <Link
        href={detailsHref}
        className={styles.backButton}
        aria-label="Back to bank details"
      >
        <ArrowLeft aria-hidden="true" />
      </Link>

      <nav className={styles.progress} aria-label="Billing setup progress">
        <div className={styles.progressTrack} />
        {STEPS.map((step, index) => (
          <div
            key={step}
            className={`${styles.step} ${index === 3 ? styles.stepActive : ""}`}
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
          <h1>Review bank details</h1>
          <p>
            Confirm the bank account information before it is submitted for
            billing verification. These details will be used for payouts,
            invoice records, and settlement reconciliation.
          </p>
          <p>
            Once submitted, changes may require another verification step to
            keep billing records secure and compliant.
          </p>
        </div>

        <div className={styles.summary}>
          <div className={styles.detailGrid}>
            {DETAILS.map((detail) => (
              <div key={detail.key} className={styles.detailRow}>
                <span className={styles.detailLabel}>{detail.label}</span>
                <span className={styles.detailValue}>
                  {getValue(detail.key) || "Not provided"}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.totalRow}>
            <span>Verification Status</span>
            <strong>Ready to submit</strong>
          </div>

          {error && <p>{error}</p>}

          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit for review"}
          </button>
        </div>
      </section>
    </main>
  );
}
