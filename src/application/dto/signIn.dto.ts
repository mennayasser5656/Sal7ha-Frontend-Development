export type SignInDto = {
  email: string;
  password: string;
  role: "client" | "business";
};

