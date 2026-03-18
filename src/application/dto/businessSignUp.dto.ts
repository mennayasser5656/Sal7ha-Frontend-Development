export type BusinessSignUpDto = {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  country: string;
  city: string;
  commercialRegistraionNumber: number;
  taxIdentificationNumber: number;
  businessOwner: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    streetAddress: string;
    country: string;
    city: string;
  };
};

export type AuthResponse = {
  access_token: string;
};