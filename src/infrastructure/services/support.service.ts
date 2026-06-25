import { apiClient } from "@/infrastructure/api/client";

export interface HelpCenterCategory {
  id: string;
  title: string;
  articles: {
    id: string;
    title: string;
    body: string;
  }[];
}

export function getHelpCenter(locale = "en") {
  return apiClient<{ categories: HelpCenterCategory[] }>("/support/help-center", {
    auth: false,
    query: { locale },
  });
}

export function createFeedback(payload: {
  message: string;
  rating?: number | null;
  page?: string | null;
}) {
  return apiClient("/feedback", {
    method: "POST",
    body: payload,
  });
}

export function createSupportTicket(payload: {
  subject: string;
  message: string;
  email?: string | null;
  priority?: "low" | "normal" | "high";
}) {
  return apiClient("/support/tickets", {
    method: "POST",
    body: payload,
  });
}
