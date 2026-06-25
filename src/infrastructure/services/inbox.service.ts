import { apiClient, type PaginatedResponse } from "@/infrastructure/api/client";

export interface InboxMessage {
  id: string;
  title: string;
  body: string;
  status: string;
  type: string;
  createdAt: string;
  readAt?: string | null;
}

export function listInboxMessages(query: {
  status?: string | null;
  page?: number;
  limit?: number;
} = {}) {
  return apiClient<PaginatedResponse<InboxMessage>>("/inbox/messages", {
    query,
  });
}

export function markInboxMessageRead(id: string) {
  return apiClient<InboxMessage>(`/inbox/messages/${id}/read`, {
    method: "POST",
  });
}
