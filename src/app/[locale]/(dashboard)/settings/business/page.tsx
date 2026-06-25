"use client";

import { useEffect, useState } from "react";
import { useToastNotifications } from "@/application/hooks/useToastNotifications";
import {
  SettingsInfoRow,
  SettingsInfoSection,
} from "@/presentation/components/settings/SettingsInfoSection";
import {
  SettingsEditOverlay,
  type SettingsEditField,
} from "@/presentation/components/settings/SettingsEditOverlay";
import ToastContainer from "@/presentation/components/Toast/Toast";
import {
  getBusinessProfileSettings,
  updateBusinessProfileSettings,
} from "@/infrastructure/services/business-settings.service";
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
  businessName: "",
  businessType: "",
  employeeCount: "",
  country: "",
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
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
  { value: "general_repair", label: "General Repair Shop" },
  { value: "specialized", label: "Specialized Workshop" },
  { value: "body_paint", label: "Body & Paint Shop" },
  { value: "quick_service", label: "Quick Service Center" },
];

const EMPLOYEE_COUNTS = [
  { value: "small", label: "1 - 5 Employees" },
  { value: "medium", label: "6 - 15 Employees" },
  { value: "large", label: "16+ Employees" },
];

const businessTypeLabels = Object.fromEntries(
  BUSINESS_TYPES.map((option) => [option.value, option.label]),
);
const employeeCountLabels = Object.fromEntries(
  EMPLOYEE_COUNTS.map((option) => [option.value, option.label]),
);

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
  const { notifications, dismissNotification, showNotification } =
    useToastNotifications();
  const [editingSection, setEditingSection] = useState<keyof typeof SECTIONS | null>(
    null,
  );
  const activeSection = editingSection ? SECTIONS[editingSection] : null;

  useEffect(() => {
    async function loadBusiness() {
      const profile = await getBusinessProfileSettings();
      setBusiness({
        businessName: profile.name ?? "",
        businessType: profile.businessType ?? "",
        employeeCount: profile.employeeCount ?? "",
        country: profile.address?.country ?? "",
        streetAddress: profile.address?.streetAddress ?? "",
        city: profile.address?.city ?? "",
        state: profile.address?.state ?? "",
        zipCode: profile.address?.zipCode ?? "",
      });
    }

    void loadBusiness();
  }, []);

  return (
    <>
      <ToastContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      <div className={styles.content}>
        <SettingsInfoSection
          title="Business Details"
          onEdit={() => setEditingSection("details")}
        >
          <SettingsInfoRow label="Business Name" value={business.businessName} />
          <SettingsInfoRow
            label="Business Type"
            value={businessTypeLabels[business.businessType] ?? business.businessType}
          />
          <SettingsInfoRow
            label="Number of Employees"
            value={employeeCountLabels[business.employeeCount] ?? business.employeeCount}
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
          onSave={async (values) => {
            const nextBusiness = { ...business, ...values };
            setBusiness(nextBusiness);
            await updateBusinessProfileSettings({
              name: nextBusiness.businessName,
              businessType: nextBusiness.businessType,
              employeeCount: nextBusiness.employeeCount,
              address: {
                country: nextBusiness.country,
                streetAddress: nextBusiness.streetAddress,
                city: nextBusiness.city,
                state: nextBusiness.state,
                zipCode: nextBusiness.zipCode,
              },
            });
            showNotification(
              `${activeSection.title} updated successfully.`,
              "success",
              "settingsSaved",
            );
          }}
        />
      )}
    </>
  );
}
