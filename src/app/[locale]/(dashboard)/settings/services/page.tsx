"use client";

import { useEffect, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { useToastNotifications } from "@/application/hooks/useToastNotifications";
import {
  SettingsEditOverlay,
  type SettingsEditField,
} from "@/presentation/components/settings/SettingsEditOverlay";
import ToastContainer from "@/presentation/components/Toast/Toast";
import {
  createBusinessService,
  listBusinessServices,
  updateBusinessService,
  type BusinessServiceRow,
} from "@/infrastructure/services/business-settings.service";
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

const INITIAL_SERVICES: ServiceItem[] = [];

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

function formatPrice(value: number) {
  return `$${Number(value || 0).toLocaleString("en-US")}`;
}

function parsePrice(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toServiceItem(row: BusinessServiceRow): ServiceItem {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    price: formatPrice(row.price),
    status: row.status === "inactive" ? "inactive" : "active",
  };
}

type EditingState =
  | { mode: "edit"; serviceId: string }
  | { mode: "new" }
  | null;

export default function ServicesSettingsPage() {
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const { notifications, dismissNotification, showNotification } =
    useToastNotifications();
  const [editing, setEditing] = useState<EditingState>(null);

  useEffect(() => {
    async function loadServices() {
      const rows = await listBusinessServices();
      setServices(rows.map(toServiceItem));
    }

    void loadServices();
  }, []);

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

  async function handleSave(values: Partial<Record<ServiceFieldKey, string>>) {
    const category = values.category ?? "";
    const name = values.name ?? "";
    const price = values.price ?? "";
    const status = (values.status ?? "active") as ServiceStatus;

    if (!category || !name) return;

    if (editing?.mode === "edit") {
      const updated = await updateBusinessService(editing.serviceId, {
        category,
        name,
        price: parsePrice(price),
        status,
      });
      setServices((current) =>
        current.map((service) =>
          service.id === editing.serviceId ? toServiceItem(updated) : service,
        ),
      );
      showNotification(
        "Service updated successfully.",
        "success",
        "settingsSaved",
      );
    } else {
      const created = await createBusinessService({
        category,
        name,
        price: parsePrice(price),
        status,
      });
      setServices((current) => [...current, toServiceItem(created)]);
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
