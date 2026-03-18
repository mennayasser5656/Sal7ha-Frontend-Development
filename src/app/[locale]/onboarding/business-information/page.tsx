"use client";

import { useState } from "react";
import {
  FaCar,
  FaTruck,
  FaMotorcycle,
  FaCogs,
  FaUsers,
  FaUserFriends,
  FaBuilding,
} from "react-icons/fa";
import FormRow from "@/presentation/components/form/FormRow/FormRow";
import FormTextField from "@/presentation/components/form/FormTextField/FormTextField";
import FormSelectField from "@/presentation/components/form/FormSelectField/FormSelectField";
import ChoiceCard from "@/presentation/components/form/ChoiceCard/ChoiceCard";
import GetStartedButton from "@/presentation/components/form/GetStartedButton/GetStartedButton";
import { useOnboardingSteps } from "@/application/hooks/useOnboardingSteps";
import { validateStep } from "@/domain/validation/validation";
import { businessInformationSchema } from "@/domain/validation/schema";
import layoutStyles from "../Onboarding.module.css";
import styles from "./BusinessInformation.module.css";

const COUNTRIES = [
  { value: "sa", label: "Saudi Arabia" },
  { value: "ae", label: "United Arab Emirates" },
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "eg", label: "Egypt" },
  { value: "jo", label: "Jordan" },
  { value: "kw", label: "Kuwait" },
  { value: "bh", label: "Bahrain" },
  { value: "qa", label: "Qatar" },
  { value: "om", label: "Oman" },
];

const BUSINESS_TYPES = [
  {
    id: "general-repair",
    title: "General Repair Shop",
    description: "Full-service auto repair and maintenance",
    icon: <FaCar />,
  },
  {
    id: "specialized",
    title: "Specialized Workshop",
    description: "Focused on specific systems like engine, transmission, or AC",
    icon: <FaCogs />,
  },
  {
    id: "body-paint",
    title: "Body & Paint Shop",
    description: "Collision repair, dent removal, and painting services",
    icon: <FaTruck />,
  },
  {
    id: "quick-service",
    title: "Quick Service Center",
    description: "Oil changes, tire rotation, and fast maintenance",
    icon: <FaMotorcycle />,
  },
];

const EMPLOYEE_COUNTS = [
  {
    id: "small",
    title: "1 - 5 Employees",
    description: "Small team workshop",
    icon: <FaUserFriends />,
  },
  {
    id: "medium",
    title: "6 - 15 Employees",
    description: "Mid-sized operation",
    icon: <FaUsers />,
  },
  {
    id: "large",
    title: "16+ Employees",
    description: "Large service center",
    icon: <FaBuilding />,
  },
];

type Errors = Partial<Record<string, string>>;

export default function BusinessInformationPage() {
  const { goToNextStep } = useOnboardingSteps();

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [country, setCountry] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function handleContinue() {
    const result = validateStep(businessInformationSchema, {
      businessName,
      businessType,
      employeeCount,
      location: { country, streetAddress, city, state, zipCode },
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
        style={{ animationDelay: `${((delay += step), delay)}ms` }}
      >
        <FormRow title="Business Name">
          <FormTextField
            label="Business Name"
            placeholder='Ex: "Al-Faisal Auto Workshop"'
            span={12}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            error={errors["businessName"]}
            required
          />
        </FormRow>
      </div>

      <div
        className={`${styles.section} ${layoutStyles.animated}`}
        style={{ animationDelay: `${((delay += step), delay)}ms` }}
      >
        <FormRow title="Shop Location">
          <FormSelectField
            label="Country"
            placeholder="Select a country"
            span={12}
            options={COUNTRIES}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            error={errors["location.country"]}
            required
          />
        </FormRow>

        <FormRow>
          <FormTextField
            label="Street Address"
            placeholder='Ex: "123 Industrial Area"'
            span={12}
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            error={errors["location.streetAddress"]}
            required
          />
        </FormRow>

        <FormRow>
          <FormTextField
            label="City"
            placeholder='Ex: "Riyadh"'
            span={4}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            error={errors["location.city"]}
            required
          />
          <FormTextField
            label="State"
            placeholder='Ex: "Riyadh Region"'
            span={4}
            value={state}
            onChange={(e) => setState(e.target.value)}
            error={errors["location.state"]}
            required
          />
          <FormTextField
            label="Zip Code"
            placeholder='Ex: "12345"'
            span={4}
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            error={errors["location.zipCode"]}
            required
          />
        </FormRow>
      </div>

      <div
        className={`${styles.section} ${layoutStyles.animated}`}
        style={{ animationDelay: `${((delay += step), delay)}ms` }}
      >
        <span className={styles.sectionTitle}>Business Type</span>
        <div className={styles.cardList}>
          {BUSINESS_TYPES.map((type) => (
            <ChoiceCard
              key={type.id}
              title={type.title}
              description={type.description}
              icon={type.icon}
              selected={businessType === type.id}
              onClick={() => setBusinessType(type.id)}
            />
          ))}
        </div>
        {errors["businessType"] && (
          <p className={styles.choiceError}>{errors["businessType"]}</p>
        )}
      </div>

      <div
        className={`${styles.section} ${layoutStyles.animated}`}
        style={{ animationDelay: `${((delay += step), delay)}ms` }}
      >
        <span className={styles.sectionTitle}>Number of Employees</span>
        <div className={styles.cardList}>
          {EMPLOYEE_COUNTS.map((option) => (
            <ChoiceCard
              key={option.id}
              title={option.title}
              description={option.description}
              icon={option.icon}
              selected={employeeCount === option.id}
              onClick={() => setEmployeeCount(option.id)}
            />
          ))}
        </div>
        {errors["employeeCount"] && (
          <p className={styles.choiceError}>{errors["employeeCount"]}</p>
        )}
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
