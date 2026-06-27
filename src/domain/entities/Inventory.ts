import type { Payment } from "./Payment";

export type InventoryItemStatus = "active" | "inactive" | "archived";

export interface InventoryItem {
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
  status?: InventoryItemStatus | (string & {});
}

export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  type: "purchase" | "sale" | "adjustment" | "return";
  quantity: number;
  unitPrice?: number | null;
  paymentId?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface InventorySaleResult {
  item: InventoryItem;
  transaction: InventoryTransaction;
  payment: Payment;
}
