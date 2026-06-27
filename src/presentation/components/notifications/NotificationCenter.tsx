"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Bell,
  BellRing,
  CalendarCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileCheck2,
  FileX2,
  Inbox,
  PackageCheck,
  Settings,
  ShieldCheck,
  Wrench,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { RiSearch2Line } from "react-icons/ri";
import {
  listInboxMessages,
  markInboxMessageRead,
  type InboxMessage,
} from "@/infrastructure/services/inbox.service";
import { updateBookingsStatus } from "@/infrastructure/services/bookings.service";
import { useFcmDeviceRegistration } from "@/application/hooks/useFcmDeviceRegistration";
import { FCM_FOREGROUND_EVENT } from "@/infrastructure/services/firebase-messaging.service";
import Dropdown from "@/presentation/components/Dropdown/Dropdown";
import styles from "./NotificationCenter.module.css";

type NotificationKind =
  | "booking-request"
  | "service-approved"
  | "service-denied"
  | "booking-completed"
  | "export-complete"
  | "export-failed"
  | "storage-sale"
  | "payment"
  | "settings"
  | "security"
  | "system";

type NotificationTab = "all" | "bookings" | "services" | "exports" | "archived";
type NotificationCategory = "bookings" | "services" | "exports" | "operations";
type NotificationStatus = "unread" | "read" | "archived";
type StatusFilter = "all" | "unread" | "read";

interface NotificationViewModel {
  id: string;
  source: InboxMessage;
  title: string;
  body: string;
  status: NotificationStatus;
  kind: NotificationKind;
  category: NotificationCategory;
  createdAt: string;
  readAt?: string | null;
  actionUrl?: string | null;
  actorName?: string | null;
  bookingId?: string | null;
  serviceIcon?: string | null;
  serviceName?: string | null;
  previousStatus?: Exclude<NotificationStatus, "archived">;
}

interface KindConfig {
  icon: LucideIcon;
  badgeIcon: LucideIcon;
  label: string;
  category: NotificationCategory;
  accent: string;
  accentSoft: string;
}

const TABS: { id: NotificationTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bookings", label: "Bookings" },
  { id: "services", label: "Services" },
  { id: "exports", label: "Exports" },
  { id: "archived", label: "Archived" },
];

const STATUS_FILTER_OPTIONS = ["Unread only", "Read only"];

const KIND_CONFIG: Record<NotificationKind, KindConfig> = {
  "booking-request": {
    icon: CalendarClock,
    badgeIcon: Bell,
    label: "Booking request",
    category: "bookings",
    accent: "#2563eb",
    accentSoft: "#dbeafe",
  },
  "service-approved": {
    icon: CheckCircle2,
    badgeIcon: Check,
    label: "Approved",
    category: "services",
    accent: "#16a34a",
    accentSoft: "#dcfce7",
  },
  "service-denied": {
    icon: XCircle,
    badgeIcon: X,
    label: "Denied",
    category: "services",
    accent: "#dc2626",
    accentSoft: "#fee2e2",
  },
  "booking-completed": {
    icon: CalendarCheck,
    badgeIcon: Check,
    label: "Completed",
    category: "bookings",
    accent: "#059669",
    accentSoft: "#d1fae5",
  },
  "export-complete": {
    icon: FileCheck2,
    badgeIcon: Check,
    label: "Export ready",
    category: "exports",
    accent: "#7c3aed",
    accentSoft: "#ede9fe",
  },
  "export-failed": {
    icon: FileX2,
    badgeIcon: X,
    label: "Export failed",
    category: "exports",
    accent: "#f97316",
    accentSoft: "#ffedd5",
  },
  "storage-sale": {
    icon: PackageCheck,
    badgeIcon: Check,
    label: "Storage",
    category: "operations",
    accent: "#0891b2",
    accentSoft: "#cffafe",
  },
  payment: {
    icon: CreditCard,
    badgeIcon: Check,
    label: "Payment",
    category: "operations",
    accent: "#0f766e",
    accentSoft: "#ccfbf1",
  },
  settings: {
    icon: Settings,
    badgeIcon: Check,
    label: "Settings",
    category: "operations",
    accent: "#525252",
    accentSoft: "#f5f5f5",
  },
  security: {
    icon: ShieldCheck,
    badgeIcon: Check,
    label: "Security",
    category: "operations",
    accent: "#be123c",
    accentSoft: "#ffe4e6",
  },
  system: {
    icon: Bell,
    badgeIcon: Check,
    label: "Notification",
    category: "operations",
    accent: "#111827",
    accentSoft: "#f3f4f6",
  },
};

const SERVICE_ICON_BY_KEYWORD: { keywords: string[]; icon: string }[] = [
  {
    keywords: ["wheel", "tire", "tyre", "alignment", "rotation"],
    icon: "/assets/wheel_service.svg",
  },
  {
    keywords: ["battery", "electrical", "alternator", "charging"],
    icon: "/assets/battery_service.svg",
  },
  {
    keywords: ["paint", "body", "dent", "scratch", "collision"],
    icon: "/assets/paint_service.svg",
  },
  {
    keywords: ["engine", "oil", "diagnostic", "repair", "service"],
    icon: "/assets/engine_service.svg",
  },
];

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getMetadata(message: InboxMessage) {
  const metadata = message.metadata ?? message.data;

  if (!metadata || typeof metadata !== "object") {
    return {};
  }

  return metadata;
}

function searchableText(message: InboxMessage) {
  const metadata = getMetadata(message);
  return [
    message.type,
    message.title,
    message.body,
    message.serviceName,
    getString(metadata.serviceName),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inferKind(message: InboxMessage): NotificationKind {
  const text = searchableText(message);
  const hasBooking = text.includes("booking") || text.includes("appointment");
  const hasService = text.includes("service") || hasBooking;

  if (text.includes("export")) {
    return text.includes("fail") || text.includes("error")
      ? "export-failed"
      : "export-complete";
  }

  if (
    text.includes("storage") ||
    text.includes("inventory") ||
    text.includes("item sold") ||
    text.includes("sold")
  ) {
    return "storage-sale";
  }

  if (text.includes("security") || text.includes("password") || text.includes("mfa")) {
    return "security";
  }

  if (text.includes("payment") || text.includes("refund") || text.includes("paid")) {
    return "payment";
  }

  if (text.includes("setting") || text.includes("profile saved")) {
    return "settings";
  }

  if (hasBooking && (text.includes("request") || text.includes("pending"))) {
    return "booking-request";
  }

  if (hasService && (text.includes("accepted") || text.includes("approved"))) {
    return "service-approved";
  }

  if (
    hasService &&
    (text.includes("declined") ||
      text.includes("denied") ||
      text.includes("cancelled") ||
      text.includes("canceled") ||
      text.includes("rejected"))
  ) {
    return "service-denied";
  }

  if (hasBooking && text.includes("completed")) {
    return "booking-completed";
  }

  return "system";
}

function getServiceIcon(message: InboxMessage) {
  const metadata = getMetadata(message);
  const explicit =
    getString(message.serviceIcon) ||
    getString(metadata.serviceIcon) ||
    getString(metadata.icon);

  if (explicit) {
    return explicit;
  }

  const text = searchableText(message);
  return SERVICE_ICON_BY_KEYWORD.find((item) =>
    item.keywords.some((keyword) => text.includes(keyword)),
  )?.icon;
}

function getMessageStatus(message: InboxMessage): NotificationStatus {
  const status = message.status.toLowerCase();

  if (message.archivedAt || status.includes("archived")) {
    return "archived";
  }

  if (message.readAt || status.includes("read")) {
    return "read";
  }

  return "unread";
}

function toViewModel(message: InboxMessage): NotificationViewModel {
  const metadata = getMetadata(message);
  const kind = inferKind(message);
  const config = KIND_CONFIG[kind];

  return {
    id: message.id,
    source: message,
    title: message.title,
    body: message.body,
    status: getMessageStatus(message),
    kind,
    category: config.category,
    createdAt: message.createdAt,
    readAt: message.readAt,
    actionUrl:
      getString(message.actionUrl) ||
      getString(metadata.actionUrl) ||
      getString(metadata.url),
    actorName:
      getString(message.actorName) ||
      getString(metadata.actorName) ||
      getString(metadata.customerName),
    bookingId: getString(message.bookingId) || getString(metadata.bookingId),
    serviceIcon: getServiceIcon(message),
    serviceName: getString(message.serviceName) || getString(metadata.serviceName),
  };
}

function createPreviewNotifications(): InboxMessage[] {
  const now = Date.now();

  return [
    {
      id: "preview-booking-request",
      title: "New booking request for Engine Diagnostics",
      body: "Mariam Hassan requested Engine Diagnostics for a 2022 Toyota Corolla.",
      status: "unread",
      type: "booking_request",
      createdAt: new Date(now - 8 * 60 * 1000).toISOString(),
      bookingId: "BK-2048",
      serviceIcon: "/assets/engine_service.svg",
      serviceName: "Engine Diagnostics",
      actorName: "Mariam Hassan",
    },
    {
      id: "preview-service-approved",
      title: "Wheel Alignment was approved",
      body: "The booking was accepted and added to today's service queue.",
      status: "read",
      type: "booking_accepted",
      createdAt: new Date(now - 42 * 60 * 1000).toISOString(),
      bookingId: "BK-2039",
      serviceIcon: "/assets/wheel_service.svg",
      serviceName: "Wheel Alignment",
      actorName: "Omar Adel",
      readAt: new Date(now - 35 * 60 * 1000).toISOString(),
    },
    {
      id: "preview-service-denied",
      title: "Paint Touch-up was denied",
      body: "The request was declined because the selected bay is unavailable.",
      status: "unread",
      type: "booking_declined",
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      bookingId: "BK-2027",
      serviceIcon: "/assets/paint_service.svg",
      serviceName: "Paint Touch-up",
      actorName: "Youssef Nabil",
    },
    {
      id: "preview-export-ready",
      title: "Payments export is ready",
      body: "Excel export finished with 128 matching payment records.",
      status: "read",
      type: "payment_export_completed",
      createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
      actionUrl: "/payments/export/details",
      readAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      metadata: { exportFormat: "excel" },
    },
    {
      id: "preview-storage-sale",
      title: "Battery stock item sold",
      body: "One AC Delco battery was sold from storage and recorded in payments.",
      status: "unread",
      type: "storage_item_sold",
      createdAt: new Date(now - 7 * 60 * 60 * 1000).toISOString(),
      serviceIcon: "/assets/battery_service.svg",
      serviceName: "Battery Replacement",
    },
    {
      id: "preview-security",
      title: "MFA settings updated",
      body: "Multi-factor authentication preferences were saved successfully.",
      status: "read",
      type: "mfa_updated",
      createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      readAt: new Date(now - 23 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

function formatTimeAgo(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function normalizeActionPath(path: string) {
  if (/^\/bookings\/[^/]+/i.test(path)) {
    return "/bookings";
  }

  return path;
}

function pushButtonLabel(status: string) {
  switch (status) {
    case "registering":
      return "Enabling...";
    case "permission-granted":
    case "error":
      return "Enable push";
    case "permission-default":
    default:
      return "Enable push";
  }
}

function statusFilterToOption(filter: StatusFilter) {
  if (filter === "unread") return "Unread only";
  if (filter === "read") return "Read only";
  return null;
}

function optionToStatusFilter(option: string | null): StatusFilter {
  if (option === "Unread only") return "unread";
  if (option === "Read only") return "read";
  return "all";
}

export default function NotificationCenter() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<NotificationViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const pushRegistration = useFcmDeviceRegistration();

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await listInboxMessages({ page: 1, limit: 75 });
      setNotifications(response.data.map(toViewModel));
      setNotice(null);
    } catch {
      const previewRows =
        process.env.NODE_ENV === "production" ? [] : createPreviewNotifications();
      setNotifications(previewRows.map(toViewModel));
      setNotice(
        previewRows.length
          ? "Preview notifications are shown while inbox data is unavailable."
          : "Could not load notifications.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    void loadNotifications().finally(() => {
      if (ignore) return;
    });

    return () => {
      ignore = true;
    };
  }, [loadNotifications]);

  useEffect(() => {
    function handleForegroundMessage() {
      void loadNotifications();
    }

    window.addEventListener(FCM_FOREGROUND_EVENT, handleForegroundMessage);
    return () => {
      window.removeEventListener(FCM_FOREGROUND_EVENT, handleForegroundMessage);
    };
  }, [loadNotifications]);

  const canEnablePush = [
    "permission-default",
    "permission-granted",
    "error",
  ].includes(pushRegistration.state.status);
  const isPushEnabled = pushRegistration.state.status === "registered";

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesTab =
        activeTab === "all"
          ? notification.status !== "archived"
          : activeTab === "archived"
            ? notification.status === "archived"
            : notification.category === activeTab &&
              notification.status !== "archived";

      if (!matchesTab) {
        return false;
      }

      if (
        activeTab !== "archived" &&
        statusFilter !== "all" &&
        notification.status !== statusFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        notification.title,
        notification.body,
        notification.actorName,
        notification.serviceName,
        KIND_CONFIG[notification.kind].label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [activeTab, notifications, searchQuery, statusFilter]);

  function updateNotification(
    id: string,
    updates: Partial<NotificationViewModel>,
  ) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, ...updates } : notification,
      ),
    );
  }

  async function markRead(notification: NotificationViewModel) {
    if (notification.status !== "unread") {
      return;
    }

    updateNotification(notification.id, {
      status: "read",
      readAt: new Date().toISOString(),
    });

    try {
      await markInboxMessageRead(notification.id);
    } catch {
      updateNotification(notification.id, { status: "unread", readAt: null });
    }
  }

  function archiveNotification(notification: NotificationViewModel) {
    updateNotification(notification.id, {
      status: "archived",
      previousStatus:
        notification.status === "archived"
          ? notification.previousStatus
          : notification.status,
    });
  }

  function unarchiveNotification(notification: NotificationViewModel) {
    updateNotification(notification.id, {
      status: notification.previousStatus ?? "read",
      previousStatus: undefined,
    });
  }

  function openPath(path: string) {
    if (/^https?:\/\//i.test(path)) {
      window.open(path, "_blank", "noopener,noreferrer");
      return;
    }

    const normalizedPath = normalizeActionPath(path);
    const localizedPath = normalizedPath.startsWith(`/${locale}/`)
      ? normalizedPath
      : normalizedPath.startsWith("/")
        ? `/${locale}${normalizedPath}`
        : `/${locale}/${normalizedPath}`;

    router.push(localizedPath);
  }

  async function enablePushNotifications() {
    const result = await pushRegistration.register(true);

    if (result.status === "registered") {
      setNotice("Push notifications enabled for this browser.");
      return;
    }

    if (result.message) {
      setNotice(result.message);
    }
  }

  async function openNotification(notification: NotificationViewModel) {
    await markRead(notification);

    if (notification.actionUrl) {
      openPath(notification.actionUrl);
      return;
    }

    if (
      notification.category === "bookings" ||
      notification.kind === "service-approved" ||
      notification.kind === "service-denied"
    ) {
      openPath("/bookings");
      return;
    }

    if (notification.category === "exports") {
      openPath("/payments/export/details");
      return;
    }

    if (notification.kind === "storage-sale") {
      openPath("/inventory");
    }
  }

  async function decideBooking(
    notification: NotificationViewModel,
    status: "Accepted" | "Cancelled",
  ) {
    setBusyId(notification.id);
    setNotice(null);

    try {
      if (notification.bookingId) {
        await updateBookingsStatus([notification.bookingId], status);
      }

      await markRead(notification);
      updateNotification(notification.id, {
        kind: status === "Accepted" ? "service-approved" : "service-denied",
        category: "services",
        title: `${notification.serviceName ?? "Service"} was ${
          status === "Accepted" ? "approved" : "denied"
        }`,
        body:
          status === "Accepted"
            ? "The booking was accepted and moved into the service queue."
            : "The booking request was declined.",
      });
    } catch {
      setNotice("Could not update that booking. Open Bookings to manage it.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Notifications</h1>
        </div>

        <div className={styles.headerActions}>
          {canEnablePush && (
            <button
              type="button"
              className={styles.pushButton}
              onClick={enablePushNotifications}
              disabled={pushRegistration.state.status === "registering"}
            >
              <BellRing aria-hidden="true" />
              {pushButtonLabel(pushRegistration.state.status)}
            </button>
          )}

          {isPushEnabled && (
            <span className={styles.pushStatus}>
              <BellRing aria-hidden="true" />
              Push enabled
            </span>
          )}
        </div>
      </header>

      <div className={styles.toolbar}>
        <nav className={styles.tabs} aria-label="Notification filters">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={styles.filters}>
        <Dropdown
          options={STATUS_FILTER_OPTIONS}
          selected={statusFilterToOption(statusFilter)}
          onSelect={(option) => setStatusFilter(optionToStatusFilter(option))}
          label="Status"
        />
        <div className={styles.searchBar}>
          <RiSearch2Line />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search"
            type="search"
          />
        </div>
      </div>

      {notice && <div className={styles.notice}>{notice}</div>}

      <section className={styles.list} aria-label="Notifications list">
        {isLoading ? (
          <div className={styles.emptyState}>Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className={styles.emptyState}>No notifications in this view.</div>
        ) : (
          filteredNotifications.map((notification) => {
            const config = KIND_CONFIG[notification.kind];
            const Icon = config.icon;
            const BadgeIcon = config.badgeIcon;
            const isServiceVisual =
              Boolean(notification.serviceIcon) &&
              (notification.category === "bookings" ||
                notification.category === "services" ||
                notification.kind === "storage-sale");
            const isUnread = notification.status === "unread";
            const isBusy = busyId === notification.id;

            return (
              <article
                key={notification.id}
                className={`${styles.notificationRow} ${
                  isUnread ? styles.notificationRowUnread : ""
                }`}
              >
                <span className={styles.unreadSlot} aria-hidden="true">
                  {isUnread && <span className={styles.unreadDot} />}
                </span>

                <div
                  className={styles.avatar}
                  style={
                    {
                      "--accent": config.accent,
                      "--accentSoft": config.accentSoft,
                    } as React.CSSProperties
                  }
                >
                  {isServiceVisual && notification.serviceIcon ? (
                    <img src={notification.serviceIcon} alt="" />
                  ) : (
                    <Icon aria-hidden="true" />
                  )}
                  <span className={styles.badge}>
                    <BadgeIcon aria-hidden="true" />
                  </span>
                </div>

                <div className={styles.rowBody}>
                  <div className={styles.rowHeader}>
                    <h2>{notification.title}</h2>
                    <time dateTime={notification.createdAt}>
                      {formatTimeAgo(notification.createdAt)}
                    </time>
                  </div>

                  <p>{notification.body}</p>

                  <div className={styles.meta}>
                    <span>{config.label}</span>
                    {notification.serviceName && (
                      <span>
                        <Wrench aria-hidden="true" />
                        {notification.serviceName}
                      </span>
                    )}
                    {notification.actorName && <span>{notification.actorName}</span>}
                  </div>

                  {notification.kind === "booking-request" && (
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.secondaryAction}
                        onClick={() => decideBooking(notification, "Cancelled")}
                        disabled={isBusy}
                      >
                        <X aria-hidden="true" />
                        Deny
                      </button>
                      <button
                        type="button"
                        className={styles.primaryAction}
                        onClick={() => decideBooking(notification, "Accepted")}
                        disabled={isBusy}
                      >
                        <Check aria-hidden="true" />
                        Approve
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.rowTools}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => openNotification(notification)}
                    aria-label="Open notification"
                    title="Open"
                  >
                    <ExternalLink aria-hidden="true" />
                  </button>
                  {notification.status !== "archived" && (
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => archiveNotification(notification)}
                      aria-label="Archive notification"
                      title="Archive"
                    >
                      <Archive aria-hidden="true" />
                    </button>
                  )}
                  {notification.status === "archived" && (
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => unarchiveNotification(notification)}
                      aria-label="Unarchive notification"
                      title="Unarchive"
                    >
                      <ArchiveRestore aria-hidden="true" />
                    </button>
                  )}
                  {notification.status === "unread" && (
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => markRead(notification)}
                      aria-label="Mark notification as read"
                      title="Mark read"
                    >
                      <Inbox aria-hidden="true" />
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
