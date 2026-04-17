/**
 * Configuration is per CATEGORY, not per service.
 * A shop that does wheel services carries certain tire brands/types —
 * that applies across all wheel services, not one at a time.
 */

export interface ConfigOption {
  key: string;
  label: string;
  options: string[];
}

/** Shared inventory / options for an entire service category */
export const CATEGORY_CONFIGS: Record<string, ConfigOption[]> = {
  "Wheel Services": [
    {
      key: "tire-type",
      label: "Tire Types",
      options: ["All-Season", "Summer", "Winter", "All-Terrain", "Performance", "Run-Flat"],
    },
    {
      key: "tire-brands",
      label: "Tire Brands",
      options: ["Michelin", "Bridgestone", "Goodyear", "Continental", "Pirelli", "Hankook", "Yokohama"],
    },
    {
      key: "rim-types",
      label: "Rim Types",
      options: ["Steel", "Alloy", "Forged", "Carbon Fiber"],
    },
  ],

  "Engine Services": [
    {
      key: "oil-type",
      label: "Oil Types",
      options: ["Full Synthetic", "Semi-Synthetic", "Conventional", "High Mileage"],
    },
    {
      key: "viscosity",
      label: "Viscosity Grades",
      options: ["0W-20", "5W-20", "5W-30", "10W-30", "10W-40", "15W-40", "20W-50"],
    },
    {
      key: "oil-filter-brands",
      label: "Oil Filter Brands",
      options: ["Bosch", "Mann-Filter", "K&N", "Mobil 1", "Fram", "WIX", "ACDelco"],
    },
    {
      key: "spark-plug-type",
      label: "Spark Plug Types",
      options: ["Copper", "Platinum", "Double Platinum", "Iridium"],
    },
    {
      key: "belt-brands",
      label: "Belt / Parts Brands",
      options: ["Gates", "Continental", "Dayco", "ACDelco", "Bosch", "Denso", "NGK"],
    },
  ],

  "Brake Services": [
    {
      key: "pad-type",
      label: "Brake Pad Types",
      options: ["Ceramic", "Semi-Metallic", "Organic", "Low-Metallic NAO"],
    },
    {
      key: "pad-brands",
      label: "Brake Brands",
      options: ["Brembo", "Bosch", "ACDelco", "Wagner", "EBC", "Hawk"],
    },
    {
      key: "disc-type",
      label: "Disc / Rotor Types",
      options: ["Solid", "Vented", "Drilled", "Slotted", "Drilled & Slotted"],
    },
    {
      key: "fluid-type",
      label: "Brake Fluid Types",
      options: ["DOT 3", "DOT 4", "DOT 5", "DOT 5.1"],
    },
  ],

  "Body & Paint": [
    {
      key: "paint-type",
      label: "Paint Types",
      options: ["Solid", "Metallic", "Pearlescent", "Matte", "Satin"],
    },
    {
      key: "repair-methods",
      label: "Repair Methods",
      options: ["PDR (Paintless)", "Traditional Fill & Paint", "Panel Replacement", "Spot Repair"],
    },
    {
      key: "service-levels",
      label: "Service Levels",
      options: ["Single Panel", "Partial Respray", "Full Respray"],
    },
  ],

  "Electrical Services": [
    {
      key: "battery-type",
      label: "Battery Types",
      options: ["Lead-Acid", "AGM", "EFB", "Lithium-Ion", "Gel"],
    },
    {
      key: "battery-brands",
      label: "Battery Brands",
      options: ["Bosch", "Varta", "Optima", "ACDelco", "Exide", "DieHard"],
    },
    {
      key: "ac-refrigerant",
      label: "A/C Refrigerants",
      options: ["R134a", "R1234yf"],
    },
  ],

  "General Maintenance": [
    {
      key: "wash-levels",
      label: "Wash & Detail Levels",
      options: ["Basic Wash", "Interior Cleaning", "Full Detail", "Ceramic Coating", "Paint Correction"],
    },
    {
      key: "filter-types",
      label: "Filter Types",
      options: ["Engine Air", "Cabin Air", "Fuel Filter", "Transmission Filter"],
    },
    {
      key: "fluid-types",
      label: "Fluid Types",
      options: ["Coolant", "Brake Fluid", "Power Steering", "Transmission Fluid", "Windshield Washer"],
    },
    {
      key: "inspection-types",
      label: "Inspection Types",
      options: ["Pre-Purchase", "Annual Safety", "Emissions", "Multi-Point"],
    },
  ],
};
