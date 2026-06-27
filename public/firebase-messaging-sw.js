const DEFAULT_NOTIFICATION_URL = "/";
const DEFAULT_LOCALE = "en";

function parsePayload(event) {
  if (!event.data) return {};

  try {
    return event.data.json();
  } catch {
    return {};
  }
}

function notificationFromPayload(payload) {
  const data = payload.data || {};
  const notification = payload.notification || {};
  const link =
    data.url ||
    data.actionUrl ||
    payload.fcmOptions?.link ||
    payload.fcm_options?.link ||
    DEFAULT_NOTIFICATION_URL;

  return {
    title: notification.title || data.title || "Notification",
    options: {
      body: notification.body || data.body || "",
      icon: notification.icon || "/assets/Logo.svg",
      badge: "/assets/Logo.svg",
      data: { url: link },
    },
  };
}

self.addEventListener("push", (event) => {
  const payload = parsePayload(event);
  const notification = notificationFromPayload(payload);

  event.waitUntil(
    self.registration.showNotification(notification.title, notification.options),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const locale =
        windows
          .map((client) => new URL(client.url).pathname.match(/^\/(en|ar)(\/|$)/)?.[1])
          .find(Boolean) || DEFAULT_LOCALE;
      const targetUrl = normalizeTargetUrl(
        event.notification.data?.url || DEFAULT_NOTIFICATION_URL,
        locale,
      );
      const sameOriginWindow = windows.find((client) =>
        client.url.startsWith(self.location.origin),
      );

      if (sameOriginWindow) {
        sameOriginWindow.focus();
        return sameOriginWindow.navigate(targetUrl);
      }

      return clients.openWindow(targetUrl);
    }),
  );
});

function normalizeTargetUrl(rawUrl, locale) {
  const url = new URL(rawUrl, self.location.origin);

  if (url.origin !== self.location.origin) {
    return url.href;
  }

  if (/^\/bookings\/[^/]+/.test(url.pathname)) {
    url.pathname = `/${locale}/bookings`;
    url.search = "";
    return url.href;
  }

  if (!/^\/(en|ar)(\/|$)/.test(url.pathname)) {
    url.pathname = `/${locale}${url.pathname === "/" ? "" : url.pathname}`;
  }

  return url.href;
}
