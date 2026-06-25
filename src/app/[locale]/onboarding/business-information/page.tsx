"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { validateStep } from "@/domain/validation/validation";
import { businessInformationSchema } from "@/domain/validation/schema";
import { useBusinessSignUp } from "@/application/context/business-signup.context";
import { authApi } from "@/infrastructure/api/auth.api";
import { apiClient } from "@/infrastructure/api/client";
import { DEMO_BUSINESS_ACCOUNT } from "@/application/config/demo-business-account";
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
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const { data, setData, reset } = useBusinessSignUp();

  const [businessName, setBusinessName] = useState(
    data.name ?? DEMO_BUSINESS_ACCOUNT.business.name,
  );
  const [phoneNumber, setPhoneNumber] = useState(
    data.phoneNumber ?? DEMO_BUSINESS_ACCOUNT.business.phoneNumber,
  );
  const [commercialRegistrationNumber, setCommercialRegistrationNumber] =
    useState(
      data.commercialRegistrationNumber
        ? String(data.commercialRegistrationNumber)
        : DEMO_BUSINESS_ACCOUNT.business.commercialRegistrationNumber,
    );
  const [taxIdentificationNumber, setTaxIdentificationNumber] = useState(
    data.taxIdentificationNumber
      ? String(data.taxIdentificationNumber)
      : DEMO_BUSINESS_ACCOUNT.business.taxIdentificationNumber,
  );
  const [businessType, setBusinessType] = useState(
    data.businessType ?? DEMO_BUSINESS_ACCOUNT.business.businessType,
  );
  const [employeeCount, setEmployeeCount] = useState(
    data.employeeCount ?? DEMO_BUSINESS_ACCOUNT.business.employeeCount,
  );
  const [country, setCountry] = useState(
    data.country ?? DEMO_BUSINESS_ACCOUNT.business.country,
  );
  const [streetAddress, setStreetAddress] = useState(
    data.streetAddress ?? DEMO_BUSINESS_ACCOUNT.business.streetAddress,
  );
  const [city, setCity] = useState(
    data.city ?? DEMO_BUSINESS_ACCOUNT.business.city,
  );
  const [state, setState] = useState(
    data.state ?? DEMO_BUSINESS_ACCOUNT.business.state,
  );
  const [zipCode, setZipCode] = useState(
    data.zipCode ?? DEMO_BUSINESS_ACCOUNT.business.zipCode,
  );
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleContinue() {
    const result = validateStep(businessInformationSchema, {
      businessName,
      phoneNumber,
      commercialRegistrationNumber,
      taxIdentificationNumber,
      businessType,
      employeeCount,
      location: { country, streetAddress, city, state, zipCode },
    });

    if (!result.success) {
      setErrors(result.errors as Errors);
      return;
    }

    if (!data.email || !data.password || !data.owner) {
      setFormError("Please complete the signup and owner information steps first.");
      return;
    }

    setErrors({});
    setFormError("");
    setIsSubmitting(true);

    try {
      setData({
        name: businessName,
        businessType,
        employeeCount,
        phoneNumber,
        country,
        streetAddress,
        city,
        state,
        zipCode,
        commercialRegistrationNumber: Number(commercialRegistrationNumber),
        commercialRegistraionNumber: Number(commercialRegistrationNumber),
        taxIdentificationNumber: Number(taxIdentificationNumber),
      });

      await authApi.signUp({
        email: data.email,
        password: data.password,
        name: businessName,
        phoneNumber,
        country,
        city,
        commercialRegistrationNumber: Number(commercialRegistrationNumber),
        taxIdentificationNumber: Number(taxIdentificationNumber),
        businessOwner: {
          firstName: data.owner.firstName,
          lastName: data.owner.lastName,
          email: data.owner.email,
          phoneNumber: data.owner.phoneNumber,
          streetAddress: data.owner.streetAddress,
          country: data.owner.country,
          city: data.owner.city,
          state: data.owner.state,
          zipCode: data.owner.zipCode,
        },
      });

      await apiClient("/onboarding/business-information", {
        method: "POST",
        body: {
          businessName,
          businessType,
          employeeCount,
          location: { country, streetAddress, city, state, zipCode },
        },
      });

      reset();
      router.push(`/${params.locale}/dashboard`);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not create business.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <FormTextField
            label="Business Phone"
            placeholder='Ex: "+201001234567"'
            span={12}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            error={errors["phoneNumber"]}
            required
          />
          <FormTextField
            label="Commercial Registration Number"
            placeholder="Ex: 123456789"
            span={6}
            value={commercialRegistrationNumber}
            onChange={(e) => setCommercialRegistrationNumber(e.target.value)}
            error={errors["commercialRegistrationNumber"]}
            required
          />
          <FormTextField
            label="Tax Identification Number"
            placeholder="Ex: 987654321"
            span={6}
            value={taxIdentificationNumber}
            onChange={(e) => setTaxIdentificationNumber(e.target.value)}
            error={errors["taxIdentificationNumber"]}
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
        {formError && <p className={styles.choiceError}>{formError}</p>}
        {isSubmitting && <p className={styles.choiceError}>Creating account...</p>}
      </div>
    </div>
  );
}
