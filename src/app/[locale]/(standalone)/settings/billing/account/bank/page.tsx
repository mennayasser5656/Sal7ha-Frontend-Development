 "use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import styles from "./bank.module.css";

const STEPS = [
  "Billing Account",
  "Choose Bank",
  "Bank Details",
  "Review",
];

const BANKS = [
  {
    name: "ADIB",
    image: "/banks_images/ADIB.png",
    supportsBulkPayment: true,
  },
  {
    name: "Alex Bank",
    image: "/banks_images/alex bank.png",
    supportsBulkPayment: true,
  },
  {
    name: "Bank Misr",
    image: "/banks_images/Bank Misr PNG.png",
    supportsBulkPayment: true,
  },
  {
    name: "Banque du Caire",
    image: "/banks_images/banque du caire.png",
    supportsBulkPayment: true,
  },
  {
    name: "CIB Bank",
    image: "/banks_images/CIB Bank.png",
    supportsBulkPayment: true,
  },
  {
    name: "HSBC Bank",
    image: "/banks_images/HSBC Bank.png",
    supportsBulkPayment: true,
  },
  {
    name: "Mashreq Bank",
    image: "/banks_images/Mashreq bank.png",
    supportsBulkPayment: true,
  },
  {
    name: "National Bank of Egypt",
    image: "/banks_images/National Bank Of Egypt.png",
    supportsBulkPayment: true,
  },
  {
    name: "NBD Bank",
    image: "/banks_images/NBD Bank.png",
    supportsBulkPayment: true,
  },
  {
    name: "NBK",
    image: "/banks_images/NBK.png",
    supportsBulkPayment: true,
  },
  {
    name: "QNB",
    image: "/banks_images/QNB.png",
    supportsBulkPayment: true,
  },
  {
    name: "Suez Canal Bank",
    image: "/banks_images/Suez Canal Bank.png",
    supportsBulkPayment: true,
  },
];

export default function BillingBankPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  const [selectedBank, setSelectedBank] = useState("");
  const billingHref = `/${locale}/settings/billing`;
  const detailsHref = useMemo(() => {
    const query = selectedBank
      ? `?bank=${encodeURIComponent(selectedBank)}`
      : "";
    return `/${locale}/settings/billing/account/details${query}`;
  }, [locale, selectedBank]);

  return (
    <main className={styles.screen}>
      <nav className={styles.progress} aria-label="Billing setup progress">
        <div className={styles.progressTrack} />
        {STEPS.map((step, index) => (
          <div
            key={step}
            className={`${styles.step} ${index === 1 ? styles.stepActive : ""}`}
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
        <h1>Which bank are you sending the wire from?</h1>

        <form className={styles.bankGrid}>
          {BANKS.map((bank) => (
            <label key={bank.name} className={styles.bankOption}>
              <span className={styles.bankIdentity}>
                <span className={styles.logoFrame}>
                  <Image
                    src={bank.image}
                    alt=""
                    width={42}
                    height={42}
                    className={styles.bankLogo}
                  />
                </span>
                <span className={styles.bankText}>
                  <span className={styles.bankName}>{bank.name}</span>
                  {bank.supportsBulkPayment && (
                    <span className={styles.bankMeta}>
                      Supports bulk payment
                    </span>
                  )}
                </span>
              </span>
              <span className={styles.radioControl}>
                <input
                  className={styles.radioInput}
                  type="radio"
                  name="billing-bank"
                  value={bank.name}
                  aria-label={bank.name}
                  checked={selectedBank === bank.name}
                  onChange={() => setSelectedBank(bank.name)}
                />
                <span className={styles.radioVisual} aria-hidden="true">
                  <span className={styles.radioDot} />
                </span>
              </span>
            </label>
          ))}
        </form>

        <div className={styles.actions}>
          <Link
            href={detailsHref}
            className={`${styles.primaryButton} ${
              selectedBank ? "" : styles.primaryButtonDisabled
            }`}
            aria-disabled={!selectedBank}
          >
            Continue
          </Link>
        </div>
      </section>
    </main>
  );
}
