// src/components/LanguageSwitcher/LanguageSwitcher.tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";
import styles from "./LanguageSwitcher.module.css";

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = pathname.split("/")[1] || "en";

  const handleLocaleChange = (locale: string) => {
    const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, "");
    router.push(`/${locale}${pathWithoutLocale}`);
    setOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.trigger} onClick={() => setOpen((prev) => !prev)}>
        <img src="/assets/language-svgrepo-com.svg" alt="" />
        <span>{currentLocale.toUpperCase()}</span>
        <img
          src="/assets/arrow-down.svg"
          alt=""
          className={open ? styles.rotate : ""}
        />
      </div>

      {open && (
        <div className={styles.dropdown}>
          {routing.locales.map((locale) => (
            <div
              key={locale}
              className={styles.option}
              onClick={() => handleLocaleChange(locale)}
            >
              {locale === "en" ? "English" : "العربية"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
