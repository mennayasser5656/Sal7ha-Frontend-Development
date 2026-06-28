import mockData from "./mock-data.json";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface MockApiOptions {
  method?: ApiMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  auth?: boolean;
}

interface MockApiResult<T> {
  handled: boolean;
  data?: T;
}

interface MockAuthSessionLike {
  accessToken?: string | null;
  user?: unknown;
}

interface AuthUser {
  id: string;
  email: string;
  role: "business" | "client" | "admin";
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  businessId?: string | null;
  onboardingCompleted?: boolean;
  twoFactorEnabled?: boolean;
}

interface Booking {
  id: string;
  serviceId?: string | null;
  serviceName: string;
  serviceIcon: string;
  ownerIcon: string;
  name: string;
  carMake: string;
  carModel: string;
  carYear: string;
  startDate: string;
  endDate: string;
  status: string;
  price: number;
  serviceDetails: { label: string; value: string }[];
}

interface Payment {
  id: string;
  customer: string;
  item: string;
  method: string;
  date: string;
  amount: number;
  kind: "item" | "service" | "car";
}

interface PaymentSummary {
  monthlyPayments: number;
  yearlyPayments: number;
  itemsSold: number;
  servicesDone: number;
}

interface InventoryItem {
  id: string;
  category: string;
  name: string;
  company?: string | null;
  brand?: string | null;
  type?: string | null;
  specification?: string | null;
  viscosity?: string | null;
  capacity?: string | null;
  volume?: string | null;
  apiSpec?: string | null;
  application?: string | null;
  details?: string | null;
  usedInServices?: string[] | null;
  imageUrl?: string | null;
  price: number;
  purchasePrice?: number | null;
  currency?: string;
  deliveryTime?: string | null;
  quantity?: number;
  lowStockThreshold?: number;
  status?: string;
}

interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  type: "purchase" | "sale" | "adjustment" | "return";
  quantity: number;
  unitPrice?: number | null;
  paymentId?: string | null;
  note?: string | null;
  createdAt: string;
}

interface WidgetDefinition {
  id: string;
  title: string;
  type:
    | "profile"
    | "calendar"
    | "growth"
    | "status"
    | "statusSummary"
    | "setupWarnings";
  statusKey?: "inProgress" | "completed" | "pending" | "cancelled";
  color?: string;
  span?: number;
}

interface BusinessProfile {
  id: string;
  name: string;
  logoUrl?: string | null;
  logoFileName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  onboardingCompleted?: boolean;
  commercialRegistrationNumber?: string | null;
  taxIdentificationNumber?: string | null;
  businessType?: string | null;
  employeeCount?: string | null;
  address?: {
    country?: string | null;
    streetAddress?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  };
}

interface AccountProfile {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  phoneNumber?: string | null;
  address?: Record<string, unknown> | null;
  setupStatus?: "ok" | "warning";
  personalIdUrl?: string | null;
  personalIdFileName?: string | null;
  personalIdReviewStatus?: "not_uploaded" | "pending" | "approved" | "rejected";
}

interface BusinessService {
  id: string;
  serviceId?: string | null;
  category: string;
  name: string;
  price: number;
  currency: string;
  status: string;
}

interface PaymentExportJob {
  id: string;
  type: string;
  status: string;
  format: string;
  matchedCount: number;
  downloadUrl: string | null;
  errorMessage?: string | null;
  createdAt: string;
  completedAt?: string | null;
  expiresAt?: string | null;
}

interface MockData {
  account: {
    email: string;
    password: string;
    session: {
      accessToken: string;
      refreshToken: string;
      expiresIn?: number;
      tokenType?: string;
    };
    user: AuthUser;
    ownerProfile: AccountProfile;
    businessProfile: BusinessProfile;
    security: {
      preferences: {
        key: string;
        title: string;
        description: string;
        enabled: boolean;
      }[];
      mfa: {
        enabled: boolean;
        method: "sms" | "authenticator" | null;
        phone?: string | null;
        verifiedAt?: string | null;
      };
    };
    notificationPreferences: { key: string; enabled: boolean }[];
  };
  allWidgets: WidgetDefinition[];
  activeWidgetIds: string[];
  setupWarnings: {
    id: string;
    title: string;
    description: string;
    segment: string;
    severity: "warning" | "critical";
  }[];
  businessServices: BusinessService[];
  serviceCatalog: unknown[];
  bookings: Booking[];
  payments: Payment[];
  inventoryItems: InventoryItem[];
  inventoryTransactions: InventoryTransaction[];
  inventoryCatalog: unknown;
  reports: Record<string, unknown>;
  billingAccounts: {
    id: string;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    iban: string;
    swift: string;
    branch?: string | null;
    billingEmail?: string | null;
    status?: string;
  }[];
  supportedBanks: {
    name: string;
    imageUrl?: string | null;
    supportsBulkPayment?: boolean;
  }[];
  inboxMessages: {
    id: string;
    title: string;
    body: string;
    status: string;
    type: string;
    createdAt: string;
    readAt?: string | null;
    archivedAt?: string | null;
    actionUrl?: string | null;
    actorName?: string | null;
    bookingId?: string | null;
    serviceId?: string | null;
    serviceIcon?: string | null;
    serviceName?: string | null;
    data?: Record<string, unknown> | null;
    metadata?: Record<string, unknown> | null;
  }[];
  helpCenter: unknown;
  feedback: unknown[];
  supportTickets: unknown[];
  notificationDevices: {
    id: string;
    tokenPreview: string;
    platform: string;
    client: string;
    deviceId: string | null;
    enabled: boolean;
    lastSeenAt: string;
    createdAt: string;
    updatedAt: string;
  }[];
  paymentExportJobs: PaymentExportJob[];
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const MOCK_ACCESS_TOKEN = "mockup-local-access-token";
const state = copy(mockData) as MockData;

function copy<T>(value: T): T {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function handled<T>(data: T): MockApiResult<T> {
  return { handled: true, data: copy(data) };
}

function unhandled<T>(): MockApiResult<T> {
  return { handled: false };
}

function mockError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

function normalizeEndpoint(endpoint: string) {
  const [path] = endpoint.split("?");
  return path.startsWith("/") ? path : `/${path}`;
}

function methodOf(options: MockApiOptions): ApiMethod {
  return options.method ?? "GET";
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    (typeof FormData === "undefined" || !(value instanceof FormData))
  );
}

function bodyRecord(options: MockApiOptions): Record<string, unknown> {
  return isObjectRecord(options.body) ? options.body : {};
}

function numberQuery(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function lower(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function parseDateMs(value: string) {
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, month, day, year] = match;
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
  }
  return new Date(value).getTime();
}

function isSameOrAfter(value: string, start?: unknown) {
  if (!start) return true;
  return parseDateMs(value) >= parseDateMs(String(start));
}

function isSameOrBefore(value: string, end?: unknown) {
  if (!end) return true;
  return parseDateMs(value) <= parseDateMs(String(end));
}

function isBookingInRange(booking: Booking, start?: unknown, end?: unknown) {
  if (!start && !end) return true;
  const bookingStart = parseDateMs(booking.startDate);
  const bookingEnd = parseDateMs(booking.endDate);
  const rangeStart = start ? parseDateMs(String(start)) : Number.NEGATIVE_INFINITY;
  const rangeEnd = end ? parseDateMs(String(end)) : rangeStart;
  return bookingEnd >= rangeStart && bookingStart <= rangeEnd;
}

function sortRows<T extends Record<string, unknown>>(
  rows: T[],
  key?: unknown,
  direction?: unknown,
) {
  if (!key) return rows;
  const sortKey = String(key);
  const multiplier = direction === "desc" ? -1 : 1;

  return [...rows].sort((first, second) => {
    const firstValue = first[sortKey];
    const secondValue = second[sortKey];
    let comparison = 0;

    if (typeof firstValue === "number" && typeof secondValue === "number") {
      comparison = firstValue - secondValue;
    } else if (sortKey.toLowerCase().includes("date")) {
      comparison =
        parseDateMs(String(firstValue ?? "")) - parseDateMs(String(secondValue ?? ""));
    } else {
      comparison = String(firstValue ?? "").localeCompare(String(secondValue ?? ""));
    }

    return comparison * multiplier;
  });
}

function paginate<T>(
  rows: T[],
  pageQuery?: unknown,
  limitQuery?: unknown,
): PaginatedResponse<T> {
  const limit = numberQuery(limitQuery, 10);
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Math.max(numberQuery(pageQuery, 1), 1), pages);
  const start = (page - 1) * limit;

  return {
    data: rows.slice(start, start + limit),
    pagination: {
      total,
      page,
      limit,
      pages,
    },
  };
}

function authResponse() {
  return {
    ...state.account.session,
    user: state.account.user,
  };
}

export function isMockAccountCredentials(email: string, password: string) {
  return lower(email) === state.account.email && password === state.account.password;
}

export function isMockAuthSession(session: MockAuthSessionLike | null) {
  if (!session) return false;
  const user = isObjectRecord(session.user) ? session.user : {};
  return (
    session.accessToken === MOCK_ACCESS_TOKEN ||
    user.id === state.account.user.id ||
    user.email === state.account.email
  );
}

export function isMockSignInRequest(endpoint: string, options: MockApiOptions) {
  if (normalizeEndpoint(endpoint) !== "/auth/sign-in") return false;
  if (methodOf(options) !== "POST") return false;
  const body = bodyRecord(options);
  return isMockAccountCredentials(String(body.email ?? ""), String(body.password ?? ""));
}

export function hasMockHandler(endpoint: string) {
  const path = normalizeEndpoint(endpoint);
  if (
    path === "/auth/sign-in" ||
    path === "/auth/sign-up" ||
    path === "/auth/me" ||
    path === "/auth/sign-out" ||
    path === "/dashboard/summary" ||
    path === "/dashboard/bookings/month" ||
    path === "/dashboard/widgets" ||
    path === "/business/profile" ||
    path === "/business/profile/logo" ||
    path === "/business/setup-warnings" ||
    path === "/business/services" ||
    path === "/services/catalog" ||
    path === "/bookings" ||
    path === "/bookings/batch/status" ||
    path === "/payments" ||
    path === "/payments/summary" ||
    path === "/payments/batch/refund" ||
    path === "/payments/export-jobs" ||
    path === "/inventory/items" ||
    path === "/inventory/catalog" ||
    path === "/billing/accounts" ||
    path === "/billing/banks" ||
    path === "/inbox/messages" ||
    path === "/notifications/devices" ||
    path === "/reports/application-stats" ||
    path === "/account/profile" ||
    path === "/account/profile/personal-id-card" ||
    path === "/account/security" ||
    path === "/account/mfa" ||
    path === "/account/notification-preferences" ||
    path === "/support/help-center" ||
    path === "/feedback" ||
    path === "/support/tickets" ||
    path === "/onboarding/business-information"
  ) {
    return true;
  }

  return (
    /^\/bookings\/[^/]+(\/status)?$/.test(path) ||
    /^\/payments\/[^/]+\/refund$/.test(path) ||
    /^\/payments\/export-jobs\/[^/]+$/.test(path) ||
    /^\/inventory\/items\/[^/]+(\/sell)?$/.test(path) ||
    /^\/business\/services\/[^/]+$/.test(path) ||
    /^\/billing\/accounts\/[^/]+(\/submit)?$/.test(path) ||
    /^\/inbox\/messages\/[^/]+\/read$/.test(path)
  );
}

function dashboardSummary() {
  const counts = {
    totalBookings: state.bookings.length,
    inProgress: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    accepted: 0,
  };

  state.bookings.forEach((booking) => {
    const status = lower(booking.status);
    if (status.includes("progress")) counts.inProgress += 1;
    else if (status.includes("completed")) counts.completed += 1;
    else if (status.includes("accepted")) counts.accepted += 1;
    else if (status.includes("pending")) counts.pending += 1;
    else if (status.includes("cancel")) counts.cancelled += 1;
  });

  return counts;
}

function dashboardWidgets() {
  const active = new Set(state.activeWidgetIds);
  return {
    activeWidgets: state.allWidgets.filter((widget) => active.has(widget.id)),
    inactiveWidgets: state.allWidgets.filter((widget) => !active.has(widget.id)),
  };
}

function paymentSummary(payments = state.payments): PaymentSummary {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyPayments = payments
    .filter((payment) => {
      const date = new Date(parseDateMs(payment.date));
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, payment) => sum + payment.amount, 0);
  const yearlyPayments = payments
    .filter((payment) => new Date(parseDateMs(payment.date)).getFullYear() === currentYear)
    .reduce((sum, payment) => sum + payment.amount, 0);

  return {
    monthlyPayments,
    yearlyPayments,
    itemsSold: payments.filter((payment) => payment.kind === "item").length,
    servicesDone: payments.filter((payment) => payment.kind === "service").length,
  };
}

function filteredPayments(query: MockApiOptions["query"]) {
  let rows = [...state.payments];

  if (query?.method) {
    rows = rows.filter((payment) => payment.method === query.method);
  }

  if (query?.kind) {
    rows = rows.filter((payment) => payment.kind === query.kind);
  }

  if (query?.search) {
    const search = lower(query.search);
    rows = rows.filter((payment) =>
      [payment.id, payment.customer, payment.item, payment.method]
        .map(lower)
        .some((value) => value.includes(search)),
    );
  }

  rows = rows.filter(
    (payment) =>
      isSameOrAfter(payment.date, query?.startDate) &&
      isSameOrBefore(payment.date, query?.endDate),
  );

  return sortRows(rows as unknown as Record<string, unknown>[], query?.sortBy, query?.sortOrder) as unknown as Payment[];
}

function filteredBookings(query: MockApiOptions["query"]) {
  let rows = [...state.bookings];

  if (query?.status) {
    rows = rows.filter((booking) => booking.status === query.status);
  }

  if (query?.search) {
    const search = lower(query.search);
    rows = rows.filter((booking) =>
      [
        booking.id,
        booking.serviceName,
        booking.name,
        booking.carMake,
        booking.carModel,
        booking.carYear,
        booking.status,
      ]
        .map(lower)
        .some((value) => value.includes(search)),
    );
  }

  rows = rows.filter((booking) =>
    isBookingInRange(booking, query?.startDate, query?.endDate),
  );

  return sortRows(rows as unknown as Record<string, unknown>[], query?.sortBy, query?.sortOrder) as unknown as Booking[];
}

function filteredInventory(query: MockApiOptions["query"]) {
  let rows = state.inventoryItems.filter((item) => item.status !== "archived");
  const fields: Array<keyof InventoryItem> = [
    "category",
    "brand",
    "type",
    "viscosity",
    "volume",
    "application",
  ];

  fields.forEach((field) => {
    const value = query?.[field];
    if (value) {
      rows = rows.filter((item) => item[field] === value);
    }
  });

  if (query?.search) {
    const search = lower(query.search);
    rows = rows.filter((item) =>
      [
        item.id,
        item.category,
        item.name,
        item.company,
        item.brand,
        item.type,
        item.specification,
        item.viscosity,
        item.capacity,
        item.volume,
        item.apiSpec,
        item.application,
      ]
        .map(lower)
        .some((value) => value.includes(search)),
    );
  }

  return rows;
}

function fileNameFromBody(body: unknown, fallback: string) {
  if (typeof FormData === "undefined" || !(body instanceof FormData)) {
    return fallback;
  }

  const file = body.get("file");
  if (file && typeof file === "object" && "name" in file) {
    return String(file.name);
  }

  return fallback;
}

function upsertPaymentExportJob(format: string, matchedCount: number): PaymentExportJob {
  const now = new Date().toISOString();
  const job: PaymentExportJob = {
    id: `export-${String(state.paymentExportJobs.length + 1).padStart(3, "0")}`,
    type: "payments",
    status: "completed",
    format,
    matchedCount,
    downloadUrl: null,
    errorMessage: null,
    createdAt: now,
    completedAt: now,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  state.paymentExportJobs.push(job);
  return job;
}

function updateBooking(id: string, status: string) {
  const booking = state.bookings.find((item) => item.id === id);
  if (!booking) throw mockError("Booking was not found.", 404);
  booking.status = status;
  return booking;
}

function handleBookings<T>(
  path: string,
  options: MockApiOptions,
): MockApiResult<T> {
  const method = methodOf(options);

  if (path === "/bookings" && method === "GET") {
    const rows = filteredBookings(options.query);
    return handled(paginate(rows, options.query?.page, options.query?.limit) as T);
  }

  if (path === "/bookings/batch/status" && method === "PATCH") {
    const body = bodyRecord(options);
    const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
    const status = String(body.status ?? "Pending");
    ids.forEach((id) => updateBooking(id, status));
    return handled({
      requested: ids.length,
      succeeded: ids.length,
      failed: 0,
      failedIds: [],
    } as T);
  }

  const statusMatch = path.match(/^\/bookings\/([^/]+)\/status$/);
  if (statusMatch && method === "PATCH") {
    const body = bodyRecord(options);
    return handled(updateBooking(decodeURIComponent(statusMatch[1]), String(body.status ?? "Pending")) as T);
  }

  const detailMatch = path.match(/^\/bookings\/([^/]+)$/);
  if (detailMatch && method === "GET") {
    const booking = state.bookings.find(
      (item) => item.id === decodeURIComponent(detailMatch[1]),
    );
    if (!booking) throw mockError("Booking was not found.", 404);
    return handled(booking as T);
  }

  return unhandled();
}

function handlePayments<T>(
  path: string,
  options: MockApiOptions,
): MockApiResult<T> {
  const method = methodOf(options);

  if (path === "/payments" && method === "GET") {
    const rows = filteredPayments(options.query);
    return handled({
      ...paginate(rows, options.query?.page, options.query?.limit),
      summary: paymentSummary(rows),
    } as T);
  }

  if (path === "/payments/summary" && method === "GET") {
    return handled(paymentSummary(filteredPayments(options.query)) as T);
  }

  if (path === "/payments/batch/refund" && method === "POST") {
    const body = bodyRecord(options);
    const ids = new Set(Array.isArray(body.ids) ? body.ids.map(String) : []);
    state.payments = state.payments.filter((payment) => !ids.has(payment.id));
    return handled({ refunded: ids.size } as T);
  }

  const refundMatch = path.match(/^\/payments\/([^/]+)\/refund$/);
  if (refundMatch && method === "POST") {
    const id = decodeURIComponent(refundMatch[1]);
    state.payments = state.payments.filter((payment) => payment.id !== id);
    return handled({ refunded: 1 } as T);
  }

  if (path === "/payments/export-jobs" && method === "POST") {
    const body = bodyRecord(options);
    const format = String(body.format ?? "excel");
    return handled(upsertPaymentExportJob(format, filteredPayments(options.query).length) as T);
  }

  const exportMatch = path.match(/^\/payments\/export-jobs\/([^/]+)$/);
  if (exportMatch && method === "GET") {
    const job = state.paymentExportJobs.find((item) => item.id === exportMatch[1]);
    if (!job) throw mockError("Export job was not found.", 404);
    return handled(job as T);
  }

  return unhandled();
}

function handleInventory<T>(
  path: string,
  options: MockApiOptions,
): MockApiResult<T> {
  const method = methodOf(options);

  if (path === "/inventory/items" && method === "GET") {
    const rows = filteredInventory(options.query);
    return handled(paginate(rows, options.query?.page, options.query?.limit) as T);
  }

  if (path === "/inventory/items" && method === "POST") {
    const body = bodyRecord(options) as Omit<InventoryItem, "id">;
    const item: InventoryItem = {
      ...body,
      id: `inv-${Date.now()}`,
      category: String(body.category ?? "General"),
      name: String(body.name ?? "New item"),
      price: Number(body.price ?? 0),
    };
    state.inventoryItems.push(item);
    return handled(item as T);
  }

  if (path === "/inventory/catalog" && method === "GET") {
    return handled(state.inventoryCatalog as T);
  }

  const sellMatch = path.match(/^\/inventory\/items\/([^/]+)\/sell$/);
  if (sellMatch && method === "POST") {
    const id = decodeURIComponent(sellMatch[1]);
    const body = bodyRecord(options);
    const item = state.inventoryItems.find((inventoryItem) => inventoryItem.id === id);
    if (!item) throw mockError("Inventory item was not found.", 404);

    const quantity = Math.max(1, Number(body.quantity ?? 1));
    item.quantity = Math.max(0, (item.quantity ?? 0) - quantity);
    const payment: Payment = {
      id: `PAY-MOCK-${String(state.payments.length + 1).padStart(4, "0")}`,
      customer: "Walk-in Customer",
      item: item.name,
      method: String(body.paymentMethod ?? "Cash"),
      date: new Date().toLocaleDateString("en-US"),
      amount: Number(body.unitPrice ?? item.price) * quantity,
      kind: "item",
    };
    state.payments.push(payment);
    const transaction: InventoryTransaction = {
      id: `txn-${String(state.inventoryTransactions.length + 1).padStart(3, "0")}`,
      inventoryItemId: item.id,
      type: "sale",
      quantity,
      unitPrice: Number(body.unitPrice ?? item.price),
      paymentId: payment.id,
      note: "Mock sale",
      createdAt: new Date().toISOString(),
    };
    state.inventoryTransactions.push(transaction);
    return handled({ item, transaction, payment } as T);
  }

  const itemMatch = path.match(/^\/inventory\/items\/([^/]+)$/);
  if (itemMatch) {
    const id = decodeURIComponent(itemMatch[1]);
    const item = state.inventoryItems.find((inventoryItem) => inventoryItem.id === id);
    if (!item) throw mockError("Inventory item was not found.", 404);

    if (method === "PATCH") {
      Object.assign(item, bodyRecord(options));
      return handled(item as T);
    }

    if (method === "DELETE") {
      item.status = "archived";
      return handled(undefined as T);
    }
  }

  return unhandled();
}

function handleBusiness<T>(
  path: string,
  options: MockApiOptions,
): MockApiResult<T> {
  const method = methodOf(options);

  if (path === "/business/profile" && method === "GET") {
    return handled(state.account.businessProfile as T);
  }

  if (path === "/business/profile" && method === "PATCH") {
    Object.assign(state.account.businessProfile, bodyRecord(options));
    return handled(state.account.businessProfile as T);
  }

  if (path === "/business/profile/logo" && method === "PUT") {
    state.account.businessProfile.logoFileName = fileNameFromBody(
      options.body,
      "mockup-auto-service-logo.png",
    );
    state.account.businessProfile.logoUrl = "/assets/profile_img.svg";
    return handled(state.account.businessProfile as T);
  }

  if (path === "/business/setup-warnings" && method === "GET") {
    return handled(state.setupWarnings as T);
  }

  if (path === "/business/services" && method === "GET") {
    return handled(state.businessServices as T);
  }

  if (path === "/business/services" && method === "POST") {
    const body = bodyRecord(options);
    const service: BusinessService = {
      id: `svc-${Date.now()}`,
      category: String(body.category ?? "General Maintenance"),
      name: String(body.name ?? "New service"),
      price: Number(body.price ?? 0),
      currency: String(body.currency ?? "USD"),
      status: String(body.status ?? "active"),
    };
    state.businessServices.push(service);
    return handled(service as T);
  }

  const serviceMatch = path.match(/^\/business\/services\/([^/]+)$/);
  if (serviceMatch) {
    const service = state.businessServices.find((item) => item.id === serviceMatch[1]);
    if (!service) throw mockError("Service was not found.", 404);

    if (method === "PATCH") {
      Object.assign(service, bodyRecord(options));
      return handled(service as T);
    }

    if (method === "DELETE") {
      state.businessServices = state.businessServices.filter(
        (item) => item.id !== service.id,
      );
      return handled(undefined as T);
    }
  }

  if (path === "/services/catalog" && method === "GET") {
    return handled(state.serviceCatalog as T);
  }

  return unhandled();
}

function handleAccount<T>(
  path: string,
  options: MockApiOptions,
): MockApiResult<T> {
  const method = methodOf(options);

  if (path === "/account/profile" && method === "GET") {
    return handled(state.account.ownerProfile as T);
  }

  if (path === "/account/profile" && method === "PATCH") {
    Object.assign(state.account.ownerProfile, bodyRecord(options));
    return handled(state.account.ownerProfile as T);
  }

  if (path === "/account/profile/personal-id-card" && method === "PUT") {
    state.account.ownerProfile.personalIdFileName = fileNameFromBody(
      options.body,
      "mockup-owner-id.pdf",
    );
    state.account.ownerProfile.personalIdReviewStatus = "pending";
    return handled(state.account.ownerProfile as T);
  }

  if (path === "/account/security" && method === "GET") {
    return handled(state.account.security as T);
  }

  if (path === "/account/security" && method === "PATCH") {
    const body = bodyRecord(options);
    const preferences = isObjectRecord(body.preferences) ? body.preferences : {};
    state.account.security.preferences = state.account.security.preferences.map(
      (preference) => ({
        ...preference,
        enabled:
          typeof preferences[preference.key] === "boolean"
            ? Boolean(preferences[preference.key])
            : preference.enabled,
      }),
    );
    return handled(state.account.security as T);
  }

  if (path === "/account/mfa" && method === "PUT") {
    const body = bodyRecord(options);
    state.account.security.mfa = {
      ...state.account.security.mfa,
      enabled: Boolean(body.enabled),
      method: body.enabled
        ? (String(body.method ?? "authenticator") as "sms" | "authenticator")
        : null,
      phone: body.enabled ? String(body.phone ?? "") || null : null,
      verifiedAt: body.enabled ? new Date().toISOString() : null,
    };
    state.account.user.twoFactorEnabled = state.account.security.mfa.enabled;
    return handled(state.account.security.mfa as T);
  }

  if (path === "/account/notification-preferences" && method === "GET") {
    return handled({ preferences: state.account.notificationPreferences } as T);
  }

  if (path === "/account/notification-preferences" && method === "PUT") {
    const body = bodyRecord(options);
    const preferences = isObjectRecord(body.preferences) ? body.preferences : {};
    state.account.notificationPreferences = state.account.notificationPreferences.map(
      (preference) => ({
        ...preference,
        enabled:
          typeof preferences[preference.key] === "boolean"
            ? Boolean(preferences[preference.key])
            : preference.enabled,
      }),
    );
    return handled({ preferences: state.account.notificationPreferences } as T);
  }

  return unhandled();
}

function handleBilling<T>(
  path: string,
  options: MockApiOptions,
): MockApiResult<T> {
  const method = methodOf(options);

  if (path === "/billing/accounts" && method === "GET") {
    return handled(state.billingAccounts as T);
  }

  if (path === "/billing/accounts" && method === "POST") {
    const account = {
      ...bodyRecord(options),
      id: `bill-${Date.now()}`,
    } as MockData["billingAccounts"][number];
    state.billingAccounts.push(account);
    return handled(account as T);
  }

  if (path === "/billing/banks" && method === "GET") {
    return handled(state.supportedBanks as T);
  }

  const accountMatch = path.match(/^\/billing\/accounts\/([^/]+)(\/submit)?$/);
  if (accountMatch) {
    const account = state.billingAccounts.find((item) => item.id === accountMatch[1]);
    if (!account) throw mockError("Billing account was not found.", 404);

    if (method === "PATCH") {
      Object.assign(account, bodyRecord(options));
      return handled(account as T);
    }

    if (method === "POST" && accountMatch[2] === "/submit") {
      account.status = "submitted";
      return handled(account as T);
    }
  }

  return unhandled();
}

function handleInboxAndDevices<T>(
  path: string,
  options: MockApiOptions,
): MockApiResult<T> {
  const method = methodOf(options);

  if (path === "/inbox/messages" && method === "GET") {
    let rows = [...state.inboxMessages];
    if (options.query?.status) {
      rows = rows.filter((message) => message.status === options.query?.status);
    }
    return handled(paginate(rows, options.query?.page, options.query?.limit) as T);
  }

  const readMatch = path.match(/^\/inbox\/messages\/([^/]+)\/read$/);
  if (readMatch && method === "POST") {
    const message = state.inboxMessages.find((item) => item.id === readMatch[1]);
    if (!message) throw mockError("Message was not found.", 404);
    message.status = "read";
    message.readAt = new Date().toISOString();
    return handled(message as T);
  }

  if (path === "/notifications/devices" && method === "GET") {
    return handled({ data: state.notificationDevices } as T);
  }

  if (path === "/notifications/devices" && method === "POST") {
    const body = bodyRecord(options);
    const now = new Date().toISOString();
    const device = {
      id: `device-${Date.now()}`,
      tokenPreview: `${String(body.token ?? "mock-token").slice(0, 10)}...mock`,
      platform: String(body.platform ?? "web"),
      client: String(body.client ?? "website"),
      deviceId: typeof body.deviceId === "string" ? body.deviceId : null,
      enabled: true,
      lastSeenAt: now,
      createdAt: now,
      updatedAt: now,
    };
    state.notificationDevices.push(device);
    return handled(device as T);
  }

  if (path === "/notifications/devices" && method === "DELETE") {
    const before = state.notificationDevices.filter((device) => device.enabled).length;
    state.notificationDevices = state.notificationDevices.map((device) => ({
      ...device,
      enabled: false,
      updatedAt: new Date().toISOString(),
    }));
    return handled({ disabled: before } as T);
  }

  return unhandled();
}

function handleMisc<T>(
  path: string,
  options: MockApiOptions,
): MockApiResult<T> {
  const method = methodOf(options);

  if (path === "/reports/application-stats" && method === "GET") {
    const period = String(options.query?.period ?? "week");
    return handled((state.reports[period] ?? state.reports.week) as T);
  }

  if (path === "/support/help-center" && method === "GET") {
    return handled(state.helpCenter as T);
  }

  if (path === "/feedback" && method === "POST") {
    state.feedback.push({
      ...bodyRecord(options),
      id: `feedback-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    return handled({ ok: true } as T);
  }

  if (path === "/support/tickets" && method === "POST") {
    const ticket = {
      ...bodyRecord(options),
      id: `ticket-${Date.now()}`,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    state.supportTickets.push(ticket);
    return handled(ticket as T);
  }

  if (path === "/onboarding/business-information" && method === "POST") {
    const body = bodyRecord(options);
    state.account.businessProfile.name = String(
      body.businessName ?? state.account.businessProfile.name,
    );
    state.account.businessProfile.businessType = String(
      body.businessType ?? state.account.businessProfile.businessType ?? "",
    );
    state.account.businessProfile.employeeCount = String(
      body.employeeCount ?? state.account.businessProfile.employeeCount ?? "",
    );
    if (isObjectRecord(body.location)) {
      state.account.businessProfile.address = {
        ...state.account.businessProfile.address,
        ...body.location,
      };
    }
    state.account.businessProfile.onboardingCompleted = true;
    state.account.user.onboardingCompleted = true;
    return handled({ ok: true } as T);
  }

  return unhandled();
}

export async function handleMockApiRequest<T>(
  endpoint: string,
  options: MockApiOptions,
): Promise<MockApiResult<T>> {
  const path = normalizeEndpoint(endpoint);
  const method = methodOf(options);

  if (path === "/auth/sign-in" && method === "POST") {
    const body = bodyRecord(options);
    if (!isMockAccountCredentials(String(body.email ?? ""), String(body.password ?? ""))) {
      return unhandled();
    }
    return handled(authResponse() as T);
  }

  if (path === "/auth/sign-up" && method === "POST") {
    return handled(authResponse() as T);
  }

  if (path === "/auth/me" && method === "GET") {
    return handled(state.account.user as T);
  }

  if (path === "/auth/sign-out" && method === "POST") {
    return handled(undefined as T);
  }

  if (path === "/dashboard/summary" && method === "GET") {
    return handled(dashboardSummary() as T);
  }

  if (path === "/dashboard/bookings/month" && method === "GET") {
    const year = Number(options.query?.year ?? new Date().getFullYear());
    const month = Number(options.query?.month ?? new Date().getMonth());
    const monthStart = new Date(year, month, 1).getTime();
    const monthEnd = new Date(year, month + 1, 0).getTime();
    const bookings = state.bookings.filter(
      (booking) =>
        parseDateMs(booking.endDate) >= monthStart &&
        parseDateMs(booking.startDate) <= monthEnd,
    );
    return handled({ year, month, bookings } as T);
  }

  if (path === "/dashboard/widgets" && method === "GET") {
    return handled(dashboardWidgets() as T);
  }

  if (path === "/dashboard/widgets" && method === "PUT") {
    const body = bodyRecord(options);
    state.activeWidgetIds = Array.isArray(body.activeWidgetIds)
      ? body.activeWidgetIds.map(String)
      : state.activeWidgetIds;
    return handled(dashboardWidgets() as T);
  }

  const handlers = [
    handleBookings,
    handlePayments,
    handleInventory,
    handleBusiness,
    handleAccount,
    handleBilling,
    handleInboxAndDevices,
    handleMisc,
  ];

  for (const handler of handlers) {
    const result = handler<T>(path, options);
    if (result.handled) {
      return result;
    }
  }

  return unhandled();
}
