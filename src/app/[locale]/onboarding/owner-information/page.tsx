"use client";

import { useState } from "react";
import FormRow from "@/presentation/components/form/FormRow/FormRow";
import FormTextField from "@/presentation/components/form/FormTextField/FormTextField";
import FormSelectField from "@/presentation/components/form/FormSelectField/FormSelectField";
import GetStartedButton from "@/presentation/components/form/GetStartedButton/GetStartedButton";
import { useOnboardingSteps } from "@/application/hooks/useOnboardingSteps";
import { validateStep } from "@/domain/validation/validation";
import { ownerInformationSchema } from "@/domain/validation/schema";
import { useBusinessSignUp } from "@/application/context/business-signup.context";
import { DEMO_BUSINESS_ACCOUNT } from "@/application/config/demo-business-account";
import layoutStyles from "../Onboarding.module.css";
import styles from "./OwnerInformation.module.css";

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

type Errors = Partial<Record<string, string>>;

export default function OwnerInformationPage() {
  const { goToNextStep } = useOnboardingSteps();
  const { data, setData } = useBusinessSignUp();

  const [firstName, setFirstName] = useState(
    data.owner?.firstName ?? DEMO_BUSINESS_ACCOUNT.owner.firstName,
  );
  const [lastName, setLastName] = useState(
    data.owner?.lastName ?? DEMO_BUSINESS_ACCOUNT.owner.lastName,
  );
  const [email, setEmail] = useState(
    data.owner?.email ?? data.email ?? DEMO_BUSINESS_ACCOUNT.email,
  );
  const [phoneNumber, setPhoneNumber] = useState(
    data.owner?.phoneNumber ?? DEMO_BUSINESS_ACCOUNT.owner.phoneNumber,
  );
  const [country, setCountry] = useState(
    data.owner?.country ?? DEMO_BUSINESS_ACCOUNT.owner.country,
  );
  const [streetAddress, setStreetAddress] = useState(
    data.owner?.streetAddress ?? DEMO_BUSINESS_ACCOUNT.owner.streetAddress,
  );
  const [city, setCity] = useState(
    data.owner?.city ?? DEMO_BUSINESS_ACCOUNT.owner.city,
  );
  const [state, setState] = useState(
    data.owner?.state ?? DEMO_BUSINESS_ACCOUNT.owner.state,
  );
  const [zipCode, setZipCode] = useState(
    data.owner?.zipCode ?? DEMO_BUSINESS_ACCOUNT.owner.zipCode,
  );
  const [errors, setErrors] = useState<Errors>({});

  function handleContinue() {
    const result = validateStep(ownerInformationSchema, {
      firstName,
      lastName,
      email,
      phoneNumber,
      location: { country, streetAddress, city, state, zipCode },
    });

    if (!result.success) {
      setErrors(result.errors as Errors);
      return;
    }

    setErrors({});
    setData({
      owner: {
        firstName,
        lastName,
        email,
        phoneNumber,
        streetAddress,
        country,
        city,
        state,
        zipCode,
      },
    });
    goToNextStep();
  }

  let delay = 0;
  const step = 150;

  return (
    <div className={styles.screen}>
      <div
        className={layoutStyles.animated}
        style={{ animationDelay: `${(delay += step, delay)}ms` }}
      >
        <FormRow title="Business Owner Name">
          <FormTextField
            label="First Name"
            placeholder='Ex: "John"'
            span={6}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={errors["firstName"]}
            required
          />
          <FormTextField
            label="Last Name"
            placeholder='Ex: "Doe"'
            span={6}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={errors["lastName"]}
            required
          />
        </FormRow>
      </div>

      <div
        className={layoutStyles.animated}
        style={{ animationDelay: `${(delay += step, delay)}ms` }}
      >
        <FormRow title="Email Address">
          <FormTextField
            label="Email"
            placeholder="Ex: john@example.com"
            span={12}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors["email"]}
            required
          />
          <FormTextField
            label="Phone Number"
            placeholder="Ex: +201001234567"
            span={12}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            error={errors["phoneNumber"]}
            required
          />
        </FormRow>
      </div>

      <div
        className={`${styles.section} ${layoutStyles.animated}`}
        style={{ animationDelay: `${(delay += step, delay)}ms` }}
      >
        <FormRow title="Location Details">
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
            placeholder='Ex: "123 Main Street"'
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
            span={6}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            error={errors["location.city"]}
            required
          />
          <FormTextField
            label="State"
            placeholder='Ex: "Riyadh Region"'
            span={3}
            value={state}
            onChange={(e) => setState(e.target.value)}
            error={errors["location.state"]}
            required
          />
          <FormTextField
            label="Zip Code"
            placeholder='Ex: "12345"'
            span={3}
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            error={errors["location.zipCode"]}
            required
          />
        </FormRow>
      </div>

      <div
        className={layoutStyles.animated}
        style={{ animationDelay: `${(delay += step, delay)}ms` }}
      >
        <GetStartedButton label="Continue" onClick={handleContinue} />
      </div>
    </div>
  );
}
