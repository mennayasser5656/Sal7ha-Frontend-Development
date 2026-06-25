"use client";

import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { RiSearch2Line } from "react-icons/ri";
import { useToastNotifications } from "@/application/hooks/useToastNotifications";
import {
  deleteInventoryItem,
  listInventoryItems,
  sellInventoryItem,
  type InventoryItem,
} from "@/infrastructure/services/inventory.service";
import Dropdown from "@/presentation/components/Dropdown/Dropdown";
import ToastContainer from "@/presentation/components/Toast/Toast";
import styles from "./inventory.module.css";

interface Product {
  id: string;
  name: string;
  image: string;
  brand: string;
  type: string;
  viscosity: string;
  volume: string;
  apiSpec: string;
  application: string;
  purchasePrice: string;
  deliveryTime: string;
}

const BRANDS = ["Shell", "Mobil", "Castrol", "Total"];
const TYPES = ["Fully Synthetic", "Semi-Synthetic", "Mineral"];
const VISCOSITIES = ["0W-20", "5W-30", "5W-40", "10W-40"];
const VOLUMES = ["1L", "4L", "5L"];
const APPLICATIONS = ["Gasoline", "Diesel"];

function toProduct(item: InventoryItem): Product {
  return {
    id: item.id,
    name: item.name,
    image: item.imageUrl || "/assets/engine_service.svg",
    brand: item.brand ?? item.company ?? "",
    type: item.type ?? "",
    viscosity: item.viscosity ?? item.specification ?? "",
    volume: item.volume ?? item.capacity ?? "",
    apiSpec: item.apiSpec ?? "",
    application: item.application ?? "",
    purchasePrice: `$${item.purchasePrice ?? item.price}`,
    deliveryTime: item.deliveryTime ?? "",
  };
}

export default function StorageInventoryView() {
  const { notifications, dismissNotification, showNotification } =
    useToastNotifications();
  const [brand, setBrand] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [viscosity, setViscosity] = useState<string | null>(null);
  const [volume, setVolume] = useState<string | null>(null);
  const [application, setApplication] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      const response = await listInventoryItems({
        brand,
        type,
        viscosity,
        volume,
        application,
        search,
        page: 1,
        limit: 100,
      });
      if (!ignore) {
        setProducts(response.data.map(toProduct));
      }
    }

    void loadProducts();

    return () => {
      ignore = true;
    };
  }, [application, brand, search, type, viscosity, volume]);

  async function handleSell(product: Product) {
    await sellInventoryItem(product.id, {
      quantity: 1,
      paymentMethod: "Cash",
    });
    showNotification(
      `${product.name} sold successfully.`,
      "success",
      "storageItemSold",
    );
  }

  async function handleDelete(product: Product) {
    await deleteInventoryItem(product.id);
    setProducts((current) => current.filter((item) => item.id !== product.id));
  }

  return (
    <div className={styles.wrapper}>
      <ToastContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      <div className={styles.filters}>
        <Dropdown options={BRANDS} selected={brand} onSelect={setBrand} label="Brand" />
        <Dropdown options={TYPES} selected={type} onSelect={setType} label="Type" />
        <Dropdown
          options={VISCOSITIES}
          selected={viscosity}
          onSelect={setViscosity}
          label="Viscosity"
        />
        <Dropdown options={VOLUMES} selected={volume} onSelect={setVolume} label="Volume" />
        <Dropdown
          options={APPLICATIONS}
          selected={application}
          onSelect={setApplication}
          label="Application"
        />
        <div className={styles.searchBar}>
          <RiSearch2Line />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSell={() => void handleSell(product)}
            onDelete={() => void handleDelete(product)}
          />
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onSell,
  onDelete,
}: {
  product: Product;
  onSell: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <img src={product.image} alt={product.name} />
      </div>
      <div className={styles.name}>{product.name}</div>
      <div className={styles.details}>
        <DetailRow label="Brand" value={product.brand} />
        <DetailRow label="Type" value={product.type} />
        <DetailRow label="Viscosity" value={product.viscosity} />
        <DetailRow label="Volume" value={product.volume} />
        <DetailRow label="API Spec" value={product.apiSpec} />
        <DetailRow label="Application" value={product.application} />
        <DetailRow label="Purchase price" value={product.purchasePrice} />
        <DetailRow label="Delivery time" value={product.deliveryTime} />
      </div>
      <div className={styles.actions}>
        <button className={styles.sellBtn} onClick={onSell}>
          Sell Product
        </button>
        <div className={styles.actionsRight}>
          <button className={styles.iconBtn} aria-label="Edit product">
            <FiEdit2 />
          </button>
          <button
            className={`${styles.iconBtn} ${styles.deleteBtn}`}
            aria-label="Delete product"
            onClick={onDelete}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value || "-"}</span>
    </div>
  );
}
