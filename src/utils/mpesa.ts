// M-Pesa utility functions

/**
 * Format phone number for M-Pesa API
 * Converts various phone formats to 254XXXXXXXXX format
 */
export const formatMpesaPhone = (phone: string): string => {
  // Remove all spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");

  // Handle different formats
  if (cleaned.startsWith("+254")) {
    return cleaned.substring(1); // Remove the + sign
  } else if (cleaned.startsWith("254")) {
    return cleaned;
  } else if (cleaned.startsWith("0")) {
    return "254" + cleaned.substring(1);
  } else if (
    cleaned.length === 9 &&
    (cleaned.startsWith("7") || cleaned.startsWith("1"))
  ) {
    return "254" + cleaned;
  }

  // Return as is if format is unknown
  return cleaned;
};

/**
 * Validate Kenyan phone number
 */
export const validateKenyanPhone = (phone: string): boolean => {
  const formatted = formatMpesaPhone(phone);
  // Kenyan numbers: 254 followed by 7/1 and 8 more digits
  const regex = /^254[71]\d{8}$/;
  return regex.test(formatted);
};

/**
 * Display phone number in user-friendly format
 */
export const displayPhone = (phone: string): string => {
  const formatted = formatMpesaPhone(phone);
  if (formatted.startsWith("254")) {
    return "+254 " + formatted.substring(3, 6) + " " + formatted.substring(6);
  }
  return phone;
};

/**
 * Validate M-Pesa amount
 */
export const validateMpesaAmount = (
  amount: number,
): { valid: boolean; message?: string } => {
  if (amount < 1) {
    return { valid: false, message: "Amount must be at least KES 1" };
  }
  if (amount > 150000) {
    return { valid: false, message: "Amount cannot exceed KES 150,000" };
  }
  if (!Number.isInteger(amount)) {
    return { valid: false, message: "Amount must be a whole number" };
  }
  return { valid: true };
};

/**
 * Poll payment status
 */
export const pollPaymentStatus = async (
  transactionId: string,
  maxAttempts: number = 30,
  interval: number = 2000,
): Promise<{ success: boolean; status: string; data?: any }> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`/api/payments/status/${transactionId}`);
      const data = await response.json();

      if (data.status === "COMPLETED") {
        return { success: true, status: "COMPLETED", data };
      } else if (data.status === "FAILED" || data.status === "CANCELLED") {
        return { success: false, status: data.status, data };
      }

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, interval));
    } catch (error) {
      console.error("Error polling payment status:", error);
    }
  }

  return { success: false, status: "TIMEOUT" };
};
