"use client";

import { useEffect, useState } from "react";
import { useToastNotifications } from "@/application/hooks/useToastNotifications";
import { validateStep } from "@/domain/validation/validation";
import { twoFactorSchema } from "@/domain/validation/schema";
import { UnderlineTextInput } from "@/presentation/components/UnderlineInput";
import { SetupStatusIndicator } from "@/presentation/components/settings/SetupStatusIndicator";
import ToastContainer from "@/presentation/components/Toast/Toast";
import {
  getAccountSecurity,
  updateAccountMfa,
  updateAccountSecurity,
} from "@/infrastructure/services/account.service";
import styles from "./security.module.css";

type MfaMethod = "sms" | "authenticator";

type SecurityPreferenceKey =
  | "loginAlerts"
  | "newDeviceApproval"
  | "sessionTimeout"
  | "paymentExportConfirmation";

type SecurityPreferences = Record<SecurityPreferenceKey, boolean>;

type Errors = Partial<Record<string, string>>;

const SECURITY_PREFERENCES: {
  key: SecurityPreferenceKey;
  title: string;
  description: string;
}[] = [
  {
    key: "loginAlerts",
    title: "Login alerts",
    description: "Notify admins when someone signs in to the workspace.",
  },
  {
    key: "newDeviceApproval",
    title: "New device approval",
    description: "Require confirmation before a new device can stay trusted.",
  },
  {
    key: "sessionTimeout",
    title: "Idle session timeout",
    description: "Sign users out after a long period of inactivity.",
  },
  {
    key: "paymentExportConfirmation",
    title: "Export confirmation",
    description: "Ask for confirmation before sensitive payment exports.",
  },
];

const INITIAL_SECURITY: SecurityPreferences = {
  loginAlerts: true,
  newDeviceApproval: true,
  sessionTimeout: true,
  paymentExportConfirmation: false,
};

function formatMethod(method: MfaMethod) {
  return method === "sms" ? "SMS code" : "Authenticator app";
}

export default function SecuritySettingsPage() {
  const { notifications, dismissNotification, showNotification } =
    useToastNotifications();
  const [security, setSecurity] =
    useState<SecurityPreferences>(INITIAL_SECURITY);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaMethod, setMfaMethod] = useState<MfaMethod>("authenticator");
  const [phone, setPhone] = useState("");
  const [savedMfaMethod, setSavedMfaMethod] =
    useState<MfaMethod>("authenticator");
  const [savedPhone, setSavedPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    async function loadSecurity() {
      const response = await getAccountSecurity();
      setSecurity(
        response.preferences.reduce<SecurityPreferences>(
          (next, preference) => ({
            ...next,
            [preference.key as SecurityPreferenceKey]: preference.enabled,
          }),
          INITIAL_SECURITY,
        ),
      );
      setMfaEnabled(response.mfa.enabled);
      setMfaMethod(response.mfa.method ?? "authenticator");
      setSavedMfaMethod(response.mfa.method ?? "authenticator");
      setPhone(response.mfa.phone ?? "");
      setSavedPhone(response.mfa.phone ?? "");
    }

    void loadSecurity();
  }, []);

  async function toggleSecurityPreference(key: SecurityPreferenceKey) {
    const next = {
      ...security,
      [key]: !security[key],
    };
    setSecurity((current) => ({
      ...current,
      [key]: !current[key],
    }));
    await updateAccountSecurity(next);
    showNotification(
      "Security setting updated successfully.",
      "success",
      "securitySettingsUpdated",
    );
  }

  async function handleMfaToggle() {
    if (mfaEnabled) {
      await updateAccountMfa({ enabled: false });
      setMfaEnabled(false);
      setErrors({});
      showNotification("MFA disabled successfully.", "success", "mfaUpdated");
      return;
    }

    setMfaEnabled(true);
  }

  async function handleSaveMfa() {
    if (!mfaEnabled) {
      return;
    }

    const result = validateStep(twoFactorSchema, {
      method: mfaMethod,
      phone,
    });

    if (!result.success) {
      setErrors(result.errors as Errors);
      return;
    }

    setErrors({});
    const mfa = await updateAccountMfa({
      enabled: true,
      method: result.data.method,
      phone: result.data.phone ?? null,
    });
    setSavedMfaMethod(result.data.method);
    setSavedPhone(mfa.phone ?? result.data.phone ?? "");
    showNotification(
      "MFA settings saved successfully.",
      "success",
      "mfaUpdated",
    );
  }

  return (
    <div className={styles.content}>
      <ToastContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      <section className={styles.section}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Security Settings</h2>
            <p className={styles.description}>
              Manage sign-in protection and sensitive workflow safeguards.
            </p>
          </div>
        </div>

        <div className={styles.rows}>
          {SECURITY_PREFERENCES.map((preference) => {
            const enabled = security[preference.key];

            return (
              <div key={preference.key} className={styles.row}>
                <div className={styles.copy}>
                  <span className={styles.rowTitle}>{preference.title}</span>
                  <span className={styles.rowDescription}>
                    {preference.description}
                  </span>
                </div>
                <Toggle
                  enabled={enabled}
                  label={preference.title}
                  onClick={() => toggleSecurityPreference(preference.key)}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              Multi-Factor Authentication
              {!mfaEnabled && (
                <SetupStatusIndicator
                  status="warning"
                  label="Multi-factor authentication is not set"
                />
              )}
            </h2>
            <p className={styles.description}>
              Add another verification step for admin access.
            </p>
          </div>
          <Toggle enabled={mfaEnabled} label="MFA" onClick={handleMfaToggle} />
        </div>

        <div className={styles.mfaSummary}>
          <span>Status</span>
          <strong>{mfaEnabled ? "Enabled" : "Disabled"}</strong>
          <span>Method</span>
          <strong>{mfaEnabled ? formatMethod(savedMfaMethod) : "Not set"}</strong>
          <span>Recovery phone</span>
          <strong>{savedPhone || "Not set"}</strong>
        </div>

        {mfaEnabled && (
          <div className={styles.mfaPanel}>
            <div className={styles.methodGroup} role="radiogroup" aria-label="MFA method">
              <MethodButton
                selected={mfaMethod === "authenticator"}
                title="Authenticator app"
                description="Use a one-time code from your authenticator app."
                onClick={() => {
                  setMfaMethod("authenticator");
                  setErrors({});
                }}
              />
              <MethodButton
                selected={mfaMethod === "sms"}
                title="SMS code"
                description="Send a one-time code to a trusted phone number."
                onClick={() => setMfaMethod("sms")}
              />
            </div>

            {mfaMethod === "sms" && (
              <UnderlineTextInput
                label="Trusted Phone Number"
                placeholder='Ex: "+201001234567"'
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                  setErrors((current) => {
                    const next = { ...current };
                    delete next.phone;
                    return next;
                  });
                }}
                error={errors.phone}
              />
            )}

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleSaveMfa}
            >
              Done
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function Toggle({
  enabled,
  label,
  onClick,
}: {
  enabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.toggle} ${enabled ? styles.toggleOn : ""}`}
      onClick={onClick}
      aria-pressed={enabled}
      aria-label={`${enabled ? "Disable" : "Enable"} ${label}`}
    >
      <span className={styles.toggleKnob} />
    </button>
  );
}

function MethodButton({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.methodButton} ${
        selected ? styles.methodButtonActive : ""
      }`}
      onClick={onClick}
      role="radio"
      aria-checked={selected}
    >
      <span className={styles.methodTitle}>{title}</span>
      <span className={styles.methodDescription}>{description}</span>
    </button>
  );
}
