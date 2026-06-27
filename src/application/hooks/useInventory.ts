import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  InventoryItem,
  InventorySaleResult,
} from "@/domain/entities/Inventory";
import {
  listInventoryItems,
  sellInventoryItem,
  updateInventoryItem,
} from "@/infrastructure/services/inventory.service";

function replaceItem(items: InventoryItem[], updatedItem: InventoryItem) {
  return items.map((item) =>
    item.id === updatedItem.id ? updatedItem : item,
  );
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await listInventoryItems({ page: 1, limit: 100 });
      setItems(response.data);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Could not load inventory.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const templates = useMemo(
    () => items.filter((item) => item.status !== "archived"),
    [items],
  );

  const stockedItems = useMemo(
    () => templates.filter((item) => (item.quantity ?? 0) > 0),
    [templates],
  );

  const unstockedTemplates = useMemo(
    () => templates.filter((item) => (item.quantity ?? 0) === 0),
    [templates],
  );

  const setQuantity = useCallback(async (itemId: string, quantity: number) => {
    const updatedItem = await updateInventoryItem(itemId, { quantity });
    setItems((current) => replaceItem(current, updatedItem));
    return updatedItem;
  }, []);

  const addItem = useCallback(
    (templateId: string, quantity: number) =>
      setQuantity(templateId, quantity),
    [setQuantity],
  );

  const updateAmount = useCallback(
    (itemId: string, quantity: number) => setQuantity(itemId, quantity),
    [setQuantity],
  );

  const removeItem = useCallback(
    (itemId: string) => setQuantity(itemId, 0),
    [setQuantity],
  );

  const sellItem = useCallback(
    async (itemId: string, quantity: number): Promise<InventorySaleResult> => {
      const result = await sellInventoryItem(itemId, {
        quantity,
        paymentMethod: "Cash",
      });
      setItems((current) => replaceItem(current, result.item));
      return result;
    },
    [],
  );

  return {
    templates,
    stockedItems,
    unstockedTemplates,
    isLoading,
    loadError,
    reload: loadItems,
    addItem,
    updateAmount,
    removeItem,
    sellItem,
  };
}
