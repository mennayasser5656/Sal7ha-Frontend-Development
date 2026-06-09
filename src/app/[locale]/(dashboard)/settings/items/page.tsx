"use client";

import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { useToastNotifications } from "@/application/hooks/useToastNotifications";
import {
  SettingsEditOverlay,
  type SettingsEditField,
} from "@/presentation/components/settings/SettingsEditOverlay";
import ToastContainer from "@/presentation/components/Toast/Toast";
import styles from "../services/services.module.css";

type InventoryItem = {
  id: string;
  category: string;
  name: string;
  company: string;
  specification: string;
  capacity: string;
  price: string;
  details: string;
  usedInServices: string;
};

const CATEGORY_ORDER = [
  "Oil",
  "Tires",
  "Batteries",
  "Filters",
  "Brake Products",
  "Coolants",
  "Wipers",
];

const CATEGORY_ICONS: Record<string, string> = {
  Oil: "/assets/engine_service.svg",
  Tires: "/assets/wheel_service.svg",
  Batteries: "/assets/battery_service.svg",
  Filters: "/assets/engine_service.svg",
  "Brake Products": "/assets/wheel_service.svg",
  Coolants: "/assets/engine_service.svg",
  Wipers: "/assets/paint_service.svg",
};

const ITEM_CATALOG: Record<string, string[]> = {
  Oil: [
    "Synthetic Engine Oil",
    "Semi-Synthetic Engine Oil",
    "Diesel Engine Oil",
    "Transmission Oil",
  ],
  Tires: [
    "All-Season Tire",
    "Performance Tire",
    "SUV Tire",
    "Commercial Tire",
  ],
  Batteries: [
    "Standard Car Battery",
    "AGM Battery",
    "EFB Battery",
    "Heavy Duty Battery",
  ],
  Filters: [
    "Oil Filter",
    "Air Filter",
    "Cabin Filter",
    "Fuel Filter",
  ],
  "Brake Products": [
    "Brake Pads",
    "Brake Fluid",
    "Brake Disc",
    "Brake Cleaner",
  ],
  Coolants: [
    "Engine Coolant",
    "Radiator Fluid",
    "Antifreeze",
    "Coolant Additive",
  ],
  Wipers: [
    "Front Wiper Blade",
    "Rear Wiper Blade",
    "Hybrid Wiper Blade",
    "Washer Fluid",
  ],
};

const SERVICE_USAGE_CATALOG: Record<string, string[]> = {
  Oil: ["Oil Change", "Engine Tune-Up", "Full Vehicle Inspection"],
  Tires: [
    "Tire Replacement",
    "Tire Rotation",
    "Wheel Alignment",
    "Flat Tire Repair",
  ],
  Batteries: [
    "Battery Replacement",
    "Wiring Diagnostics",
    "Full Vehicle Inspection",
  ],
  Filters: ["Oil Change", "Filter Replacement", "Full Vehicle Inspection"],
  "Brake Products": [
    "Brake Pad Replacement",
    "Brake Fluid Flush",
    "Disc Resurfacing",
  ],
  Coolants: ["Fluid Top-Up", "Engine Tune-Up", "Full Vehicle Inspection"],
  Wipers: ["Full Vehicle Inspection", "Car Wash & Detailing"],
};

const COMPANY_CATALOG: Record<string, string[]> = {
  Oil: ["Shell", "Mobil", "Total", "Castrol"],
  Tires: ["Michelin", "Bridgestone", "Pirelli", "Goodyear"],
  Batteries: ["ACDelco", "Varta", "Bosch", "Exide"],
  Filters: ["Mann-Filter", "Bosch", "Fram", "Wix"],
  "Brake Products": ["Brembo", "Bosch", "ATE", "TRW"],
  Coolants: ["Prestone", "Total", "Valvoline", "Mobil"],
  Wipers: ["Bosch", "Valeo", "Michelin", "Trico"],
};

const SPECIFICATION_CATALOG: Record<string, string[]> = {
  Oil: ["0W-20", "5W-30", "5W-40", "10W-40", "15W-40"],
  Tires: ["195/65 R15", "205/55 R16", "215/60 R16", "225/45 R17", "265/65 R17"],
  Batteries: ["45Ah", "60Ah", "70Ah", "80Ah", "95Ah"],
  Filters: ["Oil filter", "Air filter", "Cabin filter", "Fuel filter"],
  "Brake Products": ["Ceramic", "Semi-metallic", "DOT 3", "DOT 4", "Ventilated disc"],
  Coolants: ["Ready to use", "Concentrate", "Organic acid technology", "Hybrid coolant"],
  Wipers: ["16 inch", "18 inch", "20 inch", "22 inch", "24 inch", "26 inch"],
};

const CAPACITY_CATALOG: Record<string, string[]> = {
  Oil: ["1L", "4L", "5L", "20L"],
  Tires: ["Single tire", "Pair", "Set of 4"],
  Batteries: ["12V", "24V"],
  Filters: ["Single unit", "Pack of 2", "Pack of 4"],
  "Brake Products": ["Front axle set", "Rear axle set", "Single bottle", "Single disc"],
  Coolants: ["1L", "4L", "5L", "20L"],
  Wipers: ["Single blade", "Pair", "Front set"],
};

const DETAILS_CATALOG: Record<string, string[]> = {
  Oil: ["Helix HX7", "Helix HX8", "Mobil Super", "Quartz 9000", "Magnatec"],
  Tires: ["Primacy series", "Turanza series", "P Zero series", "EfficientGrip series"],
  Batteries: ["Start-stop compatible", "Maintenance free", "Heavy duty", "European vehicles"],
  Filters: ["Engine oil filter", "Dust protection", "Activated carbon", "Diesel fuel system"],
  "Brake Products": ["Low dust compound", "Quiet braking", "High temperature", "ABS compatible"],
  Coolants: ["All vehicles", "Long life", "Aluminum safe", "Mixed fleet"],
  Wipers: ["Hybrid blade", "Flat blade", "Conventional blade", "All-weather rubber"],
};

const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: "shell-helix-hx8",
    category: "Oil",
    name: "Synthetic Engine Oil",
    company: "Shell",
    specification: "5W-30",
    capacity: "4L",
    price: "$38",
    details: "Helix HX8",
    usedInServices: "Oil Change, Engine Tune-Up",
  },
  {
    id: "mobil-super-2000",
    category: "Oil",
    name: "Semi-Synthetic Engine Oil",
    company: "Mobil",
    specification: "10W-40",
    capacity: "4L",
    price: "$32",
    details: "Super 2000",
    usedInServices: "Oil Change, Full Vehicle Inspection",
  },
  {
    id: "michelin-primacy",
    category: "Tires",
    name: "All-Season Tire",
    company: "Michelin",
    specification: "205/55 R16",
    capacity: "Single tire",
    price: "$115",
    details: "Primacy series",
    usedInServices: "Tire Replacement, Tire Rotation",
  },
  {
    id: "bosch-agm",
    category: "Batteries",
    name: "AGM Battery",
    company: "Bosch",
    specification: "70Ah",
    capacity: "12V",
    price: "$140",
    details: "Start-stop compatible",
    usedInServices: "Battery Replacement, Wiring Diagnostics",
  },
  {
    id: "mann-oil-filter",
    category: "Filters",
    name: "Oil Filter",
    company: "Mann-Filter",
    specification: "HU 816 x",
    capacity: "Single unit",
    price: "$18",
    details: "Engine oil filter",
    usedInServices: "Oil Change, Filter Replacement",
  },
  {
    id: "brembo-brake-pads",
    category: "Brake Products",
    name: "Brake Pads",
    company: "Brembo",
    specification: "Ceramic",
    capacity: "Front axle set",
    price: "$95",
    details: "Low dust compound",
    usedInServices: "Brake Pad Replacement, Disc Resurfacing",
  },
  {
    id: "prestone-coolant",
    category: "Coolants",
    name: "Engine Coolant",
    company: "Prestone",
    specification: "Ready to use",
    capacity: "4L",
    price: "$24",
    details: "All vehicles",
    usedInServices: "Fluid Top-Up, Engine Tune-Up",
  },
  {
    id: "bosch-wiper",
    category: "Wipers",
    name: "Front Wiper Blade",
    company: "Bosch",
    specification: "24 inch",
    capacity: "Single blade",
    price: "$20",
    details: "Hybrid blade",
    usedInServices: "Full Vehicle Inspection, Car Wash & Detailing",
  },
];

const CATEGORY_OPTIONS = CATEGORY_ORDER.map((category) => ({
  value: category,
  label: category,
}));

type ItemFieldKey =
  | "category"
  | "name"
  | "company"
  | "specification"
  | "capacity"
  | "price"
  | "details"
  | "usedInServices";

const ITEM_FIELDS: SettingsEditField<ItemFieldKey>[] = [
  {
    key: "category",
    label: "Category",
    placeholder: "Select a category",
    type: "dropdown",
    options: CATEGORY_OPTIONS,
    clearsFields: [
      "name",
      "company",
      "specification",
      "capacity",
      "details",
      "usedInServices",
    ],
  },
  {
    key: "name",
    label: "Item",
    placeholder: "Select an item",
    type: "dropdown",
    options: (draft) =>
      (ITEM_CATALOG[draft.category ?? ""] ?? []).map((name) => ({
        value: name,
        label: name,
      })),
    clearsFields: ["company", "specification", "capacity", "details"],
  },
  {
    key: "usedInServices",
    label: "Used in services",
    placeholder: "Select services",
    type: "multiDropdown",
    options: (draft) =>
      (SERVICE_USAGE_CATALOG[draft.category ?? ""] ?? []).map((service) => ({
        value: service,
        label: service,
      })),
  },
  {
    key: "company",
    label: "Company",
    placeholder: "Select a company",
    type: "dropdown",
    options: (draft) =>
      (COMPANY_CATALOG[draft.category ?? ""] ?? []).map((company) => ({
        value: company,
        label: company,
      })),
  },
  {
    key: "specification",
    label: "Specification",
    placeholder: "Select a specification",
    type: "dropdown",
    options: (draft) =>
      (SPECIFICATION_CATALOG[draft.category ?? ""] ?? []).map((specification) => ({
        value: specification,
        label: specification,
      })),
  },
  {
    key: "capacity",
    label: "Capacity",
    placeholder: "Select a capacity",
    type: "dropdown",
    options: (draft) =>
      (CAPACITY_CATALOG[draft.category ?? ""] ?? []).map((capacity) => ({
        value: capacity,
        label: capacity,
      })),
  },
  {
    key: "price",
    label: "Price",
    placeholder: 'Ex: "$25"',
  },
  {
    key: "details",
    label: "Details",
    placeholder: "Select related details",
    type: "dropdown",
    options: (draft) =>
      (DETAILS_CATALOG[draft.category ?? ""] ?? []).map((details) => ({
        value: details,
        label: details,
      })),
  },
];

const EMPTY_ITEM: Record<ItemFieldKey, string> = {
  category: "",
  name: "",
  company: "",
  specification: "",
  capacity: "",
  price: "",
  details: "",
  usedInServices: "",
};

type EditingState =
  | { mode: "edit"; itemId: string }
  | { mode: "new" }
  | null;

export default function ItemsSettingsPage() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const { notifications, dismissNotification, showNotification } =
    useToastNotifications();
  const [editing, setEditing] = useState<EditingState>(null);

  const editingItem =
    editing?.mode === "edit"
      ? items.find((item) => item.id === editing.itemId) ?? null
      : null;

  const overlayValues: Record<ItemFieldKey, string> = editingItem
    ? {
        category: editingItem.category,
        name: editingItem.name,
        company: editingItem.company,
        specification: editingItem.specification,
        capacity: editingItem.capacity,
        price: editingItem.price,
        details: editingItem.details,
        usedInServices: editingItem.usedInServices,
      }
    : EMPTY_ITEM;

  const overlayTitle = editing?.mode === "edit" ? "Edit item" : "New item";

  function handleSave(values: Partial<Record<ItemFieldKey, string>>) {
    const category = values.category ?? "";
    const name = values.name ?? "";
    const company = values.company ?? "";
    const specification = values.specification ?? "";
    const capacity = values.capacity ?? "";
    const price = values.price ?? "";
    const details = values.details ?? "";
    const usedInServices = values.usedInServices ?? "";

    if (!category || !name) return;

    if (editing?.mode === "edit") {
      setItems((current) =>
        current.map((item) =>
          item.id === editing.itemId
            ? {
                ...item,
                category,
                name,
                company,
                specification,
                capacity,
                price,
                details,
                usedInServices,
              }
            : item,
        ),
      );
      showNotification(
        "Item updated successfully.",
        "success",
        "settingsSaved",
      );
    } else {
      setItems((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          category,
          name,
          company,
          specification,
          capacity,
          price,
          details,
          usedInServices,
        },
      ]);
      showNotification(
        "Item created successfully.",
        "success",
        "settingsSaved",
      );
    }
  }

  const itemsByCategory = CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <ToastContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      <div className={styles.content}>
        <div className={styles.serviceGroups}>
          {itemsByCategory.map(({ category, items: rows }) => (
            <section className={styles.group} key={category}>
              <h2 className={styles.groupTitle}>
                <img
                  className={styles.groupIcon}
                  src={CATEGORY_ICONS[category]}
                  alt=""
                  aria-hidden="true"
                />
                {category}
              </h2>

              <div className={styles.rows}>
                {rows.map((item) => (
                  <div className={styles.serviceRow} key={item.id}>
                    <span className={styles.serviceName}>{item.name}</span>
                    <div className={styles.metaList}>
                      {item.company && (
                        <span className={styles.serviceMeta}>{item.company}</span>
                      )}
                      {item.specification && (
                        <span className={styles.serviceMeta}>
                          {item.specification}
                        </span>
                      )}
                      {item.capacity && (
                        <span className={styles.serviceMeta}>{item.capacity}</span>
                      )}
                      {item.usedInServices
                        .split(",")
                        .map((service) => service.trim())
                        .filter(Boolean)
                        .map((service) => (
                          <span key={service} className={styles.serviceMeta}>
                            {service}
                          </span>
                      ))}
                    {item.price && (
                      <span className={`${styles.serviceMeta} ${styles.priceMeta}`}>
                        {item.price}
                      </span>
                    )}
                    </div>
                    <button
                      type="button"
                      className={styles.editButton}
                      aria-label={`Edit ${item.name}`}
                      onClick={() =>
                        setEditing({ mode: "edit", itemId: item.id })
                      }
                    >
                      <FiEdit2 />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className={styles.sidePanel}>
          <h2 className={styles.sideTitle}>Create new item</h2>
          <p className={styles.sideText}>
            Add inventory items by category and define the related product
            details your team needs.
          </p>
          <button
            type="button"
            className={styles.newButton}
            onClick={() => setEditing({ mode: "new" })}
          >
            New item
          </button>
        </aside>
      </div>

      {editing && (
        <SettingsEditOverlay<ItemFieldKey>
          title={overlayTitle}
          fields={ITEM_FIELDS}
          values={overlayValues}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
