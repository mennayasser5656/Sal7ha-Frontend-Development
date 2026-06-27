import { apiClient } from "@/infrastructure/api/client";

export interface NotificationDevice {
  id: string;
  tokenPreview: string;
  platform: "android" | "ios" | "web" | string;
  client: "mobile" | "website" | string;
  deviceId: string | null;
  enabled: boolean;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterNotificationDevicePayload {
  token: string;
  platform: "web";
  client: "website";
  deviceId?: string;
}

export interface UnregisterNotificationDevicePayload {
  token?: string;
  deviceId?: string;
}

export function listNotificationDevices() {
  return apiClient<{ data: NotificationDevice[] }>("/notifications/devices");
}

export function registerNotificationDevice(
  payload: RegisterNotificationDevicePayload,
) {
  return apiClient<NotificationDevice>("/notifications/devices", {
    method: "POST",
    body: payload,
  });
}

export function unregisterNotificationDevice(
  payload: UnregisterNotificationDevicePayload,
) {
  return apiClient<{ disabled: number }>("/notifications/devices", {
    method: "DELETE",
    body: payload,
  });
}
