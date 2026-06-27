"use client";

import {
  NOTIFICATION_PREFERENCES,
  useNotificationPreferences,
} from "@/application/hooks/useNotificationPreferences";
import { SettingsInfoSection } from "@/presentation/components/settings/SettingsInfoSection";
import styles from "./notifications.module.css";

export default function NotificationsSettingsPage() {
  const { preferences, setPreference } = useNotificationPreferences();

  return (
    <div className={styles.content}>
      <SettingsInfoSection title="Toast Notifications">
        {NOTIFICATION_PREFERENCES.map((preference) => {
          const enabled = preferences[preference.key];

          return (
            <div key={preference.key} className={styles.row}>
              <span className={styles.rowTitle}>{preference.title}</span>
              <span className={styles.rowDescription}>
                {preference.description}
              </span>
              <button
                type="button"
                className={`${styles.toggle} ${
                  enabled ? styles.toggleOn : ""
                }`}
                onClick={() => setPreference(preference.key, !enabled)}
                aria-pressed={enabled}
                aria-label={`${enabled ? "Disable" : "Enable"} ${
                  preference.title
                } notifications`}
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          );
        })}
      </SettingsInfoSection>
    </div>
  );
}
