"use client";

import { useMemo, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { RiSearch2Line } from "react-icons/ri";
import { useInventory } from "@/application/hooks/useInventory";
import { useToastNotifications } from "@/application/hooks/useToastNotifications";
import type { InventoryItem } from "@/domain/entities/Inventory";
import Dropdown from "@/presentation/components/Dropdown/Dropdown";
import InventoryActionDialog from "@/presentation/components/inventory/InventoryActionDialog";
import InventoryStockOverlay from "@/presentation/components/inventory/InventoryStockOverlay";
import ToastContainer from "@/presentation/components/Toast/Toast";
import styles from "./inventory.module.css";

type EditorState =
  | { mode: "new" }
  | { mode: "edit"; item: InventoryItem }
  | null;

type ActionState = {
  mode: "delete" | "sell";
  item: InventoryItem;
} | null;

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort(
    (first, second) => first.localeCompare(second),
  );
}

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

function matchesSearch(item: InventoryItem, search: string) {
  if (!search.trim()) return true;

  const normalizedSearch = search.trim().toLocaleLowerCase();
  return [
    item.name,
    item.category,
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
    .filter(Boolean)
    .some((value) => value!.toLocaleLowerCase().includes(normalizedSearch));
}

export default function StorageInventoryView() {
  const inventory = useInventory();
  const { notifications, dismissNotification, showNotification } =
    useToastNotifications();
  const [brand, setBrand] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [viscosity, setViscosity] = useState<string | null>(null);
  const [volume, setVolume] = useState<string | null>(null);
  const [application, setApplication] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<EditorState>(null);
  const [action, setAction] = useState<ActionState>(null);

  const filterOptions = useMemo(
    () => ({
      brands: uniqueValues(
        inventory.stockedItems.map((item) => item.brand ?? item.company),
      ),
      types: uniqueValues(inventory.stockedItems.map((item) => item.type)),
      viscosities: uniqueValues(
        inventory.stockedItems.map(
          (item) => item.viscosity ?? item.specification,
        ),
      ),
      volumes: uniqueValues(
        inventory.stockedItems.map((item) => item.volume ?? item.capacity),
      ),
      applications: uniqueValues(
        inventory.stockedItems.map((item) => item.application),
      ),
    }),
    [inventory.stockedItems],
  );

  const filteredItems = useMemo(
    () =>
      inventory.stockedItems.filter(
        (item) =>
          (!brand || (item.brand ?? item.company) === brand) &&
          (!type || item.type === type) &&
          (!viscosity ||
            (item.viscosity ?? item.specification) === viscosity) &&
          (!volume || (item.volume ?? item.capacity) === volume) &&
          (!application || item.application === application) &&
          matchesSearch(item, search),
      ),
    [
      application,
      brand,
      inventory.stockedItems,
      search,
      type,
      viscosity,
      volume,
    ],
  );

  async function handleStockSave(itemId: string, quantity: number) {
    if (editor?.mode === "edit") {
      await inventory.updateAmount(itemId, quantity);
      showNotification("Inventory amount updated successfully.", "success");
      return;
    }

    await inventory.addItem(itemId, quantity);
    showNotification("Item added to inventory successfully.", "success");
  }

  async function handleActionConfirm(quantity?: number) {
    if (!action) return;

    if (action.mode === "delete") {
      await inventory.removeItem(action.item.id);
      showNotification("Item removed from inventory.", "success");
      return;
    }

    const soldQuantity = quantity ?? 1;
    const result = await inventory.sellItem(action.item.id, soldQuantity);
    showNotification(
      `${soldQuantity} × ${action.item.name} sold. Payment ${result.payment.id} was recorded.`,
      "success",
      "storageItemSold",
    );
  }

  const overlayTemplates =
    editor?.mode === "edit" ? [editor.item] : inventory.unstockedTemplates;

  return (
    <div className={styles.wrapper}>
      <ToastContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Dropdown
            options={filterOptions.brands}
            selected={brand}
            onSelect={setBrand}
            label="Brand"
          />
          <Dropdown
            options={filterOptions.types}
            selected={type}
            onSelect={setType}
            label="Type"
          />
          <Dropdown
            options={filterOptions.viscosities}
            selected={viscosity}
            onSelect={setViscosity}
            label="Viscosity"
          />
          <Dropdown
            options={filterOptions.volumes}
            selected={volume}
            onSelect={setVolume}
            label="Volume"
          />
          <Dropdown
            options={filterOptions.applications}
            selected={application}
            onSelect={setApplication}
            label="Application"
          />
          <div className={styles.searchBar}>
            <RiSearch2Line />
            <input
              type="text"
              placeholder="Search"
              aria-label="Search inventory"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={() => setEditor({ mode: "new" })}
        >
          New item
        </button>
      </div>

      {inventory.isLoading ? (
        <div className={styles.emptyState}>Loading inventory…</div>
      ) : inventory.loadError ? (
        <div className={styles.emptyState}>
          <p>{inventory.loadError}</p>
          <button type="button" onClick={() => void inventory.reload()}>
            Try again
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <p>
            {inventory.stockedItems.length === 0
              ? "No items are in storage yet. Add one from your Settings item templates."
              : "No inventory items match these filters."}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onSell={() => setAction({ mode: "sell", item })}
              onEdit={() => setEditor({ mode: "edit", item })}
              onDelete={() => setAction({ mode: "delete", item })}
            />
          ))}
        </div>
      )}

      {editor && (
        <InventoryStockOverlay
          key={editor.mode === "edit" ? editor.item.id : "new-item"}
          mode={editor.mode}
          item={editor.mode === "edit" ? editor.item : null}
          templates={overlayTemplates}
          onClose={() => setEditor(null)}
          onSave={handleStockSave}
        />
      )}

      {action && (
        <InventoryActionDialog
          key={`${action.mode}-${action.item.id}`}
          mode={action.mode}
          item={action.item}
          onClose={() => setAction(null)}
          onConfirm={handleActionConfirm}
        />
      )}
    </div>
  );
}

function ProductCard({
  item,
  onSell,
  onEdit,
  onDelete,
}: {
  item: InventoryItem;
  onSell: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const image = item.imageUrl || "/assets/engine_service.svg";

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <img src={image} alt={item.name} />
      </div>
      <div className={styles.name}>{item.name}</div>
      <div className={styles.details}>
        <DetailRow label="Brand" value={item.brand ?? item.company} />
        <DetailRow label="Type" value={item.type} />
        <DetailRow
          label="Viscosity"
          value={item.viscosity ?? item.specification}
        />
        <DetailRow label="Volume" value={item.volume ?? item.capacity} />
        <DetailRow label="API Spec" value={item.apiSpec} />
        <DetailRow label="Application" value={item.application} />
        <DetailRow
          label="Price"
          value={formatMoney(item.price, item.currency)}
        />
        <DetailRow label="Delivery time" value={item.deliveryTime} />
        <DetailRow label="Amount" value={String(item.quantity ?? 0)} />
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.sellBtn} onClick={onSell}>
          Sell Product
        </button>
        <div className={styles.actionsRight}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label={`Edit ${item.name} amount`}
            onClick={onEdit}
          >
            <FiEdit2 />
          </button>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.deleteBtn}`}
            aria-label={`Remove ${item.name} from inventory`}
            onClick={onDelete}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </article>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>
        {value || "-"}
      </span>
    </div>
  );
}
