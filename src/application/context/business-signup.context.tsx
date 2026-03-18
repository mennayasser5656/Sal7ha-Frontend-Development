"use client";

import { createContext, useContext, useState } from "react";

type BusinessSignUpData = {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  country: string;
  city: string;
  commercialRegistraionNumber: number;
  taxIdentificationNumber: number;
  owner: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    streetAddress: string;
    country: string;
    city: string;
  };
};

type BusinessSignUpContextType = {
  data: Partial<BusinessSignUpData>;
  setData: (data: Partial<BusinessSignUpData>) => void;
  reset: () => void;
};

const BusinessSignUpContext = createContext<BusinessSignUpContextType | null>(
  null,
);

export function BusinessSignUpProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setDataState] = useState<Partial<BusinessSignUpData>>({});

  const setData = (newData: Partial<BusinessSignUpData>) =>
    setDataState((prev) => ({ ...prev, ...newData }));

  const reset = () => setDataState({});

  return (
    <BusinessSignUpContext.Provider value={{ data, setData, reset }}>
      {children}
    </BusinessSignUpContext.Provider>
  );
}

export function useBusinessSignUp() {
  const context = useContext(BusinessSignUpContext);
  if (!context)
    throw new Error(
      "useBusinessSignUp must be used within BusinessSignUpProvider",
    );
  return context;
}
