  const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "http://localhost:3334";

const AUTH_STORAGE_KEY = "car-service-admin:auth-session";
const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_JWT_COOKIE_NAME ??
  process.env.JWT_COOKIE_NAME ??
  "shop_access_token";

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: ApiMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
  headers?: HeadersInit;
}

export interface ApiPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: ApiPagination;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
  user?: unknown;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeEndpoint(endpoint: string) {
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
}

function buildUrl(endpoint: string, query?: ApiRequestOptions["query"]) {
  const url = new URL(`${BASE_URL}${normalizeEndpoint(endpoint)}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

function readStoredSession(): AuthSession | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function writeAuthCookie(token: string | null) {
  if (!isBrowser()) return;

  if (!token) {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }

  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(
    token,
  )}; path=/; SameSite=Lax`;
}

export function getStoredAuthSession(): AuthSession | null {
  return readStoredSession();
}

export function getAccessToken(): string | null {
  return readStoredSession()?.accessToken ?? null;
}

export function setStoredAuthSession(session: AuthSession) {
  if (!isBrowser()) return;

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  writeAuthCookie(session.accessToken);
}

export function clearStoredAuthSession() {
  if (!isBrowser()) return;

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  writeAuthCookie(null);
}

async function refreshSession() {
  const session = readStoredSession();
  if (!session?.refreshToken) return null;

  const response = await fetch(buildUrl("/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });

  if (!response.ok) {
    clearStoredAuthSession();
    return null;
  }

  const refreshed = (await response.json()) as Partial<AuthSession> & {
    access_token?: string;
  };

  const nextSession: AuthSession = {
    ...session,
    ...refreshed,
    accessToken: refreshed.accessToken ?? refreshed.access_token ?? "",
    refreshToken: refreshed.refreshToken ?? session.refreshToken,
  };

  if (!nextSession.accessToken) {
    clearStoredAuthSession();
    return null;
  }

  setStoredAuthSession(nextSession);
  return nextSession;
}

async function readError(response: Response) {
  try {
    const payload = await response.json();
    const message = Array.isArray(payload.message)
      ? payload.message.join(", ")
      : payload.message;
    return message ?? payload.error ?? "Something went wrong";
  } catch {
    return response.statusText || "Something went wrong";
  }
}

async function sendRequest<T>(
  endpoint: string,
  options: ApiRequestOptions,
  accessToken?: string | null,
): Promise<T> {
  const { body, method = "GET", query, auth = true, headers } = options;
  const token = accessToken ?? (auth ? getAccessToken() : null);

  const response = await fetch(buildUrl(endpoint, query), {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });

  if (!response.ok) {
    throw Object.assign(new Error(await readError(response)), {
      status: response.status,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function apiClient<T>(
  endpoint: string,
  optionsOrMethod: ApiRequestOptions | ApiMethod = {},
  body?: unknown,
  token?: string,
): Promise<T> {
  const options =
    typeof optionsOrMethod === "string"
      ? { method: optionsOrMethod, body }
      : optionsOrMethod;

  try {
    return await sendRequest<T>(endpoint, options, token);
  } catch (error) {
    const status =
      error instanceof Error && "status" in error
        ? (error as Error & { status?: number }).status
        : undefined;

    if (
      status === 401 &&
      options.auth !== false &&
      options.retryOnUnauthorized !== false
    ) {
      const session = await refreshSession();
      if (session?.accessToken) {
        return sendRequest<T>(endpoint, options, session.accessToken);
      }
    }

    throw error;
  }
}
