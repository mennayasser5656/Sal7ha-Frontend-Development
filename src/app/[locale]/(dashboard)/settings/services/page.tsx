"use client";

import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { useToastNotifications } from "@/application/hooks/useToastNotifications";
import {
  SettingsEditOverlay,
  type SettingsEditField,
} from "@/presentation/components/settings/SettingsEditOverlay";
import ToastContainer from "@/presentation/components/Toast/Toast";
import styles from "./services.module.css";

type ServiceItem = {
  id: string;
  category: string;
  name: string;
  price: string;
  status: ServiceStatus;
};

type ServiceStatus = "active" | "inactive";

const CATEGORY_ORDER = [
  "Wheel Services",
  "Engine Services",
  "Brake Services",
  "Body & Paint",
  "Electrical Services",
  "General Maintenance",
];

const CATEGORY_ICONS: Record<string, string> = {
  "Wheel Services": "/assets/wheel_service.svg",
  "Engine Services": "/assets/engine_service.svg",
  "Brake Services": "/assets/wheel_service.svg",
  "Body & Paint": "/assets/paint_service.svg",
  "Electrical Services": "/assets/battery_service.svg",
  "General Maintenance": "/assets/engine_service.svg",
};

const SERVICE_CATALOG: Record<string, string[]> = {
  "Wheel Services": [
    "Tire Replacement",
    "Tire Rotation",
    "Wheel Alignment",
    "Wheel Balancing",
    "Flat Tire Repair",
  ],
  "Engine Services": [
    "Oil Change",
    "Engine Diagnostics",
    "Engine Tune-Up",
    "Timing Belt Replacement",
    "Spark Plug Replacement",
  ],
  "Brake Services": [
    "Brake Pad Replacement",
    "Brake Fluid Flush",
    "Disc Resurfacing",
  ],
  "Body & Paint": [
    "Dent Removal",
    "Full Paint Job",
    "Scratch Repair",
    "Bumper Repair",
  ],
  "Electrical Services": [
    "Battery Replacement",
    "Alternator Repair",
    "Wiring Diagnostics",
    "A/C Repair",
  ],
  "General Maintenance": [
    "Car Wash & Detailing",
    "Fluid Top-Up",
    "Filter Replacement",
    "Full Vehicle Inspection",
  ],
};

const INITIAL_SERVICES: ServiceItem[] = [
  { id: "tire-replacement", category: "Wheel Services", name: "Tire Replacement", price: "$120" },
  { id: "tire-rotation", category: "Wheel Services", name: "Tire Rotation", price: "$40" },
  { id: "wheel-alignment", category: "Wheel Services", name: "Wheel Alignment", price: "$80" },
  { id: "wheel-balancing", category: "Wheel Services", name: "Wheel Balancing", price: "$60" },
  { id: "flat-tire-repair", category: "Wheel Services", name: "Flat Tire Repair", price: "$25" },
  { id: "oil-change", category: "Engine Services", name: "Oil Change", price: "$55" },
  { id: "engine-diagnostics", category: "Engine Services", name: "Engine Diagnostics", price: "$90" },
  { id: "engine-tune-up", category: "Engine Services", name: "Engine Tune-Up", price: "$150" },
  { id: "timing-belt", category: "Engine Services", name: "Timing Belt Replacement", price: "$320" },
  { id: "spark-plugs", category: "Engine Services", name: "Spark Plug Replacement", price: "$70" },
  { id: "brake-pads", category: "Brake Services", name: "Brake Pad Replacement", price: "$140" },
  { id: "brake-fluid", category: "Brake Services", name: "Brake Fluid Flush", price: "$80" },
  { id: "disc-resurfacing", category: "Brake Services", name: "Disc Resurfacing", price: "$110" },
  { id: "dent-removal", category: "Body & Paint", name: "Dent Removal", price: "$200" },
  { id: "paint-job", category: "Body & Paint", name: "Full Paint Job", price: "$1,200" },
  { id: "scratch-repair", category: "Body & Paint", name: "Scratch Repair", price: "$90" },
  { id: "bumper-repair", category: "Body & Paint", name: "Bumper Repair", price: "$180" },
  { id: "battery-replacement", category: "Electrical Services", name: "Battery Replacement", price: "$130" },
  { id: "alternator-repair", category: "Electrical Services", name: "Alternator Repair", price: "$220" },
  { id: "wiring-diagnostics", category: "Electrical Services", name: "Wiring Diagnostics", price: "$95" },
  { id: "ac-repair", category: "Electrical Services", name: "A/C Repair", price: "$160" },
  { id: "car-wash", category: "General Maintenance", name: "Car Wash & Detailing", price: "$45" },
  { id: "fluid-top-up", category: "General Maintenance", name: "Fluid Top-Up", price: "$20" },
  { id: "filter-replacement", category: "General Maintenance", name: "Filter Replacement", price: "$35" },
  { id: "inspection", category: "General Maintenance", name: "Full Vehicle Inspection", price: "$75" },
].map((service) => ({ ...service, status: "active" as ServiceStatus }));

const CATEGORY_OPTIONS = CATEGORY_ORDER.map((category) => ({
  value: category,
  label: category,
}));

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

type ServiceFieldKey = "category" | "name" | "price" | "status";

const SERVICE_FIELDS: SettingsEditField<ServiceFieldKey>[] = [
  {
    key: "category",
    label: "Category",
    placeholder: "Select a category",
    type: "dropdown",
    options: CATEGORY_OPTIONS,
    clearsFields: ["name"],
  },
  {
    key: "name",
    label: "Service Name",
    placeholder: "Select a service",
    type: "dropdown",
    options: (draft) =>
      (SERVICE_CATALOG[draft.category ?? ""] ?? []).map((name) => ({
        value: name,
        label: name,
      })),
  },
  {
    key: "price",
    label: "Price",
    placeholder: 'Ex: "$50"',
  },
  {
    key: "status",
    label: "Status",
    placeholder: "Select a status",
    type: "dropdown",
    options: STATUS_OPTIONS,
  },
];

const EMPTY_SERVICE: Record<ServiceFieldKey, string> = {
  category: "",
  name: "",
  price: "",
  status: "active",
};

type EditingState =
  | { mode: "edit"; serviceId: string }
  | { mode: "new" }
  | null;

export default function ServicesSettingsPage() {
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const { notifications, dismissNotification, showNotification } =
    useToastNotifications();
  const [editing, setEditing] = useState<EditingState>(null);

  const editingService =
    editing?.mode === "edit"
      ? services.find((service) => service.id === editing.serviceId) ?? null
      : null;

  const overlayValues: Record<ServiceFieldKey, string> = editingService
    ? {
        category: editingService.category,
        name: editingService.name,
        price: editingService.price,
        status: editingService.status,
      }
    : EMPTY_SERVICE;

  const overlayTitle =
    editing?.mode === "edit" ? "Edit service" : "New service";

  function handleSave(values: Partial<Record<ServiceFieldKey, string>>) {
    const category = values.category ?? "";
    const name = values.name ?? "";
    const price = values.price ?? "";
    const status = (values.status ?? "active") as ServiceStatus;

    if (!category || !name) return;

    if (editing?.mode === "edit") {
      setServices((current) =>
        current.map((service) =>
          service.id === editing.serviceId
            ? { ...service, category, name, price, status }
            : service,
        ),
      );
      showNotification(
        "Service updated successfully.",
        "success",
        "settingsSaved",
      );
    } else {
      setServices((current) => [
        ...current,
        { id: crypto.randomUUID(), category, name, price, status },
      ]);
      showNotification(
        "Service created successfully.",
        "success",
        "settingsSaved",
      );
    }
  }

  const servicesByCategory = CATEGORY_ORDER.map((category) => ({
    category,
    services: services.filter((service) => service.category === category),
  })).filter((group) => group.services.length > 0);

  return (
    <>
      <ToastContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      <div className={styles.content}>
        <div className={styles.serviceGroups}>
          {servicesByCategory.map(({ category, services: rows }) => (
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
                {rows.map((service) => (
                  <div className={styles.serviceRow} key={service.id}>
                    <span className={styles.serviceName}>{service.name}</span>
                    <div className={styles.metaList}>
                      {service.price && (
                        <span className={`${styles.serviceMeta} ${styles.priceMeta}`}>
                          {service.price}
                        </span>
                      )}
                      <span
                        className={`${styles.statusBadge} ${
                          service.status === "active"
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {service.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.editButton}
                      aria-label={`Edit ${service.name}`}
                      onClick={() =>
                        setEditing({ mode: "edit", serviceId: service.id })
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
          <h2 className={styles.sideTitle}>Create new service</h2>
          <p className={styles.sideText}>
            Add services to the right category and configure them for your team.
          </p>
          <button
            type="button"
            className={styles.newButton}
            onClick={() => setEditing({ mode: "new" })}
          >
            New service
          </button>
        </aside>
      </div>

      {editing && (
        <SettingsEditOverlay<ServiceFieldKey>
          title={overlayTitle}
          fields={SERVICE_FIELDS}
          values={overlayValues}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
