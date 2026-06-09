"use client";

import { useState } from "react";
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
import styles from "./personal.module.css";

type PersonalInfo = {
  firstName: string;
  lastName: string;
  birthDate: string;
  country: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
};

const INITIAL_PERSONAL: PersonalInfo = {
  firstName: "John",
  lastName: "Doe",
  birthDate: "",
  country: "Saudi Arabia",
  streetAddress: "123 Main Street",
  city: "Riyadh",
  state: "Riyadh Region",
  zipCode: "12345",
};

const SECTIONS = {
  name: {
    title: "Name & Birth Date",
    fields: [
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      {
        key: "birthDate",
        label: "Birth Date",
        placeholder: "MM/DD/YYYY",
        type: "date",
      },
    ],
  },
  location: {
    title: "Location",
    fields: [
      { key: "country", label: "Country" },
      { key: "streetAddress", label: "Street Address" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "zipCode", label: "Zip Code" },
    ],
  },
} satisfies Record<
  string,
  {
    title: string;
    fields: SettingsEditField<keyof PersonalInfo>[];
  }
>;

export default function PersonalInformationPage() {
  const [personal, setPersonal] = useState(INITIAL_PERSONAL);
  const { notifications, dismissNotification, showNotification } =
    useToastNotifications();
  const [editingSection, setEditingSection] = useState<keyof typeof SECTIONS | null>(
    null,
  );
  const activeSection = editingSection ? SECTIONS[editingSection] : null;

  return (
    <>
      <ToastContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      <div className={styles.content}>
        <SettingsInfoSection
          title="Name & Birth Date"
          setupStatus={!personal.birthDate ? "warning" : undefined}
          setupLabel="Birth date is not set"
          onEdit={() => setEditingSection("name")}
        >
          <SettingsInfoRow label="First Name" value={personal.firstName} />
          <SettingsInfoRow label="Last Name" value={personal.lastName} />
          <SettingsInfoRow
            label="Birth Date"
            value={personal.birthDate}
            placeholder="Set birth date"
          />
        </SettingsInfoSection>

        <SettingsInfoSection
          title="Location"
          onEdit={() => setEditingSection("location")}
        >
          <SettingsInfoRow label="Country" value={personal.country} />
          <SettingsInfoRow label="Street Address" value={personal.streetAddress} />
          <SettingsInfoRow label="City" value={personal.city} />
          <SettingsInfoRow label="State" value={personal.state} />
          <SettingsInfoRow label="Zip Code" value={personal.zipCode} />
        </SettingsInfoSection>
      </div>

      {activeSection && (
        <SettingsEditOverlay<keyof PersonalInfo>
          title={activeSection.title}
          fields={activeSection.fields}
          values={personal}
          onClose={() => setEditingSection(null)}
          onSave={(values) => {
            setPersonal((currentPersonal) => ({
              ...currentPersonal,
              ...values,
            }));
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
