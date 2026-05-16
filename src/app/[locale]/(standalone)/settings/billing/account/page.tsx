import Link from "next/link";
import { X } from "lucide-react";
import styles from "./billing-account.module.css";

const STEPS = [
  "Billing Account",
  "Choose Bank",
  "Bank Details",
  "Review",
];

export default async function BillingAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const billingHref = `/${locale}/settings/billing`;
  const chooseBankHref = `/${locale}/settings/billing/account/bank`;

  return (
    <main className={styles.screen}>
      <nav className={styles.progress} aria-label="Billing setup progress">
        <div className={styles.progressTrack} />
        {STEPS.map((step, index) => (
          <div
            key={step}
            className={`${styles.step} ${index === 0 ? styles.stepActive : ""}`}
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
        <h1>Billing Account</h1>
        <p>
          Set up the account your workshop will use for invoices, settlement,
          and billing records. Because these details affect payouts and legal
          documents, changes happen through a guided setup.
        </p>

        <div className={styles.copyBlock}>
          <h2>Choose your billing account</h2>
          <p>
            Select the bank or billing profile you want connected to your
            workspace. We will verify the account before it becomes active for
            customer payments and monthly statements.
          </p>
        </div>

        <div className={styles.copyBlock}>
          <h2>Connect an existing account</h2>
          <p>
            If you already receive payments through an approved provider, you
            can connect it here and continue the setup from the next step.
          </p>
        </div>

        <Link href={chooseBankHref} className={styles.primaryButton}>
          Connect billing account
        </Link>
      </section>
    </main>
  );
}
