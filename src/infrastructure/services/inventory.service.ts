import { apiClient, type PaginatedResponse } from "@/infrastructure/api/client";
import type {
  InventoryItem,
  InventorySaleResult,
} from "@/domain/entities/Inventory";

export type { InventoryItem } from "@/domain/entities/Inventory";

export interface InventoryCatalogCategory {
  name: string;
  icon?: string;
  itemNames: string[];
  companies: string[];
  specifications: string[];
  capacities: string[];
  details: string[];
  usedInServices: string[];
}

export interface InventoryListQuery {
  category?: string | null;
  brand?: string | null;
  type?: string | null;
  viscosity?: string | null;
  volume?: string | null;
  application?: string | null;
  search?: string;
  page?: number;
  limit?: number;
}

export function listInventoryItems(query: InventoryListQuery = {}) {
  return apiClient<PaginatedResponse<InventoryItem>>("/inventory/items", {
    query: { ...query },
  });
}

export function createInventoryItem(payload: Omit<InventoryItem, "id">) {
  return apiClient<InventoryItem>("/inventory/items", {
    method: "POST",
    body: payload,
  });
}

export function updateInventoryItem(
  id: string,
  payload: Partial<Omit<InventoryItem, "id">>,
) {
  return apiClient<InventoryItem>(`/inventory/items/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteInventoryItem(id: string) {
  return apiClient<void>(`/inventory/items/${id}`, { method: "DELETE" });
}

export function sellInventoryItem(id: string, payload: {
  quantity: number;
  paymentMethod: string;
  unitPrice?: number | null;
  customerId?: string | null;
}) {
  return apiClient<InventorySaleResult>(`/inventory/items/${id}/sell`, {
    method: "POST",
    body: payload,
  });
}

export function getInventoryCatalog() {
  return apiClient<{ categories: InventoryCatalogCategory[] }>(
    "/inventory/catalog",
  );
}
