"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SettingsInfoRow,
  SettingsInfoSection,
} from "@/presentation/components/settings/SettingsInfoSection";
import styles from "./billing.module.css";

type BankAccount = {
  id: string;
  bankName: string;
  accountOwner: string;
  accountNumber: string;
  iban: string;
  swift: string;
};

const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: "acc-1",
    bankName: "Al Rajhi Bank",
    accountOwner: "John Doe",
    accountNumber: "608010167519",
    iban: "SA03 8000 0000 6080 1016 7519",
    swift: "RJHISARIXXX",
  },
];

export default function BillingSettingsPage() {
  const pathname = usePathname();
  const billingAccountHref = `${pathname.replace(/\/$/, "")}/account`;

  return (
    <div className={styles.content}>
      <div className={styles.section}>
        {INITIAL_ACCOUNTS.map((account) => (
          <SettingsInfoSection
            key={account.id}
            title={account.bankName || "Bank Account"}
          >
            <SettingsInfoRow
              label="Account Holder"
              value={account.accountOwner}
            />
            <SettingsInfoRow
              label="Account Number"
              value={account.accountNumber}
            />
            <SettingsInfoRow label="IBAN" value={account.iban} />
            <SettingsInfoRow label="SWIFT / BIC" value={account.swift} />
          </SettingsInfoSection>
        ))}
      </div>

      <div className={styles.addButtonWrapper}>
        <Link href={billingAccountHref} className={styles.addButton}>
          Billing Account
        </Link>
      </div>
    </div>
  );
}
