"use client";

import { useState } from "react";
import ServicePicker, {
  ServiceItem,
} from "@/presentation/components/form/ServicePicker/ServicePicker";
import CategoryConfigCard from "@/presentation/components/form/CategoryConfigCard/CategoryConfigCard";
import GetStartedButton from "@/presentation/components/form/GetStartedButton/GetStartedButton";
import { useOnboardingSteps } from "@/application/hooks/useOnboardingSteps";
import { validateStep } from "@/domain/validation/validation";
import { buildBusinessSchema } from "@/domain/validation/schema";
import { CATEGORY_CONFIGS } from "@/domain/data/service-configs";
import layoutStyles from "../Onboarding.module.css";
import styles from "./BuildBusiness.module.css";

const ALL_SERVICES: ServiceItem[] = [
  // Wheel Services
  { id: "tire-replacement",   label: "Tire Replacement",      category: "Wheel Services" },
  { id: "tire-rotation",      label: "Tire Rotation",         category: "Wheel Services" },
  { id: "wheel-alignment",    label: "Wheel Alignment",       category: "Wheel Services" },
  { id: "wheel-balancing",    label: "Wheel Balancing",       category: "Wheel Services" },
  { id: "flat-tire-repair",   label: "Flat Tire Repair",      category: "Wheel Services" },

  // Engine Services
  { id: "oil-change",         label: "Oil Change",            category: "Engine Services" },
  { id: "engine-diagnostics", label: "Engine Diagnostics",    category: "Engine Services" },
  { id: "engine-tune-up",     label: "Engine Tune-Up",        category: "Engine Services" },
  { id: "timing-belt",        label: "Timing Belt Replacement", category: "Engine Services" },
  { id: "spark-plugs",        label: "Spark Plug Replacement",  category: "Engine Services" },

  // Brake Services
  { id: "brake-pads",         label: "Brake Pad Replacement", category: "Brake Services" },
  { id: "brake-fluid",        label: "Brake Fluid Flush",     category: "Brake Services" },
  { id: "disc-resurfacing",   label: "Disc Resurfacing",      category: "Brake Services" },

  // Body & Paint
  { id: "dent-removal",       label: "Dent Removal",          category: "Body & Paint" },
  { id: "paint-job",          label: "Full Paint Job",        category: "Body & Paint" },
  { id: "scratch-repair",     label: "Scratch Repair",        category: "Body & Paint" },
  { id: "bumper-repair",      label: "Bumper Repair",         category: "Body & Paint" },

  // Electrical
  { id: "battery-replacement", label: "Battery Replacement",  category: "Electrical Services" },
  { id: "alternator-repair",   label: "Alternator Repair",    category: "Electrical Services" },
  { id: "wiring-diagnostics",  label: "Wiring Diagnostics",   category: "Electrical Services" },
  { id: "ac-repair",           label: "A/C Repair",           category: "Electrical Services" },

  // General Maintenance
  { id: "car-wash",           label: "Car Wash & Detailing",  category: "General Maintenance" },
  { id: "fluid-top-up",       label: "Fluid Top-Up",         category: "General Maintenance" },
  { id: "filter-replacement",  label: "Filter Replacement",   category: "General Maintenance" },
  { id: "inspection",         label: "Full Vehicle Inspection", category: "General Maintenance" },
];

type PriceRange = { min: string; max: string };
type Errors = Partial<Record<string, string>>;

export default function BuildBusinessPage() {
  const { goToNextStep } = useOnboardingSteps();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  /** Category → { optionKey → selected values } */
  const [categoryInventory, setCategoryInventory] = useState<
    Record<string, Record<string, string[]>>
  >({});
  /** serviceId → price range */
  const [servicePrices, setServicePrices] = useState<Record<string, PriceRange>>({});
  const [errors, setErrors] = useState<Errors>({});

  function handleServiceChange(ids: string[]) {
    setSelectedServices(ids);
    // Clean up prices for removed services
    setServicePrices((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (!ids.includes(key)) delete next[key];
      }
      return next;
    });
  }

  function handleInventoryChange(category: string, key: string, selected: string[]) {
    setCategoryInventory((prev) => ({
      ...prev,
      [category]: { ...prev[category], [key]: selected },
    }));
  }

  function handlePriceChange(serviceId: string, price: PriceRange) {
    setServicePrices((prev) => ({ ...prev, [serviceId]: price }));
  }

  function handleContinue() {
    const result = validateStep(buildBusinessSchema, {
      services: selectedServices,
      workingHours: { open: "09:00", close: "18:00" },
    });

    if (!result.success) {
      setErrors(result.errors as Errors);
      return;
    }

    setErrors({});
    goToNextStep();
  }

  // Group selected services by category
  const categoriesWithServices: Record<string, { id: string; label: string }[]> = {};
  for (const id of selectedServices) {
    const service = ALL_SERVICES.find((s) => s.id === id);
    if (!service) continue;
    (categoriesWithServices[service.category] ??= []).push({
      id: service.id,
      label: service.label,
    });
  }

  const categoryEntries = Object.entries(categoriesWithServices);

  let delay = 0;
  const step = 150;

  return (
    <div className={styles.screen}>
      <div
        className={layoutStyles.animated}
        style={{ animationDelay: `${((delay += step), delay)}ms`, zIndex: 1 }}
      >
        <ServicePicker
          label="Search Services"
          placeholder='Ex: "Oil Change"'
          services={ALL_SERVICES}
          selected={selectedServices}
          onChange={handleServiceChange}
          error={errors["services"]}
        />
      </div>

      {/* One card per category that has selected services */}
      {categoryEntries.length > 0 && (
        <div
          className={layoutStyles.animated}
          style={{ animationDelay: `${((delay += step), delay)}ms` }}
        >
          <div className={styles.configSection}>
            <span className={styles.configSectionTitle}>
              Configure your services
            </span>
            <div className={styles.configCards}>
              {categoryEntries.map(([category, services]) => (
                <CategoryConfigCard
                  key={category}
                  category={category}
                  services={services}
                  configOptions={CATEGORY_CONFIGS[category] ?? []}
                  inventoryValues={categoryInventory[category] ?? {}}
                  onInventoryChange={handleInventoryChange}
                  prices={servicePrices}
                  onPriceChange={handlePriceChange}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        className={layoutStyles.animated}
        style={{ animationDelay: `${((delay += step), delay)}ms` }}
      >
        <GetStartedButton label="Continue" onClick={handleContinue} />
      </div>
    </div>
  );
}
