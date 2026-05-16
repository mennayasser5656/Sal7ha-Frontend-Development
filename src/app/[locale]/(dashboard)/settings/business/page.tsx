"use client";

import { useState } from "react";
import {
  SettingsInfoRow,
  SettingsInfoSection,
} from "@/presentation/components/settings/SettingsInfoSection";
import {
  SettingsEditOverlay,
  type SettingsEditField,
} from "@/presentation/components/settings/SettingsEditOverlay";
import styles from "./business.module.css";

type BusinessInfo = {
  businessName: string;
  businessType: string;
  employeeCount: string;
  country: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
};

const INITIAL_BUSINESS: BusinessInfo = {
  businessName: "Al-Faisal Auto Workshop",
  businessType: "General Repair Shop",
  employeeCount: "6 - 15 Employees",
  country: "Saudi Arabia",
  streetAddress: "123 Industrial Area",
  city: "Riyadh",
  state: "Riyadh Region",
  zipCode: "12345",
};

const COUNTRIES = [
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Egypt", label: "Egypt" },
  { value: "Jordan", label: "Jordan" },
  { value: "Kuwait", label: "Kuwait" },
  { value: "Bahrain", label: "Bahrain" },
  { value: "Qatar", label: "Qatar" },
  { value: "Oman", label: "Oman" },
];

const BUSINESS_TYPES = [
  { value: "General Repair Shop", label: "General Repair Shop" },
  { value: "Specialized Workshop", label: "Specialized Workshop" },
  { value: "Body & Paint Shop", label: "Body & Paint Shop" },
  { value: "Quick Service Center", label: "Quick Service Center" },
];

const EMPLOYEE_COUNTS = [
  { value: "1 - 5 Employees", label: "1 - 5 Employees" },
  { value: "6 - 15 Employees", label: "6 - 15 Employees" },
  { value: "16+ Employees", label: "16+ Employees" },
];

const SECTIONS = {
  details: {
    title: "Business Details",
    fields: [
      {
        key: "businessName",
        label: "Business Name",
        placeholder: 'Ex: "Al-Faisal Auto Workshop"',
      },
      {
        key: "businessType",
        label: "Business Type",
        placeholder: "Select a business type",
        type: "dropdown",
        options: BUSINESS_TYPES,
      },
      {
        key: "employeeCount",
        label: "Number of Employees",
        placeholder: "Select employee count",
        type: "dropdown",
        options: EMPLOYEE_COUNTS,
      },
    ],
  },
  location: {
    title: "Shop Location",
    fields: [
      {
        key: "country",
        label: "Country",
        placeholder: "Select a country",
        type: "dropdown",
        options: COUNTRIES,
      },
      {
        key: "streetAddress",
        label: "Street Address",
        placeholder: 'Ex: "123 Industrial Area"',
      },
      { key: "city", label: "City", placeholder: 'Ex: "Riyadh"' },
      { key: "state", label: "State", placeholder: 'Ex: "Riyadh Region"' },
      { key: "zipCode", label: "Zip Code", placeholder: 'Ex: "12345"' },
    ],
  },
} satisfies Record<
  string,
  {
    title: string;
    fields: SettingsEditField<keyof BusinessInfo>[];
  }
>;

export default function BusinessInformationPage() {
  const [business, setBusiness] = useState(INITIAL_BUSINESS);
  const [editingSection, setEditingSection] = useState<keyof typeof SECTIONS | null>(
    null,
  );
  const activeSection = editingSection ? SECTIONS[editingSection] : null;

  return (
    <>
      <div className={styles.content}>
        <SettingsInfoSection
          title="Business Details"
          onEdit={() => setEditingSection("details")}
        >
          <SettingsInfoRow label="Business Name" value={business.businessName} />
          <SettingsInfoRow label="Business Type" value={business.businessType} />
          <SettingsInfoRow
            label="Number of Employees"
            value={business.employeeCount}
          />
        </SettingsInfoSection>

        <SettingsInfoSection
          title="Shop Location"
          onEdit={() => setEditingSection("location")}
        >
          <SettingsInfoRow label="Country" value={business.country} />
          <SettingsInfoRow
            label="Street Address"
            value={business.streetAddress}
          />
          <SettingsInfoRow label="City" value={business.city} />
          <SettingsInfoRow label="State" value={business.state} />
          <SettingsInfoRow label="Zip Code" value={business.zipCode} />
        </SettingsInfoSection>
      </div>

      {activeSection && (
        <SettingsEditOverlay<keyof BusinessInfo>
          title={activeSection.title}
          fields={activeSection.fields}
          values={business}
          onClose={() => setEditingSection(null)}
          onSave={(values) =>
            setBusiness((currentBusiness) => ({
              ...currentBusiness,
              ...values,
            }))
          }
        />
      )}
    </>
  );
}
