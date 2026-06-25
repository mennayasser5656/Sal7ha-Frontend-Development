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
  getAccountProfile,
  updateAccountProfile,
} from "@/infrastructure/services/account.service";
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
  firstName: "",
  lastName: "",
  birthDate: "",
  country: "",
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
};

function fromApiDate(value: string | null | undefined) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${month}/${day}/${year}` : value;
}

function toApiDate(value: string) {
  if (!value) return null;
  const [month, day, year] = value.split("/");
  return year && month && day ? `${year}-${month}-${day}` : value;
}

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

  useEffect(() => {
    async function loadProfile() {
      const profile = await getAccountProfile();
      const address = (profile.address ?? {}) as Partial<PersonalInfo>;
      setPersonal({
        firstName: profile.firstName,
        lastName: profile.lastName,
        birthDate: fromApiDate(profile.birthDate),
        country: String(address.country ?? ""),
        streetAddress: String(address.streetAddress ?? ""),
        city: String(address.city ?? ""),
        state: String(address.state ?? ""),
        zipCode: String(address.zipCode ?? ""),
      });
    }

    void loadProfile();
  }, []);

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
          onSave={async (values) => {
            const nextPersonal = { ...personal, ...values };
            setPersonal(nextPersonal);
            await updateAccountProfile({
              firstName: nextPersonal.firstName,
              lastName: nextPersonal.lastName,
              birthDate: toApiDate(nextPersonal.birthDate),
              address: {
                country: nextPersonal.country,
                streetAddress: nextPersonal.streetAddress,
                city: nextPersonal.city,
                state: nextPersonal.state,
                zipCode: nextPersonal.zipCode,
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
