import {
  apiClient,
  clearStoredAuthSession,
  getStoredAuthSession,
  setStoredAuthSession,
  type AuthSession,
} from "./client";

export interface AuthUser {
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

export interface AuthResponse extends AuthSession {
  access_token?: string;
  user: AuthUser;
}

export interface BusinessSignUpPayload {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  country: string;
  city: string;
  commercialRegistrationNumber?: number;
  commercialRegistraionNumber?: number;
  taxIdentificationNumber: number;
  businessOwner: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    streetAddress: string;
    country: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

function persistAuth(response: AuthResponse) {
  setStoredAuthSession({
    accessToken: response.accessToken ?? response.access_token ?? "",
    refreshToken: response.refreshToken,
    expiresIn: response.expiresIn,
    tokenType: response.tokenType,
    user: response.user,
  });
  return response;
}

export const authApi = {
  signIn(payload: {
    email: string;
    password: string;
    rememberMe?: boolean;
    role?: "business";
  }) {
    return apiClient<AuthResponse>("/auth/sign-in", {
      method: "POST",
      auth: false,
      body: { ...payload, role: payload.role ?? "business" },
    }).then(persistAuth);
  },

  signUp(payload: BusinessSignUpPayload) {
    return apiClient<AuthResponse>("/auth/sign-up", {
      method: "POST",
      auth: false,
      body: payload,
    }).then(persistAuth);
  },

  me() {
    return apiClient<AuthUser>("/auth/me");
  },

  async signOut() {
    const refreshToken = getStoredAuthSession()?.refreshToken;
    try {
      await apiClient<void>("/auth/sign-out", {
        method: "POST",
        body: refreshToken ? { refreshToken } : undefined,
        retryOnUnauthorized: false,
      });
    } finally {
      clearStoredAuthSession();
    }
  },
};
