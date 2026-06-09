"use client";

import { useState } from "react";
import { RiSearch2Line } from "react-icons/ri";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useToastNotifications } from "@/application/hooks/useToastNotifications";
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

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Shell Helix HX7",
    image: "/products_images/HX7-removebg-preview.png",
    brand: "Shell",
    type: "Semi-Synthetic",
    viscosity: "10W-40",
    volume: "4L",
    apiSpec: "SN",
    application: "Gasoline",
    purchasePrice: "from £28",
    deliveryTime: "2 Days",
  },
  {
    id: "2",
    name: "Shell Helix HX8",
    image: "/products_images/HX8-removebg-preview.png",
    brand: "Shell",
    type: "Fully Synthetic",
    viscosity: "5W-40",
    volume: "4L",
    apiSpec: "SN",
    application: "Gasoline",
    purchasePrice: "from £36",
    deliveryTime: "2 Days",
  },
  {
    id: "3",
    name: "Shell Helix Ultra",
    image: "/products_images/kisspng-motor-oil-total-s-a-engine-lubricant-diesel10-5b4c8758f15e75.8492894515317420409887-removebg-preview.png",
    brand: "Shell",
    type: "Fully Synthetic",
    viscosity: "5W-30",
    volume: "5L",
    apiSpec: "SP",
    application: "Gasoline",
    purchasePrice: "from £52",
    deliveryTime: "3 Days",
  },
  {
    id: "4",
    name: "Mobil Super",
    image: "/products_images/Mobil_Super-removebg-preview.png",
    brand: "Mobil",
    type: "Semi-Synthetic",
    viscosity: "10W-40",
    volume: "4L",
    apiSpec: "SL",
    application: "Gasoline",
    purchasePrice: "from £24",
    deliveryTime: "2 Days",
  },
  {
    id: "5",
    name: "Mobil Super 3000",
    image: "/products_images/mobile-super2-removebg-preview.png",
    brand: "Mobil",
    type: "Fully Synthetic",
    viscosity: "5W-40",
    volume: "4L",
    apiSpec: "SN",
    application: "Diesel",
    purchasePrice: "from £38",
    deliveryTime: "4 Days",
  },
  {
    id: "6",
    name: "Mobil 1 Ultra",
    image: "/products_images/Ultra1-removebg-preview.png",
    brand: "Mobil",
    type: "Fully Synthetic",
    viscosity: "0W-20",
    volume: "5L",
    apiSpec: "SP",
    application: "Gasoline",
    purchasePrice: "from £58",
    deliveryTime: "3 Days",
  },
];

export default function StorageInventoryView() {
  const { notifications, dismissNotification, showNotification } =
    useToastNotifications();
  const [brand, setBrand] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [viscosity, setViscosity] = useState<string | null>(null);
  const [volume, setVolume] = useState<string | null>(null);
  const [application, setApplication] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  return (
    <div className={styles.wrapper}>
      <ToastContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      <div className={styles.filters}>
        <Dropdown
          options={BRANDS}
          selected={brand}
          onSelect={setBrand}
          label="Brand"
        />
        <Dropdown
          options={TYPES}
          selected={type}
          onSelect={setType}
          label="Type"
        />
        <Dropdown
          options={VISCOSITIES}
          selected={viscosity}
          onSelect={setViscosity}
          label="Viscosity"
        />
        <Dropdown
          options={VOLUMES}
          selected={volume}
          onSelect={setVolume}
          label="Volume"
        />
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
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.grid}>
        {PRODUCTS.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSell={() =>
              showNotification(
                `${product.name} sold successfully.`,
                "success",
                "storageItemSold",
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onSell,
}: {
  product: Product;
  onSell: () => void;
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
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}
