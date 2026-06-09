"use client";

import {
  NOTIFICATION_PREFERENCES,
  useNotificationPreferences,
} from "@/application/hooks/useNotificationPreferences";
import styles from "./notifications.module.css";

export default function NotificationsSettingsPage() {
  const { preferences, setPreference } = useNotificationPreferences();

  return (
    <div className={styles.content}>
      <section className={styles.section}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Toast Notifications</h2>
            <p className={styles.description}>
              Control which actions show a notification after they finish.
            </p>
          </div>
        </div>

        <div className={styles.rows}>
          {NOTIFICATION_PREFERENCES.map((preference) => {
            const enabled = preferences[preference.key];

            return (
              <div key={preference.key} className={styles.row}>
                <div className={styles.copy}>
                  <span className={styles.rowTitle}>{preference.title}</span>
                  <span className={styles.rowDescription}>
                    {preference.description}
                  </span>
                </div>

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
        </div>
      </section>
    </div>
  );
}
