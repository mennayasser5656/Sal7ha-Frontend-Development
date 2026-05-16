import Link from "next/link";
import { X } from "lucide-react";
import styles from "./export.module.css";

const STEPS = ["Export", "Details"];

export default async function PaymentExportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const paymentsHref = `/${locale}/payments`;
  const detailsHref = `/${locale}/payments/export/details`;

  return (
    <main className={styles.screen}>
      <nav className={styles.progress} aria-label="Payment export progress">
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
        href={paymentsHref}
        className={styles.closeButton}
        aria-label="Close payment export"
      >
        <X aria-hidden="true" />
      </Link>

      <section className={styles.content}>
        <h1>Payments Export</h1>
        <p>
          Create a payments history export for reporting, bookkeeping, or
          dashboard tools. The next step lets you decide what date range,
          format, payment data, and price range should be included.
        </p>

        <div className={styles.copyBlock}>
          <h2>Choose only what matters</h2>
          <p>
            You can include services, cars, items, or keep the export narrow for
            a specific report. These controls are useful when preparing files
            for Excel, Word, Google Docs, PDF, or dashboard tools.
          </p>
        </div>

        <Link href={detailsHref} className={styles.primaryButton}>
          Configure export
        </Link>
      </section>
    </main>
  );
}
