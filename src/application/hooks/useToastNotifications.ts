import { useCallback, useState } from "react";
import type {
  Notification,
  NotificationPreferenceKey,
  NotificationType,
} from "@/domain/entities/Notification";
import { useNotificationPreferences } from "@/application/hooks/useNotificationPreferences";

function createNotificationId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useToastNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isNotificationEnabled } = useNotificationPreferences();

  const dismissNotification = useCallback((id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  }, []);

  const showNotification = useCallback(
    (
      message: string,
      type: NotificationType = "success",
      preferenceKey?: NotificationPreferenceKey,
    ) => {
      if (!isNotificationEnabled(preferenceKey)) {
        return null;
      }

      const id = createNotificationId();
      setNotifications((current) => [...current, { id, message, type }]);
      setTimeout(() => dismissNotification(id), 3000);
      return id;
    },
    [dismissNotification, isNotificationEnabled],
  );

  return {
    notifications,
    dismissNotification,
    showNotification,
  };
}
