import { z } from "zod";

// ── Shared primitives ──

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Please enter an email.")
  .regex(
    /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
    "Please enter a valid email address."
  );

export const passwordSchema = z
  .string()
  .min(12, "Must be at least 12 characters.")
  .regex(/[a-z]/, "Include at least one lowercase letter.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/\d/, "Include at least one number.")
  .regex(/[^A-Za-z0-9]/, "Include at least one symbol.");

export const isTextOnlySchema = (allowSpaces: boolean = true) => {
  if (allowSpaces) {
    return z.string().regex(/^[A-Za-z\s]+$/, {
      message: "Must contain only letters and spaces",
    });
  }
  return z.string().regex(/^[A-Za-z]+$/, {
    message: "Must contain only letters",
  });
};

export const isNumericOnlySchema = z
  .string()
  .regex(/^[0-9]+$/, "Please enter a number.");

const requiredTextSchema = (message: string) => z.string().trim().min(1, message);

// ── Auth schemas ──

export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
});

export type AuthSchema = z.infer<typeof authSchema>;

// ── Shared location schema ──

export const locationSchema = z.object({
  country: z.string().min(1, "Please select a country."),
  streetAddress: z.string().min(1, "Street address is required."),
  city: isTextOnlySchema(true).min(1, "City is required."),
  state: isTextOnlySchema(true).min(1, "State is required."),
  zipCode: isNumericOnlySchema,
});

export type LocationData = z.infer<typeof locationSchema>;

// ── Step 1: Owner Information ──

export const ownerInformationSchema = z.object({
  firstName: isTextOnlySchema(false).min(1, "First name is required."),
  lastName: isTextOnlySchema(false).min(1, "Last name is required."),
  email: emailSchema,
  phoneNumber: z.string().trim().min(1, "Phone number is required."),
  location: locationSchema,
});

export type OwnerInformationData = z.infer<typeof ownerInformationSchema>;

// ── Step 2: Business Information ──

export const businessInformationSchema = z.object({
  businessName: z.string().min(1, "Business name is required."),
  phoneNumber: z.string().trim().min(1, "Business phone number is required."),
  commercialRegistrationNumber: isNumericOnlySchema,
  taxIdentificationNumber: isNumericOnlySchema,
  businessType: z.enum(
    ["general-repair", "specialized", "body-paint", "quick-service"],
    { message: "Please select a business type." }
  ),
  employeeCount: z.enum(["small", "medium", "large"], {
    message: "Please select the number of employees.",
  }),
  location: locationSchema,
});

export type BusinessInformationData = z.infer<typeof businessInformationSchema>;

export const bankDetailsSchema = z.object({
  bankName: requiredTextSchema("Please choose a bank."),
  accountHolder: requiredTextSchema("Account holder name is required.").regex(
    /^[A-Za-z\s]+$/,
    "Account holder name must contain only letters and spaces."
  ),
  accountNumber: requiredTextSchema("Account number is required.")
    .regex(/^[0-9]+$/, "Account number must contain digits only.")
    .min(6, "Account number must be at least 6 digits.")
    .max(34, "Account number must be 34 digits or fewer."),
  iban: z
    .string()
    .trim()
    .min(1, "IBAN is required.")
    .transform((value) => value.replace(/\s+/g, "").toUpperCase())
    .pipe(
      z
        .string()
        .regex(
          /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/,
          "Please enter a valid IBAN."
        )
    ),
  swift: z
    .string()
    .trim()
    .min(1, "SWIFT / BIC is required.")
    .transform((value) => value.toUpperCase())
    .pipe(
      z
        .string()
        .regex(
          /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
          "Please enter a valid SWIFT / BIC."
        )
    ),
  branch: requiredTextSchema("Branch name is required.").regex(
    /^[A-Za-z0-9\s.'&-]+$/,
    "Branch name contains unsupported characters."
  ),
  billingEmail: emailSchema,
});

export type BankDetailsData = z.infer<typeof bankDetailsSchema>;

export const twoFactorSchema = z
  .object({
    method: z.enum(["sms", "authenticator"], {
      message: "Please choose a MFA method.",
    }),
    phone: z.string().trim().optional(),
  })
  .superRefine((data, context) => {
    if (data.method !== "sms") {
      return;
    }

    if (!data.phone) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Phone number is required for SMS MFA.",
      });
      return;
    }

    if (!/^\+?[0-9\s()-]{8,20}$/.test(data.phone)) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Please enter a valid phone number.",
      });
    }
  });

export type TwoFactorData = z.infer<typeof twoFactorSchema>;

// ── Full onboarding aggregate ──

export const onboardingSchema = z.object({
  ownerInformation: ownerInformationSchema,
  businessInformation: businessInformationSchema,
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
