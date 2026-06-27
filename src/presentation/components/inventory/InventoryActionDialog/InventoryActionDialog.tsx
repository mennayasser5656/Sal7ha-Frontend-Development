"use client";

import { useEffect, useState } from "react";
import { FiAlertTriangle, FiShoppingCart } from "react-icons/fi";
import type { InventoryItem } from "@/domain/entities/Inventory";
import { UnderlineTextInput } from "@/presentation/components/UnderlineInput";
import styles from "./InventoryActionDialog.module.css";

function formatMoney(value: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

interface InventoryActionDialogProps {
  mode: "delete" | "sell";
  item: InventoryItem;
  onClose: () => void;
  onConfirm: (quantity?: number) => Promise<void>;
}

export default function InventoryActionDialog({
  mode,
  item,
  onClose,
  onConfirm,
}: InventoryActionDialogProps) {
  const [quantity, setQuantity] = useState("1");
  const [quantityError, setQuantityError] = useState<string | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const available = item.quantity ?? 0;
  const numericQuantity = Number(quantity);
  const total = Number.isFinite(numericQuantity)
    ? item.price * numericQuantity
    : 0;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

  async function handleConfirm() {
    setActionError(null);

    if (mode === "sell") {
      if (
        !Number.isInteger(numericQuantity) ||
        numericQuantity < 1 ||
        numericQuantity > available
      ) {
        setQuantityError(`Enter a whole number from 1 to ${available}.`);
        return;
      }
    }

    setQuantityError(undefined);
    setIsSubmitting(true);

    try {
      await onConfirm(mode === "sell" ? numericQuantity : undefined);
      onClose();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not complete this action.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDelete = mode === "delete";

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-action-title"
    >
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close confirmation"
        onClick={onClose}
        disabled={isSubmitting}
      />

      <section className={styles.dialog}>
        <span
          className={`${styles.icon} ${isDelete ? styles.warningIcon : styles.sellIcon}`}
          aria-hidden="true"
        >
          {isDelete ? <FiAlertTriangle /> : <FiShoppingCart />}
        </span>
        <h2 id="inventory-action-title" className={styles.title}>
          {isDelete ? "Remove item from inventory?" : `Sell ${item.name}?`}
        </h2>
        <p className={styles.description}>
          {isDelete
            ? `${item.name} will be removed from storage. Its template will stay available in Settings.`
            : "Choose the amount to sell, then confirm the payment."}
        </p>

        {mode === "sell" && (
          <div className={styles.saleDetails}>
            <UnderlineTextInput
              label="Amount to sell"
              placeholder="Ex: 1"
              type="number"
              value={quantity}
              onChange={(value) => {
                setQuantity(value);
                setQuantityError(undefined);
              }}
              error={quantityError}
            />
            <dl className={styles.summary}>
              <div>
                <dt>Available</dt>
                <dd>{available}</dd>
              </div>
              <div>
                <dt>Payment method</dt>
                <dd>Cash</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{formatMoney(Math.max(0, total), item.currency)}</dd>
              </div>
            </dl>
          </div>
        )}

        {actionError && (
          <p className={styles.actionError} role="alert">
            {actionError}
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={isDelete ? styles.deleteButton : styles.confirmButton}
            onClick={() => void handleConfirm()}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Please wait…"
              : isDelete
                ? "Remove item"
                : "Confirm sale"}
          </button>
        </div>
      </section>
    </div>
  );
}
