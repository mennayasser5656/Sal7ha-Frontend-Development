"use client";

import { useState } from "react";
import ServicePicker, {
  ServiceItem,
} from "@/presentation/components/form/ServicePicker/ServicePicker";
import GetStartedButton from "@/presentation/components/form/GetStartedButton/GetStartedButton";
import { useOnboardingSteps } from "@/application/hooks/useOnboardingSteps";
import { validateStep } from "@/domain/validation/validation";
import { buildBusinessSchema } from "@/domain/validation/schema";
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

type Errors = Partial<Record<string, string>>;

export default function BuildBusinessPage() {
  const { goToNextStep } = useOnboardingSteps();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});

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
          onChange={setSelectedServices}
          error={errors["services"]}
        />
      </div>

      <div
        className={layoutStyles.animated}
        style={{ animationDelay: `${((delay += step), delay)}ms` }}
      >
        <GetStartedButton label="Continue" onClick={handleContinue} />
      </div>
    </div>
  );
}
