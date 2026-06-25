"use client";

import { useCallback, useEffect, useState } from "react";
import type { NotificationPreferenceKey } from "@/domain/entities/Notification";
import { apiClient } from "@/infrastructure/api/client";

export const NOTIFICATION_PREFERENCES: {
  key: NotificationPreferenceKey;
  title: string;
  description: string;
}[] = [
  {
    key: "bookingAccepted",
    title: "Booking accepted",
    description: "Show a notification when a booking is accepted.",
  },
  {
    key: "bookingDeclined",
    title: "Booking declined",
    description: "Show a notification when a booking is declined.",
  },
  {
    key: "settingsSaved",
    title: "Settings saved",
    description: "Show a notification after profile, service, or item settings are saved.",
  },
  {
    key: "securitySettingsUpdated",
    title: "Security settings updated",
    description: "Show a notification when a security setting is changed.",
  },
  {
    key: "mfaUpdated",
    title: "MFA updated",
    description: "Show a notification when multi-factor authentication settings are saved.",
  },
  {
    key: "exportGenerated",
    title: "Export generated",
    description: "Show a notification when a payments export is generated.",
  },
  {
    key: "storageItemSold",
    title: "Storage item sold",
    description: "Show a notification when an inventory item is sold.",
  },
];

export type NotificationPreferenceMap = Record<NotificationPreferenceKey, boolean>;

const STORAGE_KEY = "car-service-admin:notification-preferences";

export const DEFAULT_NOTIFICATION_PREFERENCES =
  NOTIFICATION_PREFERENCES.reduce<NotificationPreferenceMap>(
    (preferences, preference) => ({
      ...preferences,
      [preference.key]: true,
    }),
    {} as NotificationPreferenceMap,
  );

function readPreferences(): NotificationPreferenceMap {
  if (typeof window === "undefined") {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }

    const parsed = JSON.parse(stored) as Partial<NotificationPreferenceMap>;
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...parsed,
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

function writePreferences(preferences: NotificationPreferenceMap) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

function toPreferenceMap(
  rows: { key: string; enabled: boolean }[],
): NotificationPreferenceMap {
  return rows.reduce<NotificationPreferenceMap>(
    (next, row) => ({
      ...next,
      [row.key as NotificationPreferenceKey]: row.enabled,
    }),
    { ...DEFAULT_NOTIFICATION_PREFERENCES },
  );
}

function toBackendPreferences(preferences: NotificationPreferenceMap) {
  return Object.fromEntries(
    Object.entries(preferences).map(([key, enabled]) => [key, Boolean(enabled)]),
  );
}

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferenceMap>(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );

  useEffect(() => {
    setPreferences(readPreferences());

    async function loadBackendPreferences() {
      try {
        const response = await apiClient<{
          preferences: { key: string; enabled: boolean }[];
        }>("/account/notification-preferences");
        const next = toPreferenceMap(response.preferences);
        setPreferences(next);
        writePreferences(next);
      } catch {
        setPreferences(readPreferences());
      }
    }

    void loadBackendPreferences();

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setPreferences(readPreferences());
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setPreference = useCallback((key: NotificationPreferenceKey, enabled: boolean) => {
    setPreferences((current) => {
      const next = { ...current, [key]: enabled };
      writePreferences(next);
      void apiClient("/account/notification-preferences", {
        method: "PUT",
        body: { preferences: toBackendPreferences(next) },
      });
      return next;
    });
  }, []);

  const isNotificationEnabled = useCallback((key?: NotificationPreferenceKey): boolean => {
    if (!key) {
      return true;
    }

    return preferences[key] ?? true;
  }, [preferences]);

  return {
    preferences,
    setPreference,
    isNotificationEnabled,
  };
}
