import argon2 from "argon2";

export type UserRole =
  | "FARMER"
  | "CUSTOMER"
  | "DRIVER"
  | "FARMER_AGENT"
  | "ADMIN";

export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return argon2.verify(hashedPassword, password);
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // If it starts with 0, replace with 254
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  }

  // If it doesn't start with 254, add it
  if (!cleaned.startsWith("254")) {
    cleaned = "254" + cleaned;
  }

  return cleaned;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const formatted = formatPhoneNumber(phone);
  // Kenyan phone numbers should be 12 digits starting with 254
  return /^254\d{9}$/.test(formatted);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getRoleRedirectPath = (role: UserRole): string => {
  switch (role) {
    case "FARMER":
      return "/farmer/dashboard";
    case "CUSTOMER":
      return "/customer/marketplace";
    case "DRIVER":
      return "/driver/dashboard";
    case "FARMER_AGENT":
      return "/agent/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    default:
      return "/";
  }
};
