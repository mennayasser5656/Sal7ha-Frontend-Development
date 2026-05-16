import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
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

export default async function ReviewBankDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const submittedDetails = await searchParams;
  const billingHref = `/${locale}/settings/billing`;
  const detailsHref = `/${locale}/settings/billing/account/details`;

  function getValue(key: string) {
    const value = submittedDetails[key];
    if (Array.isArray(value)) {
      return value[0] ?? "";
    }
    return value ?? "";
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

          <Link href={billingHref} className={styles.primaryButton}>
            Submit for review
          </Link>
        </div>
      </section>
    </main>
  );
}
