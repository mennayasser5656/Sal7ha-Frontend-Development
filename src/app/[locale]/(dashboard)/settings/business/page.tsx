"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { FiUploadCloud } from "react-icons/fi";
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
  uploadBusinessLogo,
  updateBusinessProfileSettings,
} from "@/infrastructure/services/business-settings.service";
import styles from "./business.module.css";

type BusinessInfo = {
  businessName: string;
  businessType: string;
  employeeCount: string;
  commercialRegistrationNumber: string;
  taxIdentificationNumber: string;
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
  commercialRegistrationNumber: "",
  taxIdentificationNumber: "",
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
  tax: {
    title: "Tax Information",
    fields: [
      {
        key: "commercialRegistrationNumber",
        label: "Commercial Registration Number",
        placeholder: "Ex: 123456789",
      },
      {
        key: "taxIdentificationNumber",
        label: "Tax Identification Number",
        placeholder: "Ex: 987654321",
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
  const [logoFileName, setLogoFileName] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
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
        commercialRegistrationNumber:
          profile.commercialRegistrationNumber ?? "",
        taxIdentificationNumber: profile.taxIdentificationNumber ?? "",
        country: profile.address?.country ?? "",
        streetAddress: profile.address?.streetAddress ?? "",
        city: profile.address?.city ?? "",
        state: profile.address?.state ?? "",
        zipCode: profile.address?.zipCode ?? "",
      });
      setLogoFileName(profile.logoFileName ?? "");
    }

    void loadBusiness();
  }, []);

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const supportedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!supportedTypes.includes(file.type)) {
      showNotification("Use a PNG, JPG, or WebP image.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification("The shop logo must be 5 MB or smaller.", "error");
      return;
    }

    const previousLogoFileName = logoFileName;
    setLogoFileName(file.name);
    setIsUploadingLogo(true);

    try {
      const profile = await uploadBusinessLogo(file);
      if (!profile.logoUrl) {
        throw new Error("The server did not return the uploaded logo.");
      }
      setLogoFileName(profile.logoFileName ?? file.name);
      showNotification(
        "Shop logo updated successfully.",
        "success",
        "settingsSaved",
      );
    } catch (error) {
      setLogoFileName(previousLogoFileName);
      showNotification(
        error instanceof Error ? error.message : "Could not upload the shop logo.",
        "error",
      );
    } finally {
      setIsUploadingLogo(false);
    }
  }

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
          title="Tax Information"
          onEdit={() => setEditingSection("tax")}
        >
          <SettingsInfoRow
            label="Commercial Registration Number"
            value={business.commercialRegistrationNumber}
          />
          <SettingsInfoRow
            label="Tax Identification Number"
            value={business.taxIdentificationNumber}
          />
        </SettingsInfoSection>

        <SettingsInfoSection
          title="Shop Logo"
          editLabel="Upload shop logo"
          onEdit={() => logoInputRef.current?.click()}
          actionIcon={<FiUploadCloud />}
          actionDisabled={isUploadingLogo}
        >
          <SettingsInfoRow
            label="Image"
            value={
              isUploadingLogo
                ? `${logoFileName} (uploading…)`
                : logoFileName || "No image uploaded"
            }
          />
        </SettingsInfoSection>
        <input
          ref={logoInputRef}
          className={styles.logoInput}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => void handleLogoChange(event)}
        />

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
              commercialRegistrationNumber:
                nextBusiness.commercialRegistrationNumber,
              taxIdentificationNumber: nextBusiness.taxIdentificationNumber,
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
