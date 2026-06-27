"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { InventoryItem } from "@/domain/entities/Inventory";
import {
  UnderlineDropdownInput,
  UnderlineTextInput,
} from "@/presentation/components/UnderlineInput";
import styles from "./InventoryStockOverlay.module.css";

function getTemplateLabel(item: InventoryItem) {
  const details = [
    item.company ?? item.brand,
    item.specification ?? item.viscosity,
    item.capacity ?? item.volume,
  ].filter(Boolean);

  return details.length > 0 ? `${item.name} · ${details.join(" · ")}` : item.name;
}

interface InventoryStockOverlayProps {
  mode: "new" | "edit";
  templates: InventoryItem[];
  item?: InventoryItem | null;
  onClose: () => void;
  onSave: (itemId: string, quantity: number) => Promise<void>;
}

export default function InventoryStockOverlay({
  mode,
  templates,
  item,
  onClose,
  onSave,
}: InventoryStockOverlayProps) {
  const [selectedItemId, setSelectedItemId] = useState(item?.id ?? "");
  const [quantity, setQuantity] = useState(
    item ? String(item.quantity ?? 0) : "",
  );
  const [quantityError, setQuantityError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const title = mode === "edit" ? "Edit inventory item" : "New item";

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsedQuantity = Number(quantity);
    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1 ||
      !Number.isSafeInteger(parsedQuantity)
    ) {
      setQuantityError("Enter a whole number greater than zero.");
      return;
    }

    if (!selectedItemId) {
      setFormError("Select an item first.");
      return;
    }

    setQuantityError(undefined);
    setIsSaving(true);

    try {
      await onSave(selectedItemId, parsedQuantity);
      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save this item.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const options = templates.map((template) => ({
    value: template.id,
    label: getTemplateLabel(template),
  }));

  return (
    <section
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-stock-title"
    >
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close inventory editor"
        onClick={onClose}
        disabled={isSaving}
      />

      <div className={styles.panelWrapper}>
        <form className={styles.panel} onSubmit={handleSubmit}>
          <header>
            <h2 id="inventory-stock-title" className={styles.title}>
              {title}
            </h2>
            <p className={styles.description}>
              {mode === "edit"
                ? "Change the amount currently available in storage."
                : "Choose an item created in Settings and add its opening amount."}
            </p>
          </header>

          <div className={styles.fields}>
            {mode === "edit" && item ? (
              <div className={styles.readonlyField}>
                <span>Item</span>
                <strong>{getTemplateLabel(item)}</strong>
              </div>
            ) : (
              <UnderlineDropdownInput
                label="Item"
                placeholder="Select an item"
                options={options}
                value={selectedItemId}
                onChange={setSelectedItemId}
              />
            )}

            <UnderlineTextInput
              label="Amount"
              placeholder="Ex: 25"
              type="number"
              value={quantity}
              onChange={(value) => {
                setQuantity(value);
                setQuantityError(undefined);
              }}
              error={quantityError}
            />
          </div>

          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSaving || options.length === 0}
            >
              {isSaving ? "Saving…" : mode === "edit" ? "Save changes" : "Add item"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
