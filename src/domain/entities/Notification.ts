export type NotificationType = "accepted" | "declined" | "success" | "error";

export type NotificationPreferenceKey =
  | "bookingAccepted"
  | "bookingDeclined"
  | "settingsSaved"
  | "securitySettingsUpdated"
  | "mfaUpdated"
  | "exportGenerated"
  | "storageItemSold";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}
