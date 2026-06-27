import type { FirebaseOptions } from "firebase/app";
import type { MessagePayload } from "firebase/messaging";
import { getStoredAuthSession } from "@/infrastructure/api/client";
import {
  registerNotificationDevice,
  unregisterNotificationDevice,
} from "@/infrastructure/services/notification-devices.service";

export type WebPushRegistrationStatus =
  | "checking"
  | "unsupported"
  | "missing-config"
  | "no-session"
  | "permission-default"
  | "permission-denied"
  | "permission-granted"
  | "registering"
  | "registered"
  | "error";

export interface WebPushRegistrationState {
  status: WebPushRegistrationStatus;
  message?: string;
  tokenPreview?: string;
}

export const FCM_FOREGROUND_EVENT = "car-service-admin:fcm-message";

const DEVICE_ID_STORAGE_KEY = "car-service-admin:fcm-device-id";
const TOKEN_STORAGE_KEY = "car-service-admin:fcm-token";
const SERVICE_WORKER_PATH = "/firebase-messaging-sw.js";

let registrationRequest: Promise<WebPushRegistrationState> | null = null;

function isBrowser() {
  return typeof window !== "undefined";
}

function required(value: string | undefined) {
  return value && value.trim() ? value.trim() : undefined;
}

function firebaseConfig(): FirebaseOptions | null {
  const apiKey = required(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  const projectId = required(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const messagingSenderId = required(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  );
  const appId = required(process.env.NEXT_PUBLIC_FIREBASE_APP_ID);

  if (!apiKey || !projectId || !messagingSenderId || !appId) {
    return null;
  }

  return {
    apiKey,
    projectId,
    messagingSenderId,
    appId,
    authDomain: required(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    storageBucket: required(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  };
}

function vapidKey() {
  return required(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
}

function supportsWebPush() {
  return (
    isBrowser() &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

function getDeviceId() {
  const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, next);
  return next;
}

function tokenPreview(token: string) {
  return `${token.slice(0, 10)}...${token.slice(-6)}`;
}

export function getWebPushRegistrationState(): WebPushRegistrationState {
  if (!supportsWebPush()) {
    return {
      status: "unsupported",
      message: "Push notifications are not supported in this browser.",
    };
  }

  if (!firebaseConfig() || !vapidKey()) {
    return {
      status: "missing-config",
      message: "Firebase web messaging is not configured.",
    };
  }

  if (!getStoredAuthSession()) {
    return { status: "no-session" };
  }

  if (Notification.permission === "denied") {
    return {
      status: "permission-denied",
      message: "Browser notifications are blocked.",
    };
  }

  if (Notification.permission !== "granted") {
    return { status: "permission-default" };
  }

  const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (savedToken) {
    return {
      status: "registered",
      tokenPreview: tokenPreview(savedToken),
    };
  }

  return { status: "permission-granted" };
}

async function messagingClient() {
  const config = firebaseConfig();
  const key = vapidKey();
  if (!config || !key) {
    return null;
  }

  const [{ getApp, getApps, initializeApp }, messagingModule] =
    await Promise.all([import("firebase/app"), import("firebase/messaging")]);

  const supported = await messagingModule.isSupported();
  if (!supported) {
    return null;
  }

  const app = getApps().length ? getApp() : initializeApp(config);
  return {
    client: messagingModule.getMessaging(app),
    getToken: messagingModule.getToken,
    onMessage: messagingModule.onMessage,
    vapidKey: key,
  };
}

async function registerServiceWorker() {
  return navigator.serviceWorker.register(SERVICE_WORKER_PATH, {
    scope: "/",
  });
}

async function doRegisterWebPushDevice(options: {
  requestPermission?: boolean;
}): Promise<WebPushRegistrationState> {
  const current = getWebPushRegistrationState();
  if (
    current.status === "unsupported" ||
    current.status === "missing-config" ||
    current.status === "no-session" ||
    current.status === "permission-denied" ||
    current.status === "registered"
  ) {
    return current;
  }

  let permission = Notification.permission;
  if (permission === "default" && options.requestPermission) {
    permission = await Notification.requestPermission();
  }

  if (permission === "denied") {
    return {
      status: "permission-denied",
      message: "Browser notifications are blocked.",
    };
  }

  if (permission !== "granted") {
    return { status: "permission-default" };
  }

  const messaging = await messagingClient();
  if (!messaging) {
    return {
      status: "unsupported",
      message: "Firebase messaging is not supported in this browser.",
    };
  }

  try {
    const serviceWorkerRegistration = await registerServiceWorker();
    const token = await messaging.getToken(messaging.client, {
      vapidKey: messaging.vapidKey,
      serviceWorkerRegistration,
    });

    if (!token) {
      return {
        status: "error",
        message: "Firebase did not return a registration token.",
      };
    }

    await registerNotificationDevice({
      token,
      platform: "web",
      client: "website",
      deviceId: getDeviceId(),
    });

    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return { status: "registered", tokenPreview: tokenPreview(token) };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Could not register this browser for push notifications.",
    };
  }
}

export function registerWebPushDevice(
  options: { requestPermission?: boolean } = {},
) {
  if (!registrationRequest) {
    registrationRequest = doRegisterWebPushDevice(options).finally(() => {
      registrationRequest = null;
    });
  }

  return registrationRequest;
}

export async function unregisterWebPushDevice() {
  if (!supportsWebPush()) {
    return { disabled: 0 };
  }

  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  const deviceId = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY) ?? undefined;

  try {
    if (token || deviceId) {
      return await unregisterNotificationDevice({ token: token ?? undefined, deviceId });
    }
    return { disabled: 0 };
  } finally {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export async function subscribeToForegroundMessages(
  callback: (payload: MessagePayload) => void,
) {
  if (!supportsWebPush() || Notification.permission !== "granted") {
    return () => {};
  }

  const messaging = await messagingClient();
  if (!messaging) {
    return () => {};
  }

  return messaging.onMessage(messaging.client, (payload) => {
    window.dispatchEvent(
      new CustomEvent(FCM_FOREGROUND_EVENT, { detail: payload }),
    );
    callback(payload);
  });
}
