"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SettingsInfoRow,
  SettingsInfoSection,
} from "@/presentation/components/settings/SettingsInfoSection";
import { listBillingAccounts } from "@/infrastructure/services/billing.service";
import styles from "./billing.module.css";

type BankAccount = {
  id: string;
  bankName: string;
  accountOwner: string;
  accountNumber: string;
  iban: string;
  swift: string;
};

export default function BillingSettingsPage() {
  const pathname = usePathname();
  const billingAccountHref = `${pathname.replace(/\/$/, "")}/account`;
  const [accounts, setAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    async function loadAccounts() {
      const rows = await listBillingAccounts();
      setAccounts(
        rows.map((account) => ({
          id: account.id,
          bankName: account.bankName,
          accountOwner: account.accountHolder,
          accountNumber: account.accountNumber,
          iban: account.iban,
          swift: account.swift,
        })),
      );
    }

    void loadAccounts();
  }, []);

  return (
    <div className={styles.content}>
      <div className={styles.section}>
        {accounts.map((account) => (
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
